using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Invoices.DTOs;

namespace Tro88.Application.Features.Invoices.Queries.GetInvoices;

public record GetInvoicesQuery(
    int Page = 1,
    int PageSize = 10,
    Guid? ContractId = null,
    Guid? RoomId = null) : IRequest<PagedResult<InvoiceDto>>;