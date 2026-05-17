using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Maintenance.Commands.AssignMaintenance;
using Tro88.Application.Features.Maintenance.Commands.CreateMaintenanceRequest;
using Tro88.Application.Features.Maintenance.Commands.UpdateMaintenanceStatus;
using Tro88.Application.Features.Maintenance.Queries.GetMaintenanceById;
using Tro88.Application.Features.Maintenance.Queries.GetMaintenanceRequests;

namespace Tro88.API.Controllers;

[Authorize]
public class MaintenanceController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetMaintenanceRequests([FromQuery] GetMaintenanceRequestsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<MaintenanceRequestDto>>.Ok(
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
    public async Task<IActionResult> CreateMaintenanceRequest([FromBody] CreateMaintenanceRequestCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<MaintenanceRequestDto>.Ok(result, SuccessMessages.CREATE_MAINTENANCE_REQUEST_SUCCESS));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMaintenanceById(Guid id)
    {
        var result = await Mediator.Send(new GetMaintenanceByIdQuery(id));
        return Ok(ApiResponse<MaintenanceRequestDto>.Ok(result));
    }

    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> AssignMaintenance(
        Guid id,
        [FromBody] AssignMaintenanceRequest request)
    {
        var result = await Mediator.Send(
            new AssignMaintenanceCommand(id, request.AssignedToUserId));
        return Ok(ApiResponse<MaintenanceRequestDto>.Ok(
            result, SuccessMessages.ASSIGN_MAINTENANCE_SUCCESS));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateMaintenanceStatus(Guid id, [FromBody] UpdateMaintenanceStatusCommand command)
    {
        command = command with { Id = id };
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<MaintenanceRequestDto>.Ok(result));
    }
}

public record AssignMaintenanceRequest(Guid AssignedToUserId);

