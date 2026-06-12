using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;

namespace Tro88.Application.Services;

public record GetServiceFeesQuery(
    Guid? HouseId,
    bool? IsActive,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ServiceFeeDto>>
{
public sealed class Handler
    : IRequestHandler<GetServiceFeesQuery, PagedResult<ServiceFeeDto>>
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

    public async Task<PagedResult<ServiceFeeDto>> Handle(
        GetServiceFeesQuery request,
        CancellationToken ct)
    {
        var query = _db.ServiceFees
            .Include(sf => sf.House)
            .Include(sf => sf.Service)
            .AsQueryable();

        if (_currentUser.Role == "Owner")
        {
            query = query.Where(sf => sf.House.OwnerId == _currentUser.UserId);
        }

        if (request.HouseId.HasValue)
            query = query.Where(sf => sf.HouseId == request.HouseId);

        if (request.IsActive.HasValue)
            query = query.Where(sf => sf.IsActive == request.IsActive);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(sf => sf.Service.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PagedResult<ServiceFeeDto>(
            items.Select(ServiceFeeDto.FromEntity).ToList(),
            total, request.Page, request.PageSize);
    }
}
}


