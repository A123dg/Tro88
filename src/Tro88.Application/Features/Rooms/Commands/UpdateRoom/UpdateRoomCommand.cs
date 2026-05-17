using MediatR;
using Tro88.Application.Features.Rooms.DTOs;

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
    string? Description = null) : IRequest<RoomDto>;