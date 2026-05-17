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
    string Priority) : IRequest<MaintenanceRequestDto>;

public class CreateMaintenanceRequestCommandHandler
    : IRequestHandler<CreateMaintenanceRequestCommand, MaintenanceRequestDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateMaintenanceRequestCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<MaintenanceRequestDto> Handle(
        CreateMaintenanceRequestCommand request,
        CancellationToken ct)
    {
        _ = await _db.Rooms
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

        _db.MaintenanceRequests.Add(maintenance);
        await _db.SaveChangesAsync(ct);

        maintenance = await _db.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Room)
            .Include(m => m.RequestedBy)
            .FirstAsync(m => m.Id == maintenance.Id, ct);

        return MaintenanceRequestDto.FromEntity(maintenance);
    }
}
