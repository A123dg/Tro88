using Tro88.Domain.Entities.Common;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class Room : SoftDeleteEntity
{
    public Guid HouseId { get; private set; }
    public string RoomNumber { get; private set; } = default!;
    public int Floor { get; private set; }
    public decimal Area { get; private set; }
    public int MaxOccupants { get; private set; }
    public decimal MonthlyRent { get; private set; }
    public decimal DepositAmount { get; private set; }
    public RoomStatus Status { get; private set; }
    public decimal ElectricityUnitPrice { get; private set; }
    public decimal WaterUnitPrice { get; private set; }
    public string? Description { get; private set; }

    public House House { get; private set; } = default!;
    public ICollection<RoomImage> Images { get; private set; } = new List<RoomImage>();
    public ICollection<Contract> Contracts { get; private set; } = new List<Contract>();
    public ICollection<UtilityReading> UtilityReadings { get; private set; } = new List<UtilityReading>();

    private Room() { }

    public static Room Create(
        Guid houseId, string roomNumber, int floor,
        decimal area, int maxOccupants,
        decimal monthlyRent, decimal depositAmount,
        decimal electricityUnitPrice, decimal waterUnitPrice,
        string? description = null)
    {
        if (monthlyRent <= 0)
            throw new DomainException("Monthly rent must be positive");
        if (area <= 0)
            throw new DomainException("Area must be positive");

        return new Room
        {
            HouseId = houseId,
            RoomNumber = roomNumber,
            Floor = floor,
            Area = area,
            MaxOccupants = maxOccupants,
            MonthlyRent = monthlyRent,
            DepositAmount = depositAmount,
            Status = RoomStatus.Available,
            ElectricityUnitPrice = electricityUnitPrice,
            WaterUnitPrice = waterUnitPrice,
            Description = description
        };
    }

    public void ChangeStatus(RoomStatus newStatus)
    {
        var allowed = new Dictionary<RoomStatus, List<RoomStatus>>
        {
            [RoomStatus.Available] = [RoomStatus.Occupied, RoomStatus.Maintenance],
            [RoomStatus.Occupied] = [RoomStatus.Available, RoomStatus.Maintenance],
            [RoomStatus.Maintenance] = [RoomStatus.Available]
        };

        if (!allowed[Status].Contains(newStatus))
            throw new BusinessRuleException($"Cannot transition from {Status} to {newStatus}");

        Status = newStatus;
    }

    public void UpdatePrices(
        decimal monthlyRent,
        decimal electricityUnitPrice,
        decimal waterUnitPrice)
    {
        if (monthlyRent <= 0)
            throw new DomainException("Monthly rent must be positive");
        MonthlyRent = monthlyRent;
        ElectricityUnitPrice = electricityUnitPrice;
        WaterUnitPrice = waterUnitPrice;
    }
}