using Tro88.Domain.Entities.Common;
using Tro88.Domain.Enums;
using Tro88.Domain.Events;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class Contract : SoftDeleteEntity
{
    public Guid RoomId { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid OwnerId { get; private set; }
    public string ContractCode { get; private set; } = default!;
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public decimal MonthlyRent { get; private set; }
    public decimal DepositAmount { get; private set; }
    public int PaymentDayOfMonth { get; private set; }
    public ContractStatus Status { get; private set; }
    public string? Terms { get; private set; }
    public DateTime? SignedAt { get; private set; }

    public Room Room { get; private set; } = default!;
    public User Tenant { get; private set; } = default!;
    public ICollection<Invoice> Invoices { get; private set; } = new List<Invoice>();
    public ICollection<TenantInRoom> TenantInRooms { get; private set; } = new List<TenantInRoom>();

    private Contract() { }

    public static Contract Create(
        Guid roomId, Guid tenantId, Guid ownerId,
        DateTime startDate, DateTime endDate,
        decimal monthlyRent, decimal depositAmount,
        int paymentDay, string? terms = null)
    {
        if (endDate <= startDate)
            throw new DomainException("End date must be after start date");
        if (paymentDay is < 1 or > 28)
            throw new DomainException("Payment day must be between 1 and 28");

        return new Contract
        {
            RoomId = roomId,
            TenantId = tenantId,
            OwnerId = ownerId,
            ContractCode = GenerateCode(),
            StartDate = startDate,
            EndDate = endDate,
            MonthlyRent = monthlyRent,
            DepositAmount = depositAmount,
            PaymentDayOfMonth = paymentDay,
            Status = ContractStatus.Draft,
            Terms = terms
        };
    }

    public void Activate()
    {
        if (Status != ContractStatus.Draft)
            throw new BusinessRuleException("Only draft contracts can be activated");
        Status = ContractStatus.Active;
        SignedAt = DateTime.UtcNow;
        AddDomainEvent(new ContractCreatedEvent(this));
    }

    public void Terminate(string reason)
    {
        if (Status != ContractStatus.Active)
            throw new BusinessRuleException("Only active contracts can be terminated");
        Status = ContractStatus.Terminated;
    }

    public void MarkExpired()
    {
        if (Status != ContractStatus.Active)
            throw new BusinessRuleException("Only active contracts can expire");
        Status = ContractStatus.Expired;
    }

    private static string GenerateCode()
        => $"CTR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
}