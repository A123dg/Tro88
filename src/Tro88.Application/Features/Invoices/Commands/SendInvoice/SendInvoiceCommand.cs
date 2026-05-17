using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Invoices.Commands.SendInvoice;

public record SendInvoiceCommand(Guid InvoiceId) : IRequest;

public class SendInvoiceCommandHandler : IRequestHandler<SendInvoiceCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly IEmailService _email;
    private readonly IPdfService _pdf;
    private readonly ICurrentUserService _currentUser;

    public SendInvoiceCommandHandler(
        IApplicationDbContext db,
        IEmailService email,
        IPdfService pdf,
        ICurrentUserService currentUser)
    {
        _db = db;
        _email = email;
        _pdf = pdf;
        _currentUser = currentUser;
    }

    public async Task Handle(SendInvoiceCommand request, CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
                    .ThenInclude(r => r.House)
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, ct)
            ?? throw new NotFoundException(ErrorMessages.INVOICE_NOT_FOUND);

        if (invoice.Contract.Room.House.OwnerId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        var pdf = await _pdf.GenerateInvoicePdfAsync(invoice, ct);
        var tenant = invoice.Contract.Tenant;

        await _email.SendInvoiceAsync(
            tenant.Email,
            tenant.FullName,
            invoice.InvoiceCode,
            invoice.TotalAmount,
            invoice.DueDate,
            pdf,
            ct);
    }
}
