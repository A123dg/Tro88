using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.Rooms.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.Rooms.Commands.UpdateRoom;

public sealed class UpdateRoomCommandHandler
    : IRequestHandler<UpdateRoomCommand, RoomDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateRoomCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<RoomDto> Handle(
        UpdateRoomCommand request,
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

        room.UpdatePrices(
            request.MonthlyRent,
            request.ElectricityUnitPrice,
            request.WaterUnitPrice);

        // Update room service fees
        var existingFees = await _db.RoomServiceFees
            .Where(rs => rs.RoomId == room.Id)
            .ToListAsync(ct);

        _db.RoomServiceFees.RemoveRange(existingFees);

        if (request.ServiceFees != null && request.ServiceFees.Any())
        {
            foreach (var sf in request.ServiceFees)
            {
                var roomServiceFee = RoomServiceFee.Create(room.Id, sf.ServiceId, sf.Amount);
                _db.RoomServiceFees.Add(roomServiceFee);
            }
        }

        await _db.SaveChangesAsync(ct);

        var savedRoom = await _db.Rooms
            .Include(r => r.Images)
            .Include(r => r.RoomServiceFees)
            .ThenInclude(rs => rs.Service)
            .FirstAsync(r => r.Id == room.Id, ct);

        return RoomDto.FromEntity(savedRoom);
    }
}
