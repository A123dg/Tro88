using Microsoft.EntityFrameworkCore;
using Tro88.Domain.Entities;
using Tro88.Application.Common.Interfaces;
using Tro88.Infrastructure.Persistence.Interceptors;

namespace Tro88.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly AuditableEntityInterceptor _audit;
    private readonly DomainEventDispatchInterceptor _events;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        AuditableEntityInterceptor audit,
        DomainEventDispatchInterceptor events)
        : base(options)
    {
        _audit = audit;
        _events = events;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<House> Houses => Set<House>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RoomImage> RoomImages => Set<RoomImage>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<TenantInRoom> TenantInRooms => Set<TenantInRoom>();
    public DbSet<UtilityReading> UtilityReadings => Set<UtilityReading>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();
    public DbSet<ServiceFee> ServiceFees => Set<ServiceFee>();
    public DbSet<MaintenanceRequest> MaintenanceRequests => Set<MaintenanceRequest>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AiConversation> AiConversations => Set<AiConversation>();
    public DbSet<AiMessage> AiMessages => Set<AiMessage>();
    public DbSet<AiAgentTask> AiAgentTasks => Set<AiAgentTask>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.ApplyConfigurationsFromAssembly(
            Assembly.GetExecutingAssembly());

        b.Entity<User>()
            .HasQueryFilter(u => !u.IsDeleted);
        b.Entity<House>()
            .HasQueryFilter(h => !h.IsDeleted);
        b.Entity<Room>()
            .HasQueryFilter(r => !r.IsDeleted);
        b.Entity<Contract>()
            .HasQueryFilter(c => !c.IsDeleted);

        base.OnModelCreating(b);
    }

    protected override void OnConfiguring(
        DbContextOptionsBuilder b)
        => b.AddInterceptors(_audit, _events);
}