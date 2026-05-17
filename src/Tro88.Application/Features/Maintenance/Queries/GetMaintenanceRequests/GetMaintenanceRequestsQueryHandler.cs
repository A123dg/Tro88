using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Maintenance.DTOs;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.Maintenance.Queries.GetMaintenanceRequests;

public class GetMaintenanceRequestsQueryHandler : IRequestHandler<GetMaintenanceRequestsQuery, PagedResult<MaintenanceRequestDto>>
{
    private readonly IApplicationDbContext _db;

    public GetMaintenanceRequestsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<MaintenanceRequestDto>> Handle(GetMaintenanceRequestsQuery request, CancellationToken ct)
    {
        var query = _db.MaintenanceRequests
            .Include(m => m.Room)
            .Include(m => m.RequestedBy)
            .Include(m => m.AssignedTo)
            .AsQueryable();

        if (request.RoomId.HasValue)
            query = query.Where(m => m.RoomId == request.RoomId);

        if (!string.IsNullOrEmpty(request.Status))
            query = query.Where(m => m.Status == Enum.Parse<MaintenanceStatus>(request.Status));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PagedResult<MaintenanceRequestDto>(
            items.Select(MaintenanceRequestDto.FromEntity).ToList(),
            total, request.Page, request.PageSize);
    }
}