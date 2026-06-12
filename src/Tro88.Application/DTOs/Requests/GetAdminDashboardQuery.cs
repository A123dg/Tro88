using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Enums;

namespace Tro88.Application.Services;

public record GetAdminDashboardQuery() : IRequest<AdminDashboardDto>
{
public class Handler
    : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminDashboardDto> Handle(
        GetAdminDashboardQuery request,
        CancellationToken ct)
    {
        var totalUsers = await _db.Users.CountAsync(u => !u.IsDeleted, ct);
        var totalOwners = await _db.Users.CountAsync(
            u => !u.IsDeleted && u.Role == UserRole.Owner,
            ct);
        var totalTenants = await _db.Users.CountAsync(
            u => !u.IsDeleted && u.Role == UserRole.Tenant,
            ct);
        var totalHouses = await _db.Houses.CountAsync(h => !h.IsDeleted, ct);
        var totalRooms = await _db.Rooms.CountAsync(r => !r.IsDeleted, ct);
        var occupiedRooms = await _db.Rooms.CountAsync(
            r => !r.IsDeleted && r.Status == RoomStatus.Occupied,
            ct);
        var activeContracts = await _db.Contracts.CountAsync(
            c => !c.IsDeleted && c.Status == ContractStatus.Active,
            ct);
        var pendingInvoices = await _db.Invoices.CountAsync(
            i => !i.IsDeleted && i.Status == InvoiceStatus.Unpaid,
            ct);
        var totalRevenue = await _db.Invoices
            .Where(i => !i.IsDeleted && i.Status == InvoiceStatus.Paid)
            .SumAsync(i => i.TotalAmount, ct);
        var pendingMaintenance = await _db.MaintenanceRequests.CountAsync(
            m => m.Status == MaintenanceStatus.Open,
            ct);
        var totalAuditLogs = await _db.AuditLogs.CountAsync(ct);

        return new AdminDashboardDto(
            totalUsers,
            totalOwners,
            totalTenants,
            totalHouses,
            totalRooms,
            occupiedRooms,
            totalRooms - occupiedRooms,
            activeContracts,
            pendingInvoices,
            totalRevenue,
            pendingMaintenance,
            totalAuditLogs);
    }
}
}

public record AdminDashboardDto(
    int TotalUsers,
    int TotalOwners,
    int TotalTenants,
    int TotalHouses,
    int TotalRooms,
    int OccupiedRooms,
    int AvailableRooms,
    int ActiveContracts,
    int PendingInvoices,
    decimal TotalRevenue,
    int PendingMaintenanceRequests,
    int TotalAuditLogs);


