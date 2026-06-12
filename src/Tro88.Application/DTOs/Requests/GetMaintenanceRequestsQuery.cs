using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Enums;

namespace Tro88.Application.Services;

public record GetMaintenanceRequestsQuery(
    int Page = 1,
    int PageSize = 10,
    Guid? RoomId = null,
    string? Status = null,
    Guid? RequestedByUserId = null) : IRequest<PagedResult<MaintenanceRequestDto>>
{
public class Handler : IRequestHandler<GetMaintenanceRequestsQuery, PagedResult<MaintenanceRequestDto>>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

    public async Task<PagedResult<MaintenanceRequestDto>> Handle(GetMaintenanceRequestsQuery request, CancellationToken ct)
    {
        var query = _db.MaintenanceRequests
            .Include(m => m.Room)
            .Include(m => m.RequestedBy)
            .Include(m => m.AssignedTo)
            .AsQueryable();

        if (request.RoomId.HasValue)
            query = query.Where(m => m.RoomId == request.RoomId);

        if (request.RequestedByUserId.HasValue)
            query = query.Where(m => m.RequestedByUserId == request.RequestedByUserId);

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
}


