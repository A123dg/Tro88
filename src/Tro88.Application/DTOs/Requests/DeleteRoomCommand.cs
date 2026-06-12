using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public sealed record DeleteRoomCommand(Guid Id) : IRequest<bool>
{
public sealed class Handler
    : IRequestHandler<DeleteRoomCommand, bool>
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

    public async Task<bool> Handle(
        DeleteRoomCommand request,
        CancellationToken ct)
    {
        var room = await _db.Rooms
            .Include(r => r.House)
            .FirstOrDefaultAsync(r => r.Id == request.Id, ct);

        if (room is null)
            throw new NotFoundException(ErrorMessages.ROOM_NOT_FOUND);

        if (room.House.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        room.Delete(_currentUser.UserId);
        await _db.SaveChangesAsync(ct);

        return true;
    }
}
}


