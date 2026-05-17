using MediatR;
using Tro88.Application.Features.Rooms.DTOs;

namespace Tro88.Application.Features.Rooms.Commands.ChangeRoomStatus;

public sealed record ChangeRoomStatusCommand(
    Guid Id,
    string Status) : IRequest<RoomDto>;