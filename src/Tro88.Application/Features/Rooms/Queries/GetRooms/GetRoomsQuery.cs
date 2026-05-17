using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Rooms.DTOs;

namespace Tro88.Application.Features.Rooms.Queries.GetRooms;

public sealed record GetRoomsQuery(
    Guid? HouseId = null,
    int Page = 1,
    int PageSize = 10,
    string? Status = null) : IRequest<PagedResult<RoomDto>>;