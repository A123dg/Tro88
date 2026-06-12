using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.DTOs.Responses;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Invoices.Commands.NotifyInvoicePayment;

public record NotifyInvoicePaymentCommand(Guid Id) : IRequest<InvoiceDto>
{
public class Handler
    : IRequestHandler<NotifyInvoicePaymentCommand, InvoiceDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(
        IAppDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<InvoiceDto> Handle(
        NotifyInvoicePaymentCommand request,
        CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Contract)
            .ThenInclude(c => c.Room)
            .ThenInclude(r => r.House)
            .FirstOrDefaultAsync(i => i.Id == request.Id && !i.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.INVOICE_NOT_FOUND);

        var isTenant = invoice.Contract.TenantId == _currentUser.UserId;
        if (!isTenant && _currentUser.Role != "Admin")
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        invoice.MarkAsWaitingConfirm();
        await _db.SaveChangesAsync(ct);

        return InvoiceDto.FromEntity(invoice);
    }
}
}



