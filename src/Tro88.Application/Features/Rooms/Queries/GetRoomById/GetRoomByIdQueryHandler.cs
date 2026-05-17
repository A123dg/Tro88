using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Rooms.DTOs;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Rooms.Queries.GetRoomById;

public sealed class GetRoomByIdQueryHandler
    : IRequestHandler<GetRoomByIdQuery, RoomDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetRoomByIdQueryHandler(
        IApplicationDbContext db,
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