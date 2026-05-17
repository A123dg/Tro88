using Tro88.Domain.Entities.Common;
using Tro88.Domain.Enums;
using Tro88.Domain.Events;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class Invoice : SoftDeleteEntity
{
    public Guid ContractId { get; private set; }
    public Guid RoomId { get; private set; }
    public string InvoiceCode { get; private set; } = default!;
    public int BillingMonth { get; private set; }
    public int BillingYear { get; private set; }
    public decimal RentAmount { get; private set; }
    public decimal ElectricityAmount { get; private set; }
    public decimal WaterAmount { get; private set; }
    public decimal ServiceAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public DateTime DueDate { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public InvoiceStatus Status { get; private set; }
    public string? Notes { get; private set; }

    public Contract Contract { get; private set; } = default!;
    public ICollection<InvoiceLineItem> LineItems { get; private set; } = new List<InvoiceLineItem>();

    private Invoice() { }

    public static Invoice Create(
        Guid contractId, Guid roomId,
        int month, int year,
        decimal rent, decimal electricity,
        decimal water, decimal services,
        DateTime dueDate)
    {
        return new Invoice
        {
            ContractId = contractId,
            RoomId = roomId,
            InvoiceCode = GenerateCode(month, year),
            BillingMonth = month,
            BillingYear = year,
            RentAmount = rent,
            ElectricityAmount = electricity,
            WaterAmount = water,
            ServiceAmount = services,
            TotalAmount = rent + electricity + water + services,
            DueDate = dueDate,
            Status = InvoiceStatus.Unpaid
        };
    }

    public void MarkAsPaid()
    {
        if (Status == InvoiceStatus.Paid)
            throw new BusinessRuleException("Invoice already paid");
        Status = InvoiceStatus.Paid;
        PaidAt = DateTime.UtcNow;
        AddDomainEvent(new PaymentReceivedEvent(this));
    }

    public void MarkOverdue()
    {
        if (Status == InvoiceStatus.Paid)
            return;
        Status = InvoiceStatus.Overdue;
    }

    private static string GenerateCode(int month, int year)
        => $"INV-{year}{month:D2}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
}
