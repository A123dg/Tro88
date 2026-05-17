using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Houses.Commands.CreateHouse;
using Tro88.Application.Features.Houses.Commands.UpdateHouse;
using Tro88.Application.Features.Houses.Commands.DeleteHouse;
using Tro88.Application.Features.Houses.Queries.GetHouses;
using Tro88.Application.Features.Houses.Queries.GetHouseById;

namespace Tro88.API.Controllers;

[Authorize]
public class HousesController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetHouses([FromQuery] GetHousesQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<HouseDto>>.Ok(
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
    public async Task<IActionResult> GetHouseById(Guid id)
    {
        var result = await Mediator.Send(new GetHouseByIdQuery(id));
        return Ok(ApiResponse<HouseDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateHouse([FromBody] CreateHouseCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<HouseDto>.Ok(result, SuccessMessages.CREATE_HOUSE_SUCCESS));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHouse(Guid id, [FromBody] UpdateHouseCommand command)
    {
        command = command with { Id = id };
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<HouseDto>.Ok(result, SuccessMessages.UPDATE_HOUSE_SUCCESS));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHouse(Guid id)
    {
        await Mediator.Send(new DeleteHouseCommand(id));
        return Ok(ApiResponse<object>.Ok(null, SuccessMessages.DELETE_HOUSE_SUCCESS));
    }
}
