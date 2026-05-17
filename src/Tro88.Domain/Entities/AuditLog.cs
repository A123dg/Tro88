using Tro88.Domain.Entities.Common;

namespace Tro88.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; private set; }
    public string Action { get; private set; } = default!;
    public string Module { get; private set; } = default!;
    public Guid? TargetId { get; private set; }
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    public string? IpAddress { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private AuditLog() { }

    public static AuditLog Create(
        Guid? userId, string action, string module,
        Guid? targetId = null,
        string? oldValues = null,
        string? newValues = null,
        string? ipAddress = null)
        => new()
        {
            UserId = userId,
            Action = action,
            Module = module,
            TargetId = targetId,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };
}
