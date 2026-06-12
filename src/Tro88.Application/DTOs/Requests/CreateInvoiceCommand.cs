using MediatR;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Entities;

namespace Tro88.Application.Services;

public record CreateInvoiceCommand(
    Guid ContractId,
    Guid RoomId,
    int Month,
    int Year,
    decimal Rent,
    decimal Electricity,
    decimal Water,
    decimal Services,
    DateTime DueDate) : IRequest<InvoiceDto>
{
public class Handler : IRequestHandler<CreateInvoiceCommand, InvoiceDto>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

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
}


