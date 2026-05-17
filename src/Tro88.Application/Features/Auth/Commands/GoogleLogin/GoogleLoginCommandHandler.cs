using MediatR;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Auth.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Auth.Commands.GoogleLogin;

public sealed class GoogleLoginCommandHandler
    : IRequestHandler<GoogleLoginCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IGoogleAuthService _google;
    private readonly IJwtService _jwt;

    public GoogleLoginCommandHandler(
        IApplicationDbContext db,
        IGoogleAuthService google,
        IJwtService jwt)
    {
        _db = db;
        _google = google;
        _jwt = jwt;
    }

    public async Task<AuthResponseDto> Handle(
        GoogleLoginCommand request,
        CancellationToken ct)
    {
        var googleUser = await _google
            .VerifyIdTokenAsync(request.IdToken, ct);

        var user = await _db.Users
            .FirstOrDefaultAsync(u =>
                u.GoogleId == googleUser.GoogleId ||
                u.Email == googleUser.Email,
                ct);

        if (user is null)
        {
            user = User.CreateFromGoogle(
                googleUser.FullName,
                googleUser.Email,
                googleUser.GoogleId,
                UserRole.Tenant);

            if (!string.IsNullOrEmpty(googleUser.AvatarUrl))
                user.UpdateAvatar(googleUser.AvatarUrl);

            _db.Users.Add(user);
        }
        else if (user.GoogleId is null)
        {
            throw new BusinessRuleException(
                ErrorMessages.EMAIL_ALREADY_REGISTERED);
        }

        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        user.UpdateRefreshToken(refreshToken,
            DateTime.UtcNow.AddDays(30));

        await _db.SaveChangesAsync(ct);

        return new AuthResponseDto(
            accessToken,
            refreshToken,
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString());
    }
}