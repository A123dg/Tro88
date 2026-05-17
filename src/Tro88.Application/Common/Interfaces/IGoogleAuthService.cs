namespace Tro88.Application.Common.Interfaces;

public interface IGoogleAuthService
{
    Task<GoogleUserInfo> VerifyIdTokenAsync(string idToken, CancellationToken ct = default);
}

public sealed record GoogleUserInfo(
    string GoogleId,
    string Email,
    string FullName,
    string? AvatarUrl);