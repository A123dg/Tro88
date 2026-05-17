using Tro88.Domain.Entities;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.Houses.DTOs;

public sealed record HouseDto(
    Guid Id,
    string Name,
    string Address,
    string? Province,
    string? District,
    string? Description,
    bool IsActive,
    int TotalRooms,
    int OccupiedRooms,
    DateTime CreatedAt)
{
    public static HouseDto FromEntity(House h)
        => new(
            h.Id,
            h.Name,
            h.Address,
            h.Province,
            h.District,
            h.Description,
            h.IsActive,
            h.Rooms.Count,
            h.Rooms.Count(r => r.Status == RoomStatus.Occupied),
            h.CreatedAt);
};