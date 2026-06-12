using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common;
using Tro88.Application.Services;

namespace Tro88.API.Controllers;

[Authorize]
public class DashboardController : BaseApiController
{
    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        var result = await Mediator.Send(new GetAdminDashboardQuery());
        return Ok(ApiResponse<AdminDashboardDto>.Ok(result));
    }

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

