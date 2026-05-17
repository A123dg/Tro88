using MediatR;

namespace Tro88.Application.Features.Dashboard.Queries.GetTenantDashboard;

public record GetTenantDashboardQuery() : IRequest<TenantDashboardDto>;

public record TenantDashboardDto(
    Guid? CurrentRoomId,
    string? CurrentRoomNumber,
    string? CurrentHouseName,
    decimal MonthlyRent,
    int UnpaidInvoices,
    decimal TotalDue,
    DateTime? NextPaymentDue,
    int ActiveMaintenanceRequests)
{
    public static TenantDashboardDto Empty => new(null, null, null, 0, 0, 0, null, 0);
}