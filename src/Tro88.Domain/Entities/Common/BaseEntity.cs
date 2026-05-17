using Tro88.Domain.Events;

namespace Tro88.Domain.Entities.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents
        => _domainEvents.AsReadOnly();
    public void AddDomainEvent(IDomainEvent e)
        => _domainEvents.Add(e);
    public void ClearDomainEvents()
        => _domainEvents.Clear();
}
