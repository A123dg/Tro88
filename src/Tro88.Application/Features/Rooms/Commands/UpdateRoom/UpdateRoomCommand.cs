using MediatR;
using Tro88.Application.Features.Rooms.DTOs;
using Tro88.Application.Features.Rooms.Commands.CreateRoom;

namespace Tro88.Application.Features.Rooms.Commands.UpdateRoom;

public sealed record UpdateRoomCommand(
    Guid Id,
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