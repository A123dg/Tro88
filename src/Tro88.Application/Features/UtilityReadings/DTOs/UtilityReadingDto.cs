using Tro88.Domain.Entities;

namespace Tro88.Application.Features.UtilityReadings.DTOs;

public sealed record UtilityReadingDto(
    Guid Id,
    Guid RoomId,
    string RoomNumber,
    int Month,
    int Year,
    decimal ElectricityOld,
    decimal ElectricityNew,
    decimal ElectricityUsage,
    decimal WaterOld,
    decimal WaterNew,
    decimal WaterUsage,
    string? Notes,
    DateTime CreatedAt)
{
    public static UtilityReadingDto FromEntity(UtilityReading u)
        => new(u.Id, u.RoomId, u.Room.RoomNumber,
               u.Month, u.Year,
               u.ElectricityOld, u.ElectricityNew,
               u.ElectricityUsage,
               u.WaterOld, u.WaterNew, u.WaterUsage,
               u.Notes, u.CreatedAt);
}
