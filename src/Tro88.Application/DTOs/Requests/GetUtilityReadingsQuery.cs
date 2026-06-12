using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;

namespace Tro88.Application.Services;

public record GetUtilityReadingsQuery(
    Guid? HouseId,
    Guid? RoomId,
    string? Keyword,
    int? Month,
    int? Year,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<UtilityReadingDto>>
{
public sealed class Handler
    : IRequestHandler<GetUtilityReadingsQuery, PagedResult<UtilityReadingDto>>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db)
        => _db = db;

    public async Task<PagedResult<UtilityReadingDto>> Handle(
        GetUtilityReadingsQuery request,
        CancellationToken ct)
    {
        var query = _db.UtilityReadings
            .Include(r => r.Room)
            .AsQueryable();

        if (request.HouseId.HasValue)
            query = query.Where(r => r.Room.HouseId == request.HouseId.Value);

        if (request.RoomId.HasValue)
            query = query.Where(r => r.RoomId == request.RoomId);

        if (!string.IsNullOrWhiteSpace(request.Keyword))
            query = query.Where(r => r.Room.RoomNumber.Contains(request.Keyword));

        if (request.Month.HasValue)
            query = query.Where(r => r.Month == request.Month);

        if (request.Year.HasValue)
            query = query.Where(r => r.Year == request.Year);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var dtos = items.Select(UtilityReadingDto.FromEntity).ToList();

        return new PagedResult<UtilityReadingDto>(
            dtos, total, request.Page, request.PageSize);
    }
}
}


