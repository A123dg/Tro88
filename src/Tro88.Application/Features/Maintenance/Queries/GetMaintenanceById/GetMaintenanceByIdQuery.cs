using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Maintenance.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Maintenance.Queries.GetMaintenanceById;

public record GetMaintenanceByIdQuery(Guid Id) : IRequest<MaintenanceRequestDto>;

public class GetMaintenanceByIdQueryHandler
    : IRequestHandler<GetMaintenanceByIdQuery, MaintenanceRequestDto>
{
    private readonly IApplicationDbContext _db;

    public GetMaintenanceByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<MaintenanceRequestDto> Handle(
        GetMaintenanceByIdQuery request,
        CancellationToken ct)
    {
        var maintenance = await _db.MaintenanceRequests
            .AsNoTracking()
            .Include(m => m.Room)
            .Include(m => m.RequestedBy)
            .Include(m => m.AssignedTo)
            .FirstOrDefaultAsync(m => m.Id == request.Id, ct)
            ?? throw new NotFoundException(ErrorMessages.MAINTENANCE_REQUEST_NOT_FOUND);

        return MaintenanceRequestDto.FromEntity(maintenance);
    }
}
