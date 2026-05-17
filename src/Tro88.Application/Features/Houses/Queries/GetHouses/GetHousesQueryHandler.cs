using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.Application.Features.Houses.Queries.GetHouses;

public sealed class GetHousesQueryHandler
    : IRequestHandler<GetHousesQuery, PagedResult<HouseDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetHousesQueryHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<HouseDto>> Handle(
        GetHousesQuery request,
        CancellationToken ct)
    {
        var query = _db.Houses
            .Include(h => h.Rooms)
            .AsQueryable();

        if (_currentUser.Role == "Owner")
        {
            query = query.Where(h => h.OwnerId == _currentUser.UserId);
        }

        if (!string.IsNullOrEmpty(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(h =>
                h.Name.ToLower().Contains(search) ||
                h.Address.ToLower().Contains(search));
        }

        var total = await query.CountAsync(ct);
        var totalPage = (int)Math.Ceiling(total / (double)request.PageSize);

        var items = await query
            .OrderByDescending(h => h.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(h => HouseDto.FromEntity(h))
            .ToListAsync(ct);

        return new PagedResult<HouseDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total,
            TotalPage = totalPage
        };
    }
}