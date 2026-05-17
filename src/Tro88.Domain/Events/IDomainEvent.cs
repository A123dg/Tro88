namespace Tro88.Domain.Events;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}