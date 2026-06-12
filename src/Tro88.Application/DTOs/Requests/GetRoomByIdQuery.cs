using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record GetRoomByIdQuery(Guid Id) : IRequest<RoomDto>
{
public sealed class Handler
    : IRequestHandler<GetRoomByIdQuery, RoomDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(
        IAppDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<RoomDto> Handle(
        GetRoomByIdQuery request,
        CancellationToken ct)
    {
        var room = await _db.Rooms
            .Include(r => r.House)
            .Include(r => r.Images)
            .Include(r => r.RoomServiceFees)
            .ThenInclude(rs => rs.Service)
            .Include(r => r.Contracts.Where(c => c.Status == Tro88.Domain.Enums.ContractStatus.Active && !c.IsDeleted))
                .ThenInclude(c => c.Tenant)
            .Include(r => r.Contracts.Where(c => c.Status == Tro88.Domain.Enums.ContractStatus.Active && !c.IsDeleted))
                .ThenInclude(c => c.TenantInRooms.Where(tr => tr.Status == "staying"))
                .ThenInclude(tr => tr.User)
            .FirstOrDefaultAsync(r => r.Id == request.Id, ct);

        if (room is null)
            throw new NotFoundException(ErrorMessages.ROOM_NOT_FOUND);

        if (room.House.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin" &&
            _currentUser.Role != "Tenant")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        return RoomDto.FromEntity(room);
    }
}
}


