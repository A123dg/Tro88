using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Dashboard.Queries.GetOwnerDashboard;
using Tro88.Application.Features.Dashboard.Queries.GetTenantDashboard;

namespace Tro88.API.Controllers;

[Authorize]
public class DashboardController : BaseApiController
{
    [HttpGet("owner")]
    public async Task<IActionResult> GetOwnerDashboard()
    {
        var result = await Mediator.Send(new GetOwnerDashboardQuery());
        return Ok(ApiResponse<OwnerDashboardDto>.Ok(result));
    }

    [HttpGet("tenant")]
    public async Task<IActionResult> GetTenantDashboard()
    {
        var result = await Mediator.Send(new GetTenantDashboardQuery());
        return Ok(ApiResponse<TenantDashboardDto>.Ok(result));
    }
}