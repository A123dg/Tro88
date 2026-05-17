using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.Dashboard.Queries.GetOwnerDashboard;

public class GetOwnerDashboardQueryHandler : IRequestHandler<GetOwnerDashboardQuery, OwnerDashboardDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetOwnerDashboardQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<OwnerDashboardDto> Handle(GetOwnerDashboardQuery request, CancellationToken ct)
    {
        var houses = await _db.Houses
            .Where(h => h.OwnerId == _currentUser.UserId && !h.IsDeleted)
            .ToListAsync(ct);

        var houseIds = houses.Select(h => h.Id).ToList();
        var rooms = await _db.Rooms
            .Where(r => houseIds.Contains(r.HouseId) && !r.IsDeleted)
            .ToListAsync(ct);

        var occupiedRooms = rooms.Count(r => r.Status == RoomStatus.Occupied);
        var activeContracts = await _db.Contracts
            .Where(c => c.OwnerId == _currentUser.UserId && c.Status == ContractStatus.Active)
            .CountAsync(ct);

        var pendingInvoices = await _db.Invoices
            .Where(i => i.Status == InvoiceStatus.Unpaid)
            .CountAsync(ct);

        var totalRevenue = await _db.Invoices
            .Where(i => i.Status == InvoiceStatus.Paid)
            .SumAsync(i => i.TotalAmount, ct);

        var pendingMaintenance = await _db.MaintenanceRequests
            .Where(m => m.Status == MaintenanceStatus.Open)
            .CountAsync(ct);

        return OwnerDashboardDto.FromData(
            houses.Count, rooms.Count, occupiedRooms,
            activeContracts, pendingInvoices, totalRevenue,
            pendingMaintenance);
    }
}