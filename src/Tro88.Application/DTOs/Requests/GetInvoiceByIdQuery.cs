using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.DTOs.Responses;

namespace Tro88.Application.Features.Invoices.Queries.GetInvoiceById;

public record GetInvoiceByIdQuery(Guid Id) : IRequest<InvoiceDto?>
{
public class Handler : IRequestHandler<GetInvoiceByIdQuery, InvoiceDto?>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

    public async Task<InvoiceDto?> Handle(GetInvoiceByIdQuery request, CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == request.Id, ct);

        return invoice is null ? null : InvoiceDto.FromEntity(invoice);
    }
}
}



