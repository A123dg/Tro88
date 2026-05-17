using Tro88.Domain.Entities.Common;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class TenantInRoom : AuditableEntity
{
    public Guid ContractId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime CheckIn { get; private set; }
    public DateTime? CheckOut { get; private set; }
    public string Status { get; private set; } = default!;

    public Contract Contract { get; private set; } = default!;
    public User User { get; private set; } = default!;

    private TenantInRoom() { }

    public static TenantInRoom Create(
        Guid contractId, Guid userId, DateTime checkIn)
        => new()
        {
            ContractId = contractId,
            UserId = userId,
            CheckIn = checkIn,
            Status = "staying"
        };

    public void PerformCheckOut(DateTime checkOutDate)
    {
        if (Status == "checked_out")
            throw new BusinessRuleException("Tenant already checked out");
        CheckOut = checkOutDate;
        Status = "checked_out";
    }
}
