using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record RoomServiceFeeInput(Guid ServiceId, decimal Amount);

public sealed record CreateRoomCommand(
    Guid HouseId,
    string RoomNumber,
    int Floor,
    decimal Area,
    int MaxOccupants,
    decimal MonthlyRent,
    decimal DepositAmount,
    decimal ElectricityUnitPrice,
    decimal WaterUnitPrice,
    string? Description = null,
    List<RoomServiceFeeInput>? ServiceFees = null) : IRequest<RoomDto>
{
public sealed class Handler
    : IRequestHandler<CreateRoomCommand, RoomDto>
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
        CreateRoomCommand request,
        CancellationToken ct)
    {
        var house = await _db.Houses
            .FirstOrDefaultAsync(h => h.Id == request.HouseId, ct);

        if (house is null)
            throw new NotFoundException(ErrorMessages.HOUSE_NOT_FOUND);

        if (house.OwnerId != _currentUser.UserId &&
            _currentUser.Role != "Admin")
            throw new ForbiddenException(
                ErrorMessages.HOUSE_ACCESS_DENIED);

        var room = Room.Create(
            request.HouseId,
            request.RoomNumber,
            request.Floor,
            request.Area,
            request.MaxOccupants,
            request.MonthlyRent,
            request.DepositAmount,
            request.ElectricityUnitPrice,
            request.WaterUnitPrice,
            request.Description);

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync(ct);

        if (request.ServiceFees != null && request.ServiceFees.Any())
        {
            foreach (var sf in request.ServiceFees)
            {
                var roomServiceFee = RoomServiceFee.Create(room.Id, sf.ServiceId, sf.Amount);
                _db.RoomServiceFees.Add(roomServiceFee);
            }
            await _db.SaveChangesAsync(ct);
        }

        var savedRoom = await _db.Rooms
            .Include(r => r.Images)
            .Include(r => r.RoomServiceFees)
            .ThenInclude(rs => rs.Service)
            .FirstAsync(r => r.Id == room.Id, ct);

        return RoomDto.FromEntity(savedRoom);
    }
}
}


