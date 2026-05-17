using MediatR;
using Tro88.Application.Features.Invoices.DTOs;

namespace Tro88.Application.Features.Invoices.Commands.CreateInvoice;

public record CreateInvoiceCommand(
    Guid ContractId,
    Guid RoomId,
    int Month,
    int Year,
    decimal Rent,
    decimal Electricity,
    decimal Water,
    decimal Services,
    DateTime DueDate) : IRequest<InvoiceDto>;