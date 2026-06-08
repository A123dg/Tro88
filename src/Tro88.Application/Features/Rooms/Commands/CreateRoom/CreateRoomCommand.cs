using MediatR;
using Tro88.Application.Features.Rooms.DTOs;

namespace Tro88.Application.Features.Rooms.Commands.CreateRoom;

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
    List<RoomServiceFeeInput>? ServiceFees = null) : IRequest<RoomDto>;