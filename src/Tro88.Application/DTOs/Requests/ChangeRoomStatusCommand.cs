using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record ChangeRoomStatusCommand(
    Guid Id,
    string Status) : IRequest<RoomDto>
{
public sealed class Handler
    : IRequestHandler<ChangeRoomStatusCommand, RoomDto>
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
        ChangeRoomStatusCommand request,
        CancellationToken ct)
    {
        var room = await _db.Rooms
            .Include(r => r.House)
            .Include(r => r.Images)
            .FirstOrDefaultAsync(r => r.Id == request.Id, ct);

        if (room is null)
            throw new NotFoundException(ErrorMessages.ROOM_NOT_FOUND);

        if (room.House.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        if (!Enum.TryParse<RoomStatus>(request.Status, true, out var newStatus))
            throw new BusinessRuleException(
                ErrorMessages.INVALID_ROOM_STATUS_TRANSITION);

        try
        {
            room.ChangeStatus(newStatus);
            await _db.SaveChangesAsync(ct);
        }
        catch (DomainException ex)
        {
            throw new BusinessRuleException(
                ErrorMessages.INVALID_ROOM_STATUS_TRANSITION);
        }

        return RoomDto.FromEntity(room);
    }
}
}


