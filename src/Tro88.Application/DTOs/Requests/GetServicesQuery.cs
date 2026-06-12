using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;

namespace Tro88.Application.Services;

public record GetServicesQuery(
    bool? IsActive = null,
    int Page = 1,
    int PageSize = 100) : IRequest<PagedResult<ServiceDto>>
{
public sealed class Handler
    : IRequestHandler<GetServicesQuery, PagedResult<ServiceDto>>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

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
}


