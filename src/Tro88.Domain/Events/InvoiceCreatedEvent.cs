using Tro88.Domain.Entities;

namespace Tro88.Domain.Events;

public sealed class InvoiceCreatedEvent : IDomainEvent
{
    public Invoice Invoice { get; }
    public DateTime OccurredOn { get; }

    public InvoiceCreatedEvent(Invoice invoice)
    {
        Invoice = invoice;
        OccurredOn = DateTime.UtcNow;
    }
}