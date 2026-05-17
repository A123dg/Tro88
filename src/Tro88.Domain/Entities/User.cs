using Tro88.Domain.Entities.Common;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class User : SoftDeleteEntity
{
    public string FullName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string PhoneNumber { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public UserRole Role { get; private set; }
    public string? NationalId { get; private set; }
    public DateTime? DateOfBirth { get; private set; }
    public string? AvatarUrl { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiry { get; private set; }
    public bool IsActive { get; private set; } = true;
    public string? GoogleId { get; private set; }

    public ICollection<House> Houses { get; private set; } = new List<House>();
    public ICollection<Contract> Contracts { get; private set; } = new List<Contract>();
    public ICollection<TenantInRoom> TenantInRooms { get; private set; } = new List<TenantInRoom>();

    private User() { }

    public static User Create(
        string fullName, string email,
        string phoneNumber, string passwordHash,
        UserRole role)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("Full name is required");
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email is required");

        return new User
        {
            FullName = fullName,
            Email = email.ToLowerInvariant(),
            PhoneNumber = phoneNumber,
            PasswordHash = passwordHash,
            Role = role
        };
    }

    public static User CreateFromGoogle(
        string fullName, string email,
        string googleId, UserRole role)
    {
        if (string.IsNullOrWhiteSpace(googleId))
            throw new DomainException("Google ID is required");

        return new User
        {
            FullName = fullName,
            Email = email.ToLowerInvariant(),
            PhoneNumber = string.Empty,
            PasswordHash = string.Empty,
            GoogleId = googleId,
            Role = role
        };
    }

    public void UpdateRefreshToken(string token, DateTime expiry)
    {
        RefreshToken = token;
        RefreshTokenExpiry = expiry;
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiry = null;
    }

    public void UpdateAvatar(string url) => AvatarUrl = url;

    public void UpdatePasswordHash(string passwordHash)
        => PasswordHash = passwordHash;

    public void UpdateProfile(
        string fullName,
        string phoneNumber,
        string? nationalId,
        DateTime? dateOfBirth)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("Full name is required");
        FullName = fullName;
        PhoneNumber = phoneNumber;
        NationalId = nationalId;
        DateOfBirth = dateOfBirth;
    }

    public void Deactivate() => IsActive = false;
}