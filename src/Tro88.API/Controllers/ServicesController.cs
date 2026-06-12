using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common;
using Tro88.Application.Services;
using Tro88.Application.DTOs.Responses;

namespace Tro88.API.Controllers;

[Authorize]
public class ServicesController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetServices([FromQuery] GetServicesQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<ServiceDto>>.Ok(
            result.Items,
            metaData: new MetaData
            {
                Page = query.Page,
                PageSize = query.PageSize,
                Total = result.Total,
                TotalPage = result.TotalPage
            }));
    }

    [HttpPost]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ServiceDto>.Ok(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(Guid id, [FromBody] UpdateServiceCommand command)
    {
        command = command with { Id = id };
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ServiceDto>.Ok(result));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(Guid id)
    {
        await Mediator.Send(new DeleteServiceCommand(id));
        return Ok(ApiResponse<object>.Ok(null));
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> ToggleService(Guid id)
    {
        var result = await Mediator.Send(new ToggleServiceCommand(id));
        return Ok(ApiResponse<ServiceDto>.Ok(result));
    }
}

