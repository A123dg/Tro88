using Tro88.Domain.Entities.Common;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class RoomServiceFee : AuditableEntity
{
    public Guid RoomId { get; private set; }
    public Guid ServiceId { get; private set; }
    public decimal Amount { get; private set; }

    public Room Room { get; private set; } = default!;
    public Service Service { get; private set; } = default!;

    private RoomServiceFee() { }

    public static RoomServiceFee Create(Guid roomId, Guid serviceId, decimal amount)
    {
        if (amount < 0)
            throw new DomainException("Amount must be non-negative");

        return new RoomServiceFee
        {
            RoomId = roomId,
            ServiceId = serviceId,
            Amount = amount
        };
    }

    public void UpdateAmount(decimal amount)
    {
        if (amount < 0)
            throw new DomainException("Amount must be non-negative");
        Amount = amount;
    }
}
