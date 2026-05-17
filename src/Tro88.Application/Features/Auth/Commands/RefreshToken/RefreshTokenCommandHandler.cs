using MediatR;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Auth.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Auth.Commands.RefreshToken;

public sealed class RefreshTokenCommandHandler
    : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IJwtService _jwt;

    public RefreshTokenCommandHandler(
        IApplicationDbContext db,
        IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponseDto> Handle(
        RefreshTokenCommand request,
        CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u =>
                u.RefreshToken == request.RefreshToken,
                ct);

        if (user is null)
            throw new ForbiddenException(
                ErrorMessages.REFRESH_TOKEN_EXPIRED);

        if (user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            user.RevokeRefreshToken();
            await _db.SaveChangesAsync(ct);
            throw new ForbiddenException(
                ErrorMessages.REFRESH_TOKEN_EXPIRED);
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