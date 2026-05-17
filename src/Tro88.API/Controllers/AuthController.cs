using Microsoft.AspNetCore.Authorization;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Auth.Commands.Login;
using Tro88.Application.Features.Auth.Commands.RefreshToken;
using Tro88.Application.Features.Auth.Commands.Register;
using Tro88.Application.Features.Auth.Commands.GoogleLogin;
using Tro88.Application.Features.Auth.Commands.Logout;

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
}