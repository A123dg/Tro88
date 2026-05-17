using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Invoices.DTOs;

namespace Tro88.Application.Features.Invoices.Queries.GetInvoices;

public class GetInvoicesQueryHandler : IRequestHandler<GetInvoicesQuery, PagedResult<InvoiceDto>>
{
    private readonly IApplicationDbContext _db;

    public GetInvoicesQueryHandler(IApplicationDbContext db) => _db = db;

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