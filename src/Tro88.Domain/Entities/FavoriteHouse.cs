using System;
using Tro88.Domain.Entities.Common;

namespace Tro88.Domain.Entities;

public class FavoriteHouse : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid HouseId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public User User { get; private set; } = default!;
    public House House { get; private set; } = default!;

    private FavoriteHouse() { }

    public static FavoriteHouse Create(Guid userId, Guid houseId)
    {
        return new FavoriteHouse
        {
            UserId = userId,
            HouseId = houseId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
