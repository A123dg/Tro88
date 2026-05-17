using MediatR;

namespace Tro88.Application.Features.Rooms.Commands.DeleteRoom;

public sealed record DeleteRoomCommand(Guid Id) : IRequest<bool>;