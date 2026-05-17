using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.AuditLogs.DTOs;
using Tro88.Application.Features.AuditLogs.Queries.GetAuditLogs;

namespace Tro88.API.Controllers;

[Authorize(Roles = "Admin")]
public class AuditLogsController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] GetAuditLogsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<AuditLogDto>>.Ok(
            result.Items,
            metaData: new MetaData
            {
                Page = query.Page,
                PageSize = query.PageSize,
                Total = result.Total,
                TotalPage = result.TotalPage
            }));
    }
}
