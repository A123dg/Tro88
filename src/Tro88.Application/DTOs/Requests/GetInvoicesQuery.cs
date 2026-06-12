using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;

namespace Tro88.Application.Services;

public record GetInvoicesQuery(
    int Page = 1,
    int PageSize = 10,
    Guid? ContractId = null,
    Guid? RoomId = null) : IRequest<PagedResult<InvoiceDto>>
{
public class Handler : IRequestHandler<GetInvoicesQuery, PagedResult<InvoiceDto>>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

    public async Task<PagedResult<InvoiceDto>> Handle(GetInvoicesQuery request, CancellationToken ct)
    {
        var query = _db.Invoices
            .Include(i => i.LineItems)
            .AsQueryable();

        if (request.ContractId.HasValue)
            query = query.Where(i => i.ContractId == request.ContractId);

        if (request.RoomId.HasValue)
            query = query.Where(i => i.RoomId == request.RoomId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return new PagedResult<InvoiceDto>(
            items.Select(InvoiceDto.FromEntity).ToList(),
            total,
            request.Page,
            request.PageSize);
    }
}
}


