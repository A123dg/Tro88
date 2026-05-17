using Tro88.Domain.Entities.Common;
using Tro88.Domain.Enums;

namespace Tro88.Domain.Entities;

public class Notification : AuditableEntity
{
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = default!;
    public string Body { get; private set; } = default!;
    public string Type { get; private set; } = default!;
    public Guid? ReferenceId { get; private set; }
    public NotificationStatus Status { get; private set; }
    public DateTime? ReadAt { get; private set; }

    public User User { get; private set; } = default!;

    private Notification() { }

    public static Notification Create(
        Guid userId, string title, string body,
        string type, Guid? referenceId = null)
        => new()
        {
            UserId = userId,
            Title = title,
            Body = body,
            Type = type,
            ReferenceId = referenceId,
            Status = NotificationStatus.Unread
        };

    public void MarkAsRead()
    {
        Status = NotificationStatus.Read;
        ReadAt = DateTime.UtcNow;
    }
}
