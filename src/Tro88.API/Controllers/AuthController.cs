using Microsoft.AspNetCore.Authorization;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.Common;
using Tro88.Application.Services;

namespace Tro88.API.Controllers;

[AllowAnonymous]
public class AuthController : BaseApiController
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, SuccessMessages.REGISTER_SUCCESS));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, SuccessMessages.LOGIN_SUCCESS));
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, SuccessMessages.GOOGLE_LOGIN_SUCCESS));
    }

    [HttpGet("google/redirect")]
    public IActionResult GoogleRedirect(
        [FromQuery(Name = "redirect_uri")] string? redirectUri,
        [FromQuery] string? state = null)
    {
        var google = HttpContext.RequestServices
            .GetRequiredService<IGoogleAuthService>();

        // Always use backend callback so Google only needs the API URI registered.
        // The frontend return target lives inside state.
        return Redirect(google.BuildAuthorizationUrl(
            BuildBackendGoogleCallbackUri(),
            state));
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallbackRedirect(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        CancellationToken ct)
    {
        var frontendCallback = ResolveFrontendGoogleCallbackUri(state);

        if (!string.IsNullOrWhiteSpace(error))
            return Redirect($"{frontendCallback}?error={Uri.EscapeDataString(error)}");

        if (string.IsNullOrWhiteSpace(code))
            return Redirect($"{frontendCallback}?error=missing_code");

        try
        {
            var google = HttpContext.RequestServices
                .GetRequiredService<IGoogleAuthService>();

            var idToken = await google.ExchangeCodeForIdTokenAsync(
                code,
                BuildBackendGoogleCallbackUri(),
                ct);

            var result = await Mediator.Send(
                new GoogleLoginCommand(idToken, ResolveRoleFromState(state)),
                ct);
            var query = BuildQuery(new Dictionary<string, string?>
            {
                ["accessToken"] = result.AccessToken,
                ["refreshToken"] = result.RefreshToken,
                ["userId"] = result.UserId.ToString(),
                ["fullName"] = result.FullName,
                ["email"] = result.Email,
                ["role"] = result.Role,
                ["state"] = state
            });

            return Redirect($"{frontendCallback}?{query}");
        }
        catch (Exception ex)
        {
            var logger = HttpContext.RequestServices
                .GetRequiredService<ILogger<AuthController>>();
            logger.LogError(ex, "Google OAuth callback failed");

            return Redirect(
                $"{frontendCallback}?error=auth_failed&error_detail={Uri.EscapeDataString(ex.Message)}");
        }
    }

    [HttpPost("google/callback")]
    public async Task<IActionResult> GoogleCallback(
        [FromBody] GoogleCallbackRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Code) ||
            string.IsNullOrWhiteSpace(request.RedirectUri))
            return BadRequest(ApiResponse<object>.Fail("MISSING_GOOGLE_CALLBACK_PARAMS"));

        var google = HttpContext.RequestServices
            .GetRequiredService<IGoogleAuthService>();

        var idToken = await google.ExchangeCodeForIdTokenAsync(
            request.Code,
            request.RedirectUri,
            ct);

        var result = await Mediator.Send(
            new GoogleLoginCommand(idToken, ResolveRoleFromState(request.State)),
            ct);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, SuccessMessages.GOOGLE_LOGIN_SUCCESS));
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, SuccessMessages.REFRESH_TOKEN_SUCCESS));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await Mediator.Send(new LogoutCommand());
        return Ok(ApiResponse<object>.Ok(null, SuccessMessages.LOGOUT_SUCCESS));
    }

    private string BuildBackendGoogleCallbackUri()
        => Url.ActionLink(
            action: nameof(GoogleCallbackRedirect),
            controller: "Auth",
            values: null,
            protocol: Request.Scheme,
            host: Request.Host.ToString())!;

    private static string ResolveFrontendGoogleCallbackUri(string? state)
    {
        const string fallback = "http://localhost:5173/auth/google/callback";

        if (string.IsNullOrWhiteSpace(state))
            return fallback;

        try
        {
            var json = System.Text.Encoding.UTF8.GetString(
                Convert.FromBase64String(state));
            using var doc = System.Text.Json.JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("frontendCallback", out var value))
            {
                var callback = value.GetString();
                if (!string.IsNullOrWhiteSpace(callback))
                    return callback;
            }
        }
        catch
        {
            return fallback;
        }

        return fallback;
    }

    private static string? ResolveRoleFromState(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
            return null;

        try
        {
            var json = System.Text.Encoding.UTF8.GetString(
                Convert.FromBase64String(state));
            using var doc = System.Text.Json.JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("role", out var value))
                return value.GetString();
        }
        catch
        {
            return null;
        }

        return null;
    }

    private static string BuildQuery(Dictionary<string, string?> values)
        => string.Join("&", values
            .Where(item => !string.IsNullOrWhiteSpace(item.Value))
            .Select(item =>
                $"{Uri.EscapeDataString(item.Key)}={Uri.EscapeDataString(item.Value!)}"));
}

public sealed record GoogleCallbackRequest(
    string Code,
    string RedirectUri,
    string? State = null);

