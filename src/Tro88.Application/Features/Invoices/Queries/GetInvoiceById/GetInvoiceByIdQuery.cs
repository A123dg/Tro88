using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Invoices.DTOs;

namespace Tro88.Application.Features.Invoices.Queries.GetInvoiceById;

public record GetInvoiceByIdQuery(Guid Id) : IRequest<InvoiceDto?>;

public class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, InvoiceDto?>
{
    private readonly IApplicationDbContext _db;

    public GetInvoiceByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<InvoiceDto?> Handle(GetInvoiceByIdQuery request, CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == request.Id, ct);

        return invoice is null ? null : InvoiceDto.FromEntity(invoice);
    }
}
