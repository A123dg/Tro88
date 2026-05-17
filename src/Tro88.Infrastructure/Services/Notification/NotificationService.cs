using Microsoft.AspNetCore.SignalR;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Notifications.DTOs;
using Tro88.Domain.Entities;
using Tro88.Infrastructure.Hubs;

namespace Tro88.Infrastructure.Services.Notification;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _db;
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(
        IApplicationDbContext db,
        IHubContext<NotificationHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    public async Task SendAsync(
        Guid userId,
        string title,
        string body,
        string type,
        Guid? referenceId = null,
        CancellationToken ct = default)
    {
        var notification = Tro88.Domain.Entities.Notification.Create(
            userId, title, body, type, referenceId);

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync(ct);

        await _hub.Clients
            .User(userId.ToString())
            .SendAsync(
                "ReceiveNotification",
                NotificationDto.FromEntity(notification),
                ct);
    }

    public async Task SendToMultipleAsync(
        IEnumerable<Guid> userIds,
        string title,
        string body,
        string type,
        Guid? referenceId = null,
        CancellationToken ct = default)
    {
        foreach (var userId in userIds)
            await SendAsync(userId, title, body, type, referenceId, ct);
    }
}
