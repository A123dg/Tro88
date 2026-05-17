using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Infrastructure.Services.Auth;

public class GoogleAuthSettings
{
    public string ClientId { get; set; } = string.Empty;
}

public class GoogleAuthService : IGoogleAuthService
{
    private readonly GoogleAuthSettings _settings;

    public GoogleAuthService(IOptions<GoogleAuthSettings> settings)
        => _settings = settings.Value;

    public async Task<GoogleUserInfo> VerifyIdTokenAsync(
        string idToken,
        CancellationToken ct = default)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _settings.ClientId }
        };

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
        }
        catch (InvalidJwtException ex)
        {
            throw new ForbiddenException($"Invalid Google token: {ex.Message}");
        }

        return new GoogleUserInfo(
            payload.Subject,
            payload.Email,
            payload.Name,
            payload.Picture);
    }
}