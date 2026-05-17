using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.ServiceFees.Commands.CreateServiceFee;
using Tro88.Application.Features.ServiceFees.Commands.UpdateServiceFee;
using Tro88.Application.Common.Constants;
using Tro88.Application.Features.ServiceFees.Commands.DeleteServiceFee;
using Tro88.Application.Features.ServiceFees.Commands.ToggleServiceFee;
using Tro88.Application.Features.ServiceFees.Queries.GetServiceFees;

namespace Tro88.API.Controllers;

[Authorize]
public class ServiceFeesController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetServiceFees([FromQuery] GetServiceFeesQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<ServiceFeeDto>>.Ok(
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
    public async Task<IActionResult> CreateServiceFee([FromBody] CreateServiceFeeCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ServiceFeeDto>.Ok(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServiceFee(Guid id, [FromBody] UpdateServiceFeeCommand command)
    {
        command = command with { Id = id };
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ServiceFeeDto>.Ok(result));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServiceFee(Guid id)
    {
        await Mediator.Send(new DeleteServiceFeeCommand(id));
        return Ok(ApiResponse<object>.Ok(null));
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> ToggleServiceFee(Guid id)
    {
        var result = await Mediator.Send(new ToggleServiceFeeCommand(id));
        return Ok(ApiResponse<ServiceFeeDto>.Ok(
            result, SuccessMessages.TOGGLE_SERVICE_FEE_SUCCESS));
    }
}
