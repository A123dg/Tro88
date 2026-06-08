using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.UtilityReadings.DTOs;

namespace Tro88.Application.Features.UtilityReadings.Queries.GetUtilityReadings;

public record GetUtilityReadingsQuery(
    Guid? HouseId,
    Guid? RoomId,
    string? Keyword,
    int? Month,
    int? Year,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<UtilityReadingDto>>;