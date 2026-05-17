using Tro88.Domain.Entities;

namespace Tro88.Domain.Events;

public sealed class PaymentReceivedEvent : IDomainEvent
{
    public Invoice Invoice { get; }
    public DateTime OccurredOn { get; }

    public PaymentReceivedEvent(Invoice invoice)
    {
        Invoice = invoice;
        OccurredOn = DateTime.UtcNow;
    }
}