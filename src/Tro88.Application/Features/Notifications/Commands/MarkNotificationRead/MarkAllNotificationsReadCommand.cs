using MediatR;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.Notifications.Commands.MarkNotificationRead;

public sealed record MarkAllNotificationsReadCommand : IRequest;

public sealed class MarkAllNotificationsReadCommandHandler
    : IRequestHandler<MarkAllNotificationsReadCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MarkAllNotificationsReadCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(MarkAllNotificationsReadCommand request, CancellationToken ct)
    {
        var notifications = await _db.Notifications
            .Where(n => n.UserId == _currentUser.UserId && n.Status == NotificationStatus.Unread)
            .ToListAsync(ct);

        foreach (var notification in notifications)
            notification.MarkAsRead();

        await _db.SaveChangesAsync(ct);
    }
}
