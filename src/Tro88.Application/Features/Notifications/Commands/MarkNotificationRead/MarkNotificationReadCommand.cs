using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Notifications.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Notifications.Commands.MarkNotificationRead;

public record MarkNotificationReadCommand(Guid Id) : IRequest<NotificationDto>;

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, NotificationDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MarkNotificationReadCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<NotificationDto> Handle(MarkNotificationReadCommand request, CancellationToken ct)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.Id && n.UserId == _currentUser.UserId, ct)
            ?? throw new NotFoundException(ErrorMessages.NOTIFICATION_NOT_FOUND);

        notification.MarkAsRead();
        await _db.SaveChangesAsync(ct);

        return NotificationDto.FromEntity(notification);
    }
}