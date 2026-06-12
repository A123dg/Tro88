using MediatR;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record LoginCommand(
    string Username,
    string Password) : IRequest<AuthResponseDto>
{
public sealed class Handler
    : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtService _jwt;

    public Handler(
        IAppDbContext db,
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
        var username = request.Username.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(
            u => u.Email == username ||
                 u.FullName.ToLower() == username,
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
}


