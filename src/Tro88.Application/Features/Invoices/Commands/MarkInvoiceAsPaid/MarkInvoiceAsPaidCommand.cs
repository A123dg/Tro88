using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Invoices.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Invoices.Commands.MarkInvoiceAsPaid;

public record MarkInvoiceAsPaidCommand(Guid Id) : IRequest<InvoiceDto>;

public class MarkInvoiceAsPaidCommandHandler
    : IRequestHandler<MarkInvoiceAsPaidCommand, InvoiceDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MarkInvoiceAsPaidCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<InvoiceDto> Handle(
        MarkInvoiceAsPaidCommand request,
        CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Contract)
            .ThenInclude(c => c.Room)
            .FirstOrDefaultAsync(i => i.Id == request.Id && !i.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.INVOICE_NOT_FOUND);

        if (invoice.Contract.Room.House.OwnerId != _currentUser.UserId)
            throw new ForbiddenException();

        invoice.MarkAsPaid();
        await _db.SaveChangesAsync(ct);

        return InvoiceDto.FromEntity(invoice);
    }
}