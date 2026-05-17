using Tro88.Domain.Entities;

namespace Tro88.Application.Features.AuditLogs.DTOs;

public sealed record AuditLogDto(
    Guid Id,
    Guid? UserId,
    string Action,
    string Module,
    Guid? TargetId,
    string? OldValues,
    string? NewValues,
    string? IpAddress,
    DateTime CreatedAt)
{
    public static AuditLogDto FromEntity(AuditLog a)
        => new(a.Id, a.UserId, a.Action, a.Module,
               a.TargetId, a.OldValues, a.NewValues,
               a.IpAddress, a.CreatedAt);
}
