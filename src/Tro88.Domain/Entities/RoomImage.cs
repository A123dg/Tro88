using Tro88.Domain.Entities.Common;

namespace Tro88.Domain.Entities;

public class RoomImage : AuditableEntity
{
    public Guid RoomId { get; private set; }
    public string Url { get; private set; } = default!;
    public string? PublicId { get; private set; }

    public Room Room { get; private set; } = default!;

    private RoomImage() { }

    public static RoomImage Create(
        Guid roomId, string url, string? publicId = null)
        => new()
        {
            RoomId = roomId,
            Url = url,
            PublicId = publicId
        };
}
