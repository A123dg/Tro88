using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Enums;

namespace Tro88.Application.Services;

public sealed record GetRoomsQuery(
    Guid? HouseId = null,
    int Page = 1,
    int PageSize = 10,
    string? Status = null) : IRequest<PagedResult<RoomDto>>
{
public sealed class Handler
    : IRequestHandler<GetRoomsQuery, PagedResult<RoomDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(
        IAppDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<RoomDto>> Handle(
        GetRoomsQuery request,
        CancellationToken ct)
    {
        var query = _db.Rooms
            .Include(r => r.House)
            .Include(r => r.Images)
            .AsQueryable();

        if (request.HouseId.HasValue)
            query = query.Where(r => r.HouseId == request.HouseId);

        if (_currentUser.Role == "Owner")
        {
            query = query.Where(r => r.House.OwnerId == _currentUser.UserId);
        }

        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<RoomStatus>(request.Status, true, out var status))
                query = query.Where(r => r.Status == status);
        }

        var total = await query.CountAsync(ct);
        var totalPage = (int)Math.Ceiling(total / (double)request.PageSize);

        var itemsList = await query
            .Include(r => r.RoomServiceFees)
            .ThenInclude(rs => rs.Service)
            .Include(r => r.Contracts.Where(c => c.Status == Tro88.Domain.Enums.ContractStatus.Active && !c.IsDeleted))
                .ThenInclude(c => c.Tenant)
            .Include(r => r.Contracts.Where(c => c.Status == Tro88.Domain.Enums.ContractStatus.Active && !c.IsDeleted))
                .ThenInclude(c => c.TenantInRooms.Where(tr => tr.Status == "staying"))
                .ThenInclude(tr => tr.User)
            .OrderBy(r => r.RoomNumber)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var items = itemsList.Select(r => RoomDto.FromEntity(r)).ToList();

        return new PagedResult<RoomDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total,
            TotalPage = totalPage
        };
    }
}
}


