using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Users.Commands.ChangePassword;
using Tro88.Application.Features.Users.Commands.UpdateProfile;
using Tro88.Application.Features.Users.Commands.UploadAvatar;
using Tro88.Application.Features.Users.DTOs;
using Tro88.Application.Features.Users.Queries.GetCurrentUser;

namespace Tro88.API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var result = await Mediator.Send(new GetCurrentUserQuery());
        return Ok(ApiResponse<UserDto>.Ok(result));
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<UserDto>.Ok(
            result, SuccessMessages.UPDATE_PROFILE_SUCCESS));
    }

    [HttpPost("me/avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        using var stream = file.OpenReadStream();
        var url = await Mediator.Send(
            new UploadAvatarCommand(stream, file.FileName));
        return Ok(ApiResponse<string>.Ok(
            url, SuccessMessages.UPLOAD_AVATAR_SUCCESS));
    }

    [HttpPatch("me/password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordCommand command)
    {
        await Mediator.Send(command);
        return Ok(ApiResponse<object>.Ok(
            null, SuccessMessages.CHANGE_PASSWORD_SUCCESS));
    }
}
