using MediatR;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Auth.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Auth.Commands.Login;

public sealed class LoginCommandHandler
    : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtService _jwt;

    public LoginCommandHandler(
        IApplicationDbContext db,
        IPasswordHasher hasher,
        IJwtService jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponseDto> Handle(
        LoginCommand request,
        CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(
            u => u.Email == request.Email.ToLowerInvariant(),
            ct);

        if (user is null)
            throw new ForbiddenException(
                ErrorMessages.INVALID_CREDENTIALS);

        if (!user.IsActive)
            throw new ForbiddenException(
                ErrorMessages.ACCOUNT_DEACTIVATED);

        if (!string.IsNullOrEmpty(user.GoogleId))
            throw new ForbiddenException(
                ErrorMessages.INVALID_CREDENTIALS);

        if (!_hasher.Verify(request.Password, user.PasswordHash))
            throw new ForbiddenException(
                ErrorMessages.INVALID_CREDENTIALS);

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