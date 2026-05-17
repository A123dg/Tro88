using MediatR;
using Tro88.Application.Features.Rooms.DTOs;

namespace Tro88.Application.Features.Rooms.Queries.GetRoomById;

public sealed record GetRoomByIdQuery(Guid Id) : IRequest<RoomDto>;