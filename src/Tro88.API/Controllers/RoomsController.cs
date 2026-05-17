using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Rooms.Commands.CreateRoom;
using Tro88.Application.Features.Rooms.Commands.UpdateRoom;
using Tro88.Application.Features.Rooms.Commands.DeleteRoom;
using Tro88.Application.Features.Rooms.Commands.ChangeRoomStatus;
using Tro88.Application.Features.Rooms.Commands.UploadRoomImage;
using Tro88.Application.Features.Rooms.Queries.GetRooms;
using Tro88.Application.Features.Rooms.Queries.GetRoomById;

namespace Tro88.API.Controllers;

[Authorize]
public class RoomsController : BaseApiController
{
    [HttpGet("house/{houseId}")]
    public async Task<IActionResult> GetRooms(Guid houseId, [FromQuery] GetRoomsQuery query)
    {
        query = query with { HouseId = houseId };
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<RoomDto>>.Ok(
            result.Items,
            metaData: new MetaData
            {
                Page = query.Page,
                PageSize = query.PageSize,
                Total = result.Total,
                TotalPage = result.TotalPage
            }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomById(Guid id)
    {
        var result = await Mediator.Send(new GetRoomByIdQuery(id));
        return Ok(ApiResponse<RoomDto>.Ok(result));
    }

    [HttpPost("house/{houseId}")]
    public async Task<IActionResult> CreateRoom(Guid houseId, [FromBody] CreateRoomCommand command)
    {
        command = command with { HouseId = houseId };
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<RoomDto>.Ok(result, SuccessMessages.CREATE_ROOM_SUCCESS));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] UpdateRoomCommand command)
    {
        command = command with { Id = id };
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<RoomDto>.Ok(result, SuccessMessages.UPDATE_ROOM_SUCCESS));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoom(Guid id)
    {
        await Mediator.Send(new DeleteRoomCommand(id));
        return Ok(ApiResponse<object>.Ok(null, SuccessMessages.DELETE_ROOM_SUCCESS));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeRoomStatus(Guid id, [FromBody] ChangeRoomStatusCommand command)
    {
        command = command with { Id = id };
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<RoomDto>.Ok(result, SuccessMessages.CHANGE_ROOM_STATUS_SUCCESS));
    }

    [HttpPost("{id}/images")]
    public async Task<IActionResult> UploadRoomImage(Guid id, IFormFile file)
    {
        var command = new UploadRoomImageCommand(id, file.OpenReadStream(), file.FileName);
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<string>.Ok(result));
    }
}
