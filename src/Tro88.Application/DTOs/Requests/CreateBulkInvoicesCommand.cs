using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;

namespace Tro88.Application.Services;

public record CreateBulkInvoicesCommand(
    int Month,
    int Year) : IRequest<List<InvoiceDto>>
{
public sealed class Handler
    : IRequestHandler<CreateBulkInvoicesCommand, List<InvoiceDto>>
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

    public async Task<List<InvoiceDto>> Handle(
        CreateBulkInvoicesCommand request,
        CancellationToken ct)
    {
        var activeContracts = await _db.Contracts
            .Include(c => c.Room)
            .ThenInclude(r => r.House)
            .ThenInclude(h => h.ServiceFees)
            .Include(c => c.Tenant)
            .Where(c =>
                c.Status == ContractStatus.Active &&
                c.StartDate.Year <= request.Year &&
                c.StartDate.Month <= request.Month &&
                c.EndDate.Year >= request.Year &&
                c.EndDate.Month >= request.Month &&
                !c.IsDeleted)
            .ToListAsync(ct);

        var roomIds = activeContracts.Select(c => c.RoomId).Distinct().ToList();
        var allRoomServiceFees = await _db.RoomServiceFees
            .Where(rs => roomIds.Contains(rs.RoomId))
            .ToListAsync(ct);

        var invoices = new List<InvoiceDto>();

        foreach (var contract in activeContracts)
        {
            var existingInvoice = await _db.Invoices
                .FirstOrDefaultAsync(i =>
                    i.ContractId == contract.Id &&
                    i.BillingMonth == request.Month &&
                    i.BillingYear == request.Year, ct);

            if (existingInvoice != null)
                continue;

            var roomFees = allRoomServiceFees.Where(rs => rs.RoomId == contract.RoomId).ToList();
            decimal serviceAmount = 0;
            foreach (var houseFee in contract.Room.House.ServiceFees.Where(sf => sf.IsActive))
            {
                var roomOverride = roomFees.FirstOrDefault(rs => rs.ServiceId == houseFee.ServiceId);
                if (roomOverride != null)
                {
                    serviceAmount += roomOverride.Amount;
                }
                else
                {
                    serviceAmount += houseFee.Amount;
                }
            }

            var dueDate = new DateTime(request.Year, request.Month, contract.PaymentDayOfMonth);
            if (dueDate < DateTime.UtcNow)
                dueDate = dueDate.AddMonths(1);

            var invoice = Invoice.Create(
                contract.Id,
                contract.RoomId,
                request.Month,
                request.Year,
                contract.MonthlyRent,
                0, // electricity - will be calculated from readings
                0, // water - will be calculated from readings
                serviceAmount,
                dueDate);

            _db.Invoices.Add(invoice);
            invoices.Add(InvoiceDto.FromEntity(invoice));
        }

        await _db.SaveChangesAsync(ct);

        return invoices;
    }
}
}


