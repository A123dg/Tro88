using Tro88.Domain.Entities;
using Tro88.Domain.Enums;

namespace Tro88.Domain.Events;

public sealed class ContractCreatedEvent : IDomainEvent
{
    public Contract Contract { get; }
    public DateTime OccurredOn { get; }

    public ContractCreatedEvent(Contract contract)
    {
        Contract = contract;
        OccurredOn = DateTime.UtcNow;
    }
}