using MediatR;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Invoices.DTOs;
using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Invoices.Commands.CreateInvoice;

public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, InvoiceDto>
{
    private readonly IApplicationDbContext _db;

    public CreateInvoiceCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<InvoiceDto> Handle(CreateInvoiceCommand request, CancellationToken ct)
    {
        var invoice = Invoice.Create(
            request.ContractId,
            request.RoomId,
            request.Month,
            request.Year,
            request.Rent,
            request.Electricity,
            request.Water,
            request.Services,
            request.DueDate);

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync(ct);

        return InvoiceDto.FromEntity(invoice);
    }
}