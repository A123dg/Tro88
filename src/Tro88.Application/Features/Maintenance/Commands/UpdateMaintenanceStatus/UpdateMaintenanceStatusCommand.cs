using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Maintenance.DTOs;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Maintenance.Commands.UpdateMaintenanceStatus;

public record UpdateMaintenanceStatusCommand(
    Guid Id,
    string Status,
    string? ResolutionNote = null) : IRequest<MaintenanceRequestDto>;

public class UpdateMaintenanceStatusCommandHandler
    : IRequestHandler<UpdateMaintenanceStatusCommand, MaintenanceRequestDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateMaintenanceStatusCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<MaintenanceRequestDto> Handle(
        UpdateMaintenanceStatusCommand request,
        CancellationToken ct)
    {
        var maintenance = await _db.MaintenanceRequests
            .Include(m => m.Room)
            .ThenInclude(r => r.House)
            .Include(m => m.RequestedBy)
            .Include(m => m.AssignedTo)
            .FirstOrDefaultAsync(m => m.Id == request.Id, ct)
            ?? throw new NotFoundException(ErrorMessages.MAINTENANCE_REQUEST_NOT_FOUND);

        if (maintenance.Room.House.OwnerId != _currentUser.UserId &&
            maintenance.AssignedToUserId != _currentUser.UserId &&
            maintenance.RequestedByUserId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        if (!Enum.TryParse<MaintenanceStatus>(request.Status, out var status))
            throw new BusinessRuleException(ErrorMessages.COMMON_422);

        if (status == MaintenanceStatus.Resolved)
            maintenance.Resolve(request.ResolutionNote ?? string.Empty);
        else if (status == MaintenanceStatus.InProgress &&
                 maintenance.AssignedToUserId is null)
            maintenance.Assign(_currentUser.UserId);

        await _db.SaveChangesAsync(ct);
        return MaintenanceRequestDto.FromEntity(maintenance);
    }
}
