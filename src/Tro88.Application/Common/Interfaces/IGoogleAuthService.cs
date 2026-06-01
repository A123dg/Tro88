namespace Tro88.Application.Common.Interfaces;

public interface IGoogleAuthService
{
    Task<GoogleUserInfo> VerifyIdTokenAsync(string idToken, CancellationToken ct = default);
    string BuildAuthorizationUrl(string redirectUri, string? state = null);
    Task<string> ExchangeCodeForIdTokenAsync(
        string code,
        string redirectUri,
        CancellationToken ct = default);
}

public sealed record GoogleUserInfo(
    string GoogleId,
    string Email,
    string FullName,
    string? AvatarUrl);
