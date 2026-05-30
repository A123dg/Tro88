using MediatR;

namespace Tro88.Application.Features.Dashboard.Queries.GetAdminDashboard;

public record GetAdminDashboardQuery() : IRequest<AdminDashboardDto>;

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
