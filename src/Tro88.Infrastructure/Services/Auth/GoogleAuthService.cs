using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Infrastructure.Services.Auth;

public class GoogleAuthSettings
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string AuthorizationEndpoint { get; set; } = "https://accounts.google.com/o/oauth2/v2/auth";
    public string TokenEndpoint { get; set; } = "https://oauth2.googleapis.com/token";
}

public class GoogleAuthService : IGoogleAuthService
{
    private readonly GoogleAuthSettings _settings;
    private readonly HttpClient _http;

    public GoogleAuthService(
        IOptions<GoogleAuthSettings> settings,
        HttpClient http)
    {
        _settings = settings.Value;
        _http = http;
    }

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

    public string BuildAuthorizationUrl(string redirectUri, string? state = null)
    {
        if (string.IsNullOrWhiteSpace(_settings.ClientId))
            throw new ForbiddenException("Google ClientId is not configured");

        var query = new Dictionary<string, string?>
        {
            ["client_id"] = _settings.ClientId,
            ["redirect_uri"] = redirectUri,
            ["response_type"] = "code",
            ["scope"] = "openid email profile",
            ["access_type"] = "offline",
            ["prompt"] = "select_account",
            ["state"] = state
        };

        return $"{_settings.AuthorizationEndpoint}?{BuildQuery(query)}";
    }

    public async Task<string> ExchangeCodeForIdTokenAsync(
        string code,
        string redirectUri,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.ClientId))
            throw new ForbiddenException("Google ClientId is not configured");

        var form = new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = _settings.ClientId,
            ["redirect_uri"] = redirectUri,
            ["grant_type"] = "authorization_code"
        };

        if (!string.IsNullOrWhiteSpace(_settings.ClientSecret))
            form["client_secret"] = _settings.ClientSecret;

        using var response = await _http.PostAsync(
            _settings.TokenEndpoint,
            new FormUrlEncodedContent(form),
            ct);

        var body = await response.Content.ReadAsStringAsync(ct);
        GoogleTokenResponse? token = null;

        if (!string.IsNullOrWhiteSpace(body))
        {
            try
            {
                token = JsonSerializer.Deserialize<GoogleTokenResponse>(body);
            }
            catch (JsonException)
            {
                // The raw body is included below for diagnostics.
            }
        }

        if (!response.IsSuccessStatusCode || string.IsNullOrWhiteSpace(token?.IdToken))
        {
            var error = token?.ErrorDescription
                ?? token?.Error
                ?? body
                ?? "Google token exchange failed";
            throw new ForbiddenException(error);
        }

        return token.IdToken;
    }

    private static string BuildQuery(Dictionary<string, string?> values)
        => string.Join("&", values
            .Where(item => !string.IsNullOrWhiteSpace(item.Value))
            .Select(item =>
                $"{Uri.EscapeDataString(item.Key)}={Uri.EscapeDataString(item.Value!)}"));

    private sealed class GoogleTokenResponse
    {
        [JsonPropertyName("id_token")]
        public string? IdToken { get; set; }

        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("error_description")]
        public string? ErrorDescription { get; set; }
    }
}
