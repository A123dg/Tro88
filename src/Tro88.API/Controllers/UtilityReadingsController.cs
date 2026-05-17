using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.UtilityReadings.Commands.RecordUtilityReading;
using Tro88.Application.Features.UtilityReadings.Commands.BulkRecordReadings;
using Tro88.Application.Features.UtilityReadings.Queries.GetUtilityReadingById;
using Tro88.Application.Features.UtilityReadings.DTOs;
using Tro88.Application.Features.UtilityReadings.Queries.GetUtilityReadingById;
using Tro88.Application.Features.UtilityReadings.Queries.GetUtilityReadings;

namespace Tro88.API.Controllers;

[Authorize]
public class UtilityReadingsController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetUtilityReadings([FromQuery] GetUtilityReadingsQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<UtilityReadingDto>>.Ok(
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
    public async Task<IActionResult> RecordUtilityReading([FromBody] RecordUtilityReadingCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<UtilityReadingDto>.Ok(result));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkRecordReadings([FromBody] BulkRecordReadingsCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<List<UtilityReadingDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUtilityReadingById(Guid id)
    {
        var result = await Mediator.Send(new GetUtilityReadingByIdQuery(id));
        return Ok(ApiResponse<UtilityReadingDto>.Ok(result));
    }
}