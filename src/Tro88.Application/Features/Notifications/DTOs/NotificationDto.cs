using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Notifications.DTOs;

public sealed record NotificationDto(
    Guid Id,
    string Title,
    string Body,
    string Type,
    Guid? ReferenceId,
    string Status,
    DateTime? ReadAt,
    DateTime CreatedAt)
{
    public static NotificationDto FromEntity(Notification n)
        => new(n.Id, n.Title, n.Body, n.Type,
               n.ReferenceId, n.Status.ToString(),
               n.ReadAt, n.CreatedAt);
}
