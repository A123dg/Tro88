using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Rooms.DTOs;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.Rooms.Queries.GetRooms;

public sealed class GetRoomsQueryHandler
    : IRequestHandler<GetRoomsQuery, PagedResult<RoomDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetRoomsQueryHandler(
        IApplicationDbContext db,
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

        var items = await query
            .OrderBy(r => r.RoomNumber)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => RoomDto.FromEntity(r))
            .ToListAsync(ct);

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