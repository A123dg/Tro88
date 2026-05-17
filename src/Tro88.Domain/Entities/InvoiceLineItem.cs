using Tro88.Domain.Entities.Common;

namespace Tro88.Domain.Entities;

public class InvoiceLineItem : BaseEntity
{
    public Guid InvoiceId { get; private set; }
    public string Description { get; private set; } = default!;
    public decimal UnitPrice { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal Amount { get; private set; }

    public Invoice Invoice { get; private set; } = default!;

    private InvoiceLineItem() { }

    public static InvoiceLineItem Create(
        Guid invoiceId, string description,
        decimal unitPrice, decimal quantity)
        => new()
        {
            InvoiceId = invoiceId,
            Description = description,
            UnitPrice = unitPrice,
            Quantity = quantity,
            Amount = unitPrice * quantity
        };
}
