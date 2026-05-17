using Microsoft.EntityFrameworkCore;
using Tro88.Domain.Entities;

namespace Tro88.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<House> Houses { get; }
    DbSet<Room> Rooms { get; }
    DbSet<RoomImage> RoomImages { get; }
    DbSet<Contract> Contracts { get; }
    DbSet<TenantInRoom> TenantInRooms { get; }
    DbSet<UtilityReading> UtilityReadings { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<InvoiceLineItem> InvoiceLineItems { get; }
    DbSet<ServiceFee> ServiceFees { get; }
    DbSet<MaintenanceRequest> MaintenanceRequests { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<AiConversation> AiConversations { get; }
    DbSet<AiMessage> AiMessages { get; }
    DbSet<AiAgentTask> AiAgentTasks { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}