using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Rooms.Commands.UploadRoomImage;

public sealed class UploadRoomImageCommandHandler
    : IRequestHandler<UploadRoomImageCommand, string>
{
    private readonly IApplicationDbContext _db;
    private readonly IStorageService _storage;
    private readonly ICurrentUserService _currentUser;

    public UploadRoomImageCommandHandler(
        IApplicationDbContext db,
        IStorageService storage,
        ICurrentUserService currentUser)
    {
        _db = db;
        _storage = storage;
        _currentUser = currentUser;
    }

    public async Task<string> Handle(
        UploadRoomImageCommand request,
        CancellationToken ct)
    {
        var room = await _db.Rooms
            .Include(r => r.House)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, ct);

        if (room is null)
            throw new NotFoundException(ErrorMessages.ROOM_NOT_FOUND);

        if (room.House.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        var url = await _storage.UploadImageAsync(
            request.ImageStream,
            request.FileName,
            $"tro88/rooms/{request.RoomId}",
            ct);

        var image = RoomImage.Create(request.RoomId, url);
        _db.RoomImages.Add(image);
        await _db.SaveChangesAsync(ct);

        return url;
    }
}