using System;
using Tro88.Domain.Entities.Common;

namespace Tro88.Domain.Entities;

public class ContactLog : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid HouseId { get; private set; }
    public string ContactType { get; private set; } = default!;
    public DateTime CreatedAt { get; private set; }

    public User User { get; private set; } = default!;
    public House House { get; private set; } = default!;

    private ContactLog() { }

    public static ContactLog Create(Guid userId, Guid houseId, string contactType)
    {
        return new ContactLog
        {
            UserId = userId,
            HouseId = houseId,
            ContactType = contactType,
            CreatedAt = DateTime.UtcNow
        };
    }
}
