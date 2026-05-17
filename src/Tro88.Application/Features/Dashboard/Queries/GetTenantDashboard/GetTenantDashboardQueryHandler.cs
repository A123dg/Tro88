using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.Dashboard.Queries.GetTenantDashboard;

public class GetTenantDashboardQueryHandler : IRequestHandler<GetTenantDashboardQuery, TenantDashboardDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTenantDashboardQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<TenantDashboardDto> Handle(GetTenantDashboardQuery request, CancellationToken ct)
    {
        var activeContract = await _db.Contracts
            .Include(c => c.Room)
                .ThenInclude(r => r!.House)
            .Where(c => c.TenantId == _currentUser.UserId && c.Status == ContractStatus.Active)
            .FirstOrDefaultAsync(ct);

        if (activeContract is null)
            return TenantDashboardDto.Empty;

        var unpaidInvoices = await _db.Invoices
            .Where(i => i.ContractId == activeContract.Id && i.Status == InvoiceStatus.Unpaid)
            .ToListAsync(ct);

        var totalDue = unpaidInvoices.Sum(i => i.TotalAmount);
        var nextPayment = unpaidInvoices
            .OrderBy(i => i.DueDate)
            .FirstOrDefault()?.DueDate;

        var activeMaintenance = await _db.MaintenanceRequests
            .Where(m => m.RoomId == activeContract.RoomId
                && m.Status != MaintenanceStatus.Resolved)
            .CountAsync(ct);

        return new TenantDashboardDto(
            activeContract.RoomId,
            activeContract.Room!.RoomNumber,
            activeContract.Room.House!.Name,
            activeContract.MonthlyRent,
            unpaidInvoices.Count,
            totalDue,
            nextPayment,
            activeMaintenance);
    }
}