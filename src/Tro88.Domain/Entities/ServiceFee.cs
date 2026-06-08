using Tro88.Domain.Entities.Common;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class ServiceFee : AuditableEntity
{
    public Guid HouseId { get; private set; }
    public Guid ServiceId { get; private set; }
    public decimal Amount { get; private set; }
    public bool IsActive { get; private set; } = true;

    public House House { get; private set; } = default!;
    public Service Service { get; private set; } = default!;

    private ServiceFee() { }

    public static ServiceFee Create(
        Guid houseId, Guid serviceId, decimal amount, bool isActive = true)
    {
        if (amount < 0)
            throw new DomainException("Amount must be non-negative");

        return new ServiceFee
        {
            HouseId = houseId,
            ServiceId = serviceId,
            Amount = amount,
            IsActive = isActive
        };
    }

    public void Update(decimal amount)
    {
        if (amount < 0)
            throw new DomainException("Amount must be non-negative");
        Amount = amount;
    }

    public void Toggle() => IsActive = !IsActive;
}
