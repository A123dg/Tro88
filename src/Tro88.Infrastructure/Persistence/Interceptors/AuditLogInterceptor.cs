using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using Tro88.Domain.Entities;
using Tro88.Domain.Entities.Common;
using Tro88.Application.Interfaces.Services;

namespace Tro88.Infrastructure.Persistence.Interceptors;

public class AuditLogInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUser;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogInterceptor(
        ICurrentUserService currentUser,
        IHttpContextAccessor httpContextAccessor)
    {
        _currentUser = currentUser;
        _httpContextAccessor = httpContextAccessor;
    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is null)
            return await base.SavingChangesAsync(eventData, result, cancellationToken);

        await ProcessAuditLogsAsync(eventData.Context, cancellationToken);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context is null)
            return base.SavingChanges(eventData, result);

        ProcessAuditLogsAsync(eventData.Context, default).AsTask().GetAwaiter().GetResult();

        return base.SavingChanges(eventData, result);
    }

    private async ValueTask ProcessAuditLogsAsync(DbContext context, CancellationToken cancellationToken)
    {
        var auditLogs = new List<AuditLog>();
        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLog && 
                        e.Entity is BaseEntity && 
                        (e.State == EntityState.Added || 
                         e.State == EntityState.Modified || 
                         e.State == EntityState.Deleted))
            .ToList();

        if (!entries.Any())
            return;

        var userId = _currentUser.IsAuthenticated ? (Guid?)_currentUser.UserId : null;
        var ipAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

        foreach (var entry in entries)
        {
            var entityType = entry.Entity.GetType().Name;
            var targetId = ((BaseEntity)entry.Entity).Id;
            var action = entry.State.ToString();

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            if (entry.State == EntityState.Added)
            {
                foreach (var prop in entry.Properties)
                {
                    newValues[prop.Metadata.Name] = prop.CurrentValue;
                }
            }
            else if (entry.State == EntityState.Deleted)
            {
                foreach (var prop in entry.Properties)
                {
                    oldValues[prop.Metadata.Name] = prop.OriginalValue;
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                foreach (var prop in entry.Properties)
                {
                    if (prop.IsModified)
                    {
                        oldValues[prop.Metadata.Name] = prop.OriginalValue;
                        newValues[prop.Metadata.Name] = prop.CurrentValue;
                    }
                }
            }

            var auditLog = AuditLog.Create(
                userId: userId,
                action: action,
                module: entityType,
                targetId: targetId,
                oldValues: oldValues.Any() ? JsonSerializer.Serialize(oldValues) : null,
                newValues: newValues.Any() ? JsonSerializer.Serialize(newValues) : null,
                ipAddress: ipAddress
            );

            auditLogs.Add(auditLog);
        }

        if (auditLogs.Any())
        {
            await context.Set<AuditLog>().AddRangeAsync(auditLogs, cancellationToken);
        }
    }
}
