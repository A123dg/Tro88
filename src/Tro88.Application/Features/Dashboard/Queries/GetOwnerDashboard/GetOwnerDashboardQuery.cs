using MediatR;

namespace Tro88.Application.Features.Dashboard.Queries.GetOwnerDashboard;

public record GetOwnerDashboardQuery() : IRequest<OwnerDashboardDto>;

public record OwnerDashboardDto(
    int TotalHouses,
    int TotalRooms,
    int OccupiedRooms,
    int AvailableRooms,
    int ActiveContracts,
    int PendingInvoices,
    decimal TotalRevenue,
    int PendingMaintenanceRequests)
{
    public static OwnerDashboardDto FromData(
        int totalHouses, int totalRooms, int occupiedRooms,
        int activeContracts, int pendingInvoices, decimal totalRevenue,
        int pendingMaintenance)
        => new(totalHouses, totalRooms, occupiedRooms,
            totalRooms - occupiedRooms, activeContracts,
            pendingInvoices, totalRevenue, pendingMaintenance);
}