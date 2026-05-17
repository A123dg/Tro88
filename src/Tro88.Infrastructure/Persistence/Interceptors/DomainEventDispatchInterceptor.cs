using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Tro88.Domain.Entities.Common;
using Tro88.Domain.Events;

namespace Tro88.Infrastructure.Persistence.Interceptors;

public class DomainEventDispatchInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is null)
            return base.SavingChangesAsync(eventData, result, cancellationToken);

        var entities = eventData.Context.ChangeTracker.Entries<BaseEntity>()
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = entities
            .SelectMany(e => e.DomainEvents)
            .ToList();

        foreach (var entity in entities)
        {
            entity.ClearDomainEvents();
        }

        // Events will be published via MediatR after SaveChanges
        // This is handled in the Application layer

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}
