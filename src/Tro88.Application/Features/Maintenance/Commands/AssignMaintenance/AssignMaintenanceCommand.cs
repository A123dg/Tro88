using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Maintenance.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Maintenance.Commands.AssignMaintenance;

public record AssignMaintenanceCommand(
    Guid Id,
    Guid AssignedToUserId) : IRequest<MaintenanceRequestDto>;

public class AssignMaintenanceCommandHandler
    : IRequestHandler<AssignMaintenanceCommand, MaintenanceRequestDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AssignMaintenanceCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<MaintenanceRequestDto> Handle(
        AssignMaintenanceCommand request,
        CancellationToken ct)
    {
        var maintenance = await _db.MaintenanceRequests
            .Include(m => m.Room)
            .ThenInclude(r => r.House)
            .Include(m => m.RequestedBy)
            .Include(m => m.AssignedTo)
            .FirstOrDefaultAsync(m => m.Id == request.Id, ct)
            ?? throw new NotFoundException(ErrorMessages.MAINTENANCE_REQUEST_NOT_FOUND);

        if (maintenance.Room.House.OwnerId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        maintenance.Assign(request.AssignedToUserId);
        await _db.SaveChangesAsync(ct);

        maintenance = await _db.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Room)
            .Include(m => m.RequestedBy)
            .Include(m => m.AssignedTo)
            .FirstAsync(m => m.Id == maintenance.Id, ct);

        return MaintenanceRequestDto.FromEntity(maintenance);
    }
}
