using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Users.DTOs;

public sealed record UserDto(
    Guid Id,
    string FullName,
    string Email,
    string PhoneNumber,
    string Role,
    string? NationalId,
    DateTime? DateOfBirth,
    string? AvatarUrl,
    bool IsActive,
    DateTime CreatedAt)
{
    public static UserDto FromEntity(User u)
        => new(u.Id, u.FullName, u.Email,
               u.PhoneNumber, u.Role.ToString(),
               u.NationalId, u.DateOfBirth,
               u.AvatarUrl, u.IsActive, u.CreatedAt);
}
