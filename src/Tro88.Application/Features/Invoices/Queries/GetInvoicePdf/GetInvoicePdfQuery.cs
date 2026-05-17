using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Invoices.Queries.GetInvoicePdf;

public record GetInvoicePdfQuery(Guid Id) : IRequest<byte[]>;

public class GetInvoicePdfQueryHandler : IRequestHandler<GetInvoicePdfQuery, byte[]>
{
    private readonly IApplicationDbContext _db;
    private readonly IPdfService _pdf;
    private readonly ICurrentUserService _currentUser;

    public GetInvoicePdfQueryHandler(
        IApplicationDbContext db,
        IPdfService pdf,
        ICurrentUserService currentUser)
    {
        _db = db;
        _pdf = pdf;
        _currentUser = currentUser;
    }

    public async Task<byte[]> Handle(
        GetInvoicePdfQuery request,
        CancellationToken ct)
    {
        var invoice = await _db.Invoices
            .Include(i => i.Contract)
                .ThenInclude(c => c.Room)
                    .ThenInclude(r => r.House)
            .Include(i => i.Contract)
                .ThenInclude(c => c.Tenant)
            .FirstOrDefaultAsync(i => i.Id == request.Id, ct)
            ?? throw new NotFoundException(ErrorMessages.INVOICE_NOT_FOUND);

        var isOwner = invoice.Contract.Room.House.OwnerId == _currentUser.UserId;
        var isTenant = invoice.Contract.TenantId == _currentUser.UserId;

        if (!isOwner && !isTenant && _currentUser.Role != "Admin")
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        return await _pdf.GenerateInvoicePdfAsync(invoice, ct);
    }
}
