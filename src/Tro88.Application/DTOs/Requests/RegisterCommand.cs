using MediatR;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record RegisterCommand(
    string FullName,
    string Email,
    string PhoneNumber,
    string Password,
    string Role) : IRequest<AuthResponseDto>
{
public sealed class Handler
    : IRequestHandler<RegisterCommand, AuthResponseDto>
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
        RegisterCommand request,
        CancellationToken ct)
    {
        var exists = await _db.Users.AnyAsync(
            u => u.Email == request.Email.ToLowerInvariant(),
            ct);

        if (exists)
            throw new BusinessRuleException(
                ErrorMessages.EMAIL_ALREADY_REGISTERED);

        var role = Enum.Parse<UserRole>(request.Role, true);
        var hash = _hasher.Hash(request.Password);

        var user = User.CreateUserService(
            request.FullName,
            request.Email,
            request.PhoneNumber,
            hash,
            role);

        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        user.UpdateRefreshToken(refreshToken,
            DateTime.UtcNow.AddDays(30));

        _db.Users.Add(user);
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


