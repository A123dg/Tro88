using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Enums;

namespace Tro88.Application.Services;

public sealed record GetHousesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? Keyword = null,
    Guid? OwnerId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string? Status = null) : IRequest<PagedResult<HouseDto>>
{
public sealed class Handler
    : IRequestHandler<GetHousesQuery, PagedResult<HouseDto>>
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

    public async Task<PagedResult<HouseDto>> Handle(
        GetHousesQuery request,
        CancellationToken ct)
    {
        var query = _db.Houses
            .Include(h => h.Rooms)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<HouseStatus>(request.Status, true, out var status))
                query = query.Where(h => h.Status == status);
        }

        if (request.OwnerId.HasValue)
        {
            query = query.Where(h => h.OwnerId == request.OwnerId.Value);
        }
        else if (_currentUser.Role == "Owner")
        {
            query = query.Where(h => h.OwnerId == _currentUser.UserId);
        }

        var keyword = request.Keyword ?? request.Search;
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var search = keyword.Trim().ToLower();
            query = query.Where(h =>
                h.Name.ToLower().Contains(search) ||
                h.Address.ToLower().Contains(search));
        }

        if (request.MinPrice.HasValue || request.MaxPrice.HasValue)
        {
            query = query.Where(h => h.Rooms.Any(r =>
                (!request.MinPrice.HasValue || r.MonthlyRent >= request.MinPrice.Value) &&
                (!request.MaxPrice.HasValue || r.MonthlyRent <= request.MaxPrice.Value)
            ));
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
}


