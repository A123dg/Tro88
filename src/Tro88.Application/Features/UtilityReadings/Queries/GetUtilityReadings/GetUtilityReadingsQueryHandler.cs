using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.UtilityReadings.DTOs;

namespace Tro88.Application.Features.UtilityReadings.Queries.GetUtilityReadings;

public sealed class GetUtilityReadingsQueryHandler
    : IRequestHandler<GetUtilityReadingsQuery, PagedResult<UtilityReadingDto>>
{
    private readonly IApplicationDbContext _db;

    public GetUtilityReadingsQueryHandler(IApplicationDbContext db)
        => _db = db;

    public async Task<PagedResult<UtilityReadingDto>> Handle(
        GetUtilityReadingsQuery request,
        CancellationToken ct)
    {
        var query = _db.UtilityReadings
            .Include(r => r.Room)
            .AsQueryable();

        if (request.RoomId.HasValue)
            query = query.Where(r => r.RoomId == request.RoomId);

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
