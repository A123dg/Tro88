using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Services.DTOs;

namespace Tro88.Application.Features.Services.Queries.GetServices;

public sealed class GetServicesQueryHandler
    : IRequestHandler<GetServicesQuery, PagedResult<ServiceDto>>
{
    private readonly IApplicationDbContext _db;

    public GetServicesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<PagedResult<ServiceDto>> Handle(
        GetServicesQuery request,
        CancellationToken ct)
    {
        var query = _db.Services.AsQueryable();

        if (request.IsActive.HasValue)
            query = query.Where(s => s.IsActive == request.IsActive);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(s => s.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PagedResult<ServiceDto>(
            items.Select(ServiceDto.FromEntity).ToList(),
            total, request.Page, request.PageSize);
    }
}
