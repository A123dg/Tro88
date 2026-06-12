using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Application.DTOs.Responses;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record MarkNotificationReadCommand(Guid Id) : IRequest<NotificationDto>
{
public class Handler : IRequestHandler<MarkNotificationReadCommand, NotificationDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(IAppDbContext db, ICurrentUserService currentUser)
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
}



