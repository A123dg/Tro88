using Tro88.Domain.Entities.Common;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class ServiceFee : AuditableEntity
{
    public Guid HouseId { get; private set; }
    public string Name { get; private set; } = default!;
    public string FeeType { get; private set; } = default!;
    public decimal Amount { get; private set; }
    public string? Unit { get; private set; }
    public bool IsActive { get; private set; } = true;

    public House House { get; private set; } = default!;

    private ServiceFee() { }

    public static ServiceFee Create(
        Guid houseId, string name,
        string feeType, decimal amount,
        string? unit = null)
    {
        if (amount < 0)
            throw new DomainException("Amount must be non-negative");

        return new ServiceFee
        {
            HouseId = houseId,
            Name = name,
            FeeType = feeType,
            Amount = amount,
            Unit = unit
        };
    }

    public void Update(
        string name, string feeType,
        decimal amount, string? unit)
    {
        Name = name;
        FeeType = feeType;
        Amount = amount;
        Unit = unit;
    }

    public void Toggle() => IsActive = !IsActive;
}
