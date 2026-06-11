using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Maintenance.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Maintenance.Commands.CreateMaintenanceRequest;

public record CreateMaintenanceRequestCommand(
    Guid RoomId,
    string Title,
    string Description,
    string Category,
    string Priority,
    List<string>? ImageUrls = null) : IRequest<MaintenanceRequestDto>;

public class CreateMaintenanceRequestCommandHandler
    : IRequestHandler<CreateMaintenanceRequestCommand, MaintenanceRequestDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;

    public CreateMaintenanceRequestCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        INotificationService notificationService)
    {
        _db = db;
        _currentUser = currentUser;
        _notificationService = notificationService;
    }

    public async Task<MaintenanceRequestDto> Handle(
        CreateMaintenanceRequestCommand request,
        CancellationToken ct)
    {
        var room = await _db.Rooms
            .Include(r => r.House)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId && !r.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.ROOM_NOT_FOUND);

        var maintenance = MaintenanceRequest.Create(
            request.RoomId,
            _currentUser.UserId,
            request.Title,
            request.Description,
            request.Category,
            request.Priority);

        if (request.ImageUrls != null && request.ImageUrls.Count > 0)
        {
            foreach (var url in request.ImageUrls)
            {
                maintenance.AddImage(url);
            }
        }

        _db.MaintenanceRequests.Add(maintenance);
        await _db.SaveChangesAsync(ct);

        // Push notification to house owner
        await _notificationService.SendAsync(
            room.House.OwnerId,
            "Yêu cầu bảo trì mới",
            $"Phòng {room.RoomNumber} tại {room.House.Name} gửi yêu cầu bảo trì: {request.Title}",
            "maintenance",
            maintenance.Id,
            ct);

        maintenance = await _db.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Room)
            .Include(m => m.RequestedBy)
            .FirstAsync(m => m.Id == maintenance.Id, ct);

        return MaintenanceRequestDto.FromEntity(maintenance);
    }
}
