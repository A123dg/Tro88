using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Houses.Commands.ChangeHouseStatus;
using Tro88.Application.Features.Houses.Commands.CreateHouse;
using Tro88.Application.Features.Houses.Commands.UpdateHouse;
using Tro88.Application.Features.Houses.Commands.DeleteHouse;
using Tro88.Application.Features.Houses.Queries.GetHouses;
using Tro88.Application.Features.Houses.Queries.GetHouseById;

using Tro88.Application.Features.Houses.Queries.GetPublicHouseDetail;
using Tro88.Application.Features.Houses.Queries.GetFavoriteHouses;
using Tro88.Application.Features.Houses.Commands.CreateContactLog;
using Tro88.Application.Features.Houses.Commands.ToggleFavoriteHouse;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.API.Controllers;

[Authorize]
public class HousesController : BaseApiController
{
    private const long MaxHouseUploadBytes = 25 * 1024 * 1024;
    private readonly IStorageService _storage;

    public HousesController(IStorageService storage)
    {
        _storage = storage;
    }

    [HttpPost("{houseId}/contact")]
    public async Task<IActionResult> CreateContactLog(Guid houseId, [FromBody] CreateContactLogRequest request)
    {
        var command = new CreateContactLogCommand(houseId, request.ContactType);
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ContactLogResponseDto>.Ok(result));
    }

    [HttpPost("{houseId}/favorite")]
    public async Task<IActionResult> ToggleFavorite(Guid houseId)
    {
        var command = new ToggleFavoriteHouseCommand(houseId);
        var result = await Mediator.Send(command);
        return Ok(ApiResponse<ToggleFavoriteHouseResponseDto>.Ok(result));
    }

    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites()
    {
        var result = await Mediator.Send(new GetFavoriteHousesQuery());
        return Ok(ApiResponse<List<HouseDto>>.Ok(result));
    }

    [AllowAnonymous]
    [HttpGet("/api/public/houses/{id}")]
    [HttpGet("/api/v1/public/houses/{id}")]
    public async Task<IActionResult> GetPublicHouseDetail(Guid id)
    {
        var result = await Mediator.Send(new GetPublicHouseDetailQuery(id));
        return Ok(ApiResponse<PublicHouseDetailDto>.Ok(result));
    }

    [AllowAnonymous]
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

    [HttpGet("owner/{ownerId}")]
    public async Task<IActionResult> GetHousesByOwner(Guid ownerId, [FromQuery] GetHousesQuery query)
    {
        var result = await Mediator.Send(query with { OwnerId = ownerId });
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
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateHouse([FromForm] CreateHouseFormRequest request)
    {
        var totalUploadBytes = request.Files.Sum(file => file.Length);
        if (totalUploadBytes > MaxHouseUploadBytes)
        {
            return BadRequest(ApiResponse<object>.Fail("Tổng dung lượng ảnh tối đa là 25MB"));
        }

        var mediaUrls = request.MediaUrls
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .ToList();

        foreach (var file in request.Files)
        {
            var url = await _storage.UploadImageAsync(
                file.OpenReadStream(),
                file.FileName,
                "houses");
            mediaUrls.Add(url);
        }

        var command = new CreateHouseCommand(
            request.Name,
            request.Address,
            request.Province,
            request.District,
            request.Description,
            mediaUrls,
            request.Services.Select(s => new HouseServiceInput(s.ServiceId, s.Amount)).ToList());

        var result = await Mediator.Send(command);
        return Ok(ApiResponse<HouseDto>.Ok(result, SuccessMessages.CREATE_HOUSE_SUCCESS));
    }

    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateHouse(Guid id, [FromForm] UpdateHouseFormRequest request)
    {
        var totalUploadBytes = request.Files.Sum(file => file.Length);
        if (totalUploadBytes > MaxHouseUploadBytes)
        {
            return BadRequest(ApiResponse<object>.Fail("Tổng dung lượng ảnh tối đa là 25MB"));
        }

        var mediaUrls = request.MediaUrls
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .ToList();

        foreach (var file in request.Files)
        {
            var url = await _storage.UploadImageAsync(
                file.OpenReadStream(),
                file.FileName,
                "houses");
            mediaUrls.Add(url);
        }

        var command = new UpdateHouseCommand(
            id,
            request.Name,
            request.Address,
            request.Province,
            request.District,
            request.Description,
            mediaUrls);

        var result = await Mediator.Send(command);
        return Ok(ApiResponse<HouseDto>.Ok(result, SuccessMessages.UPDATE_HOUSE_SUCCESS));
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeHouseStatus(Guid id, [FromBody] ChangeHouseStatusCommand command)
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

public sealed class HouseServiceRequest
{
    public Guid ServiceId { get; set; }
    public decimal Amount { get; set; }
}

public sealed class CreateHouseFormRequest
{
    public string Name { get; set; } = default!;
    public string Address { get; set; } = default!;
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Description { get; set; }
    public List<string> MediaUrls { get; set; } = new();
    public List<IFormFile> Files { get; set; } = new();
    public List<HouseServiceRequest> Services { get; set; } = new();
}

public sealed class UpdateHouseFormRequest
{
    public string Name { get; set; } = default!;
    public string Address { get; set; } = default!;
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Description { get; set; }
    public List<string> MediaUrls { get; set; } = new();
    public List<IFormFile> Files { get; set; } = new();
}

public sealed class CreateContactLogRequest
{
    public string ContactType { get; set; } = default!;
}
