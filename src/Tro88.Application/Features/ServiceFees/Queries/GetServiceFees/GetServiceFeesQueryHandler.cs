using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.ServiceFees.DTOs;

namespace Tro88.Application.Features.ServiceFees.Queries.GetServiceFees;

public sealed class GetServiceFeesQueryHandler
    : IRequestHandler<GetServiceFeesQuery, PagedResult<ServiceFeeDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetServiceFeesQueryHandler(
        IApplicationDbContext db,
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
            .OrderBy(sf => sf.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PagedResult<ServiceFeeDto>(
            items.Select(ServiceFeeDto.FromEntity).ToList(),
            total, request.Page, request.PageSize);
    }
}