using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Rooms.DTOs;

public record RoomServiceFeeDto(Guid ServiceId, string Name, decimal Amount);

public sealed record RoomOccupantDto(
    Guid UserId,
    string FullName,
    string? Email,
    string? PhoneNumber,
    DateTime CheckIn,
    string RelationType
);

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
    List<RoomServiceFeeDto> ServiceFees,
    List<RoomOccupantDto> Occupants)
{
    public static RoomDto FromEntity(Room r)
    {
        var occupants = new List<RoomOccupantDto>();
        var activeContract = r.Contracts?.FirstOrDefault(c => c.Status == Tro88.Domain.Enums.ContractStatus.Active && !c.IsDeleted);
        if (activeContract != null)
        {
            if (activeContract.Tenant != null && !activeContract.Tenant.IsDeleted)
            {
                occupants.Add(new RoomOccupantDto(
                    activeContract.Tenant.Id,
                    activeContract.Tenant.FullName,
                    activeContract.Tenant.Email,
                    activeContract.Tenant.PhoneNumber,
                    activeContract.StartDate,
                    "Chủ hợp đồng"
                ));
            }

            if (activeContract.TenantInRooms != null)
            {
                foreach (var tr in activeContract.TenantInRooms)
                {
                    if (tr.User != null && !tr.User.IsDeleted && tr.Status == "staying")
                    {
                        occupants.Add(new RoomOccupantDto(
                            tr.User.Id,
                            tr.User.FullName,
                            tr.User.Email,
                            tr.User.PhoneNumber,
                            tr.CheckIn,
                            "Thành viên phòng"
                        ));
                    }
                }
            }
        }

        return new RoomDto(
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
            r.RoomServiceFees?.Select(rs => new RoomServiceFeeDto(rs.ServiceId, rs.Service?.Name ?? string.Empty, rs.Amount)).ToList() ?? new List<RoomServiceFeeDto>(),
            occupants);
    }
};