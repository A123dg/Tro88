using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Constants;
using Tro88.Application.Common;
using Tro88.Application.Services;
using Tro88.Application.DTOs.Responses;

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

    [HttpGet("preview")]
    public async Task<IActionResult> GetUtilityReadingPreview([FromQuery] GetUtilityReadingPreviewQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(ApiResponse<List<UtilityReadingPreviewDto>>.Ok(result));
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
