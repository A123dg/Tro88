using MediatR;
using Tro88.Application.Features.Invoices.DTOs;

namespace Tro88.Application.Features.Invoices.Commands.CreateBulkInvoices;

public record CreateBulkInvoicesCommand(
    int Month,
    int Year) : IRequest<List<InvoiceDto>>;