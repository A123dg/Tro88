using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Rooms.DTOs;

public record RoomServiceFeeDto(Guid ServiceId, string Name, decimal Amount);

public sealed record RoomDto(
    Guid Id,
    Guid HouseId,
    string RoomNumber,
    int Floor,
    decimal Area,
    int MaxOccupants,
    decimal MonthlyRent,
    decimal DepositAmount,
    string Status,
    decimal ElectricityUnitPrice,
    decimal WaterUnitPrice,
    string? Description,
    List<string> ImageUrls,
    List<RoomServiceFeeDto> ServiceFees)
{
    public static RoomDto FromEntity(Room r)
        => new(
            r.Id,
            r.HouseId,
            r.RoomNumber,
            r.Floor,
            r.Area,
            r.MaxOccupants,
            r.MonthlyRent,
            r.DepositAmount,
            r.Status.ToString(),
            r.ElectricityUnitPrice,
            r.WaterUnitPrice,
            r.Description,
            r.Images.Select(i => i.Url).ToList(),
            r.RoomServiceFees?.Select(rs => new RoomServiceFeeDto(rs.ServiceId, rs.Service?.Name ?? string.Empty, rs.Amount)).ToList() ?? new List<RoomServiceFeeDto>());
};