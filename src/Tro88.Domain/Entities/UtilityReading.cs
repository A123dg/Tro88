using Tro88.Domain.Entities.Common;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class UtilityReading : AuditableEntity
{
    public Guid RoomId { get; private set; }
    public int Month { get; private set; }
    public int Year { get; private set; }
    public decimal ElectricityOld { get; private set; }
    public decimal ElectricityNew { get; private set; }
    public decimal ElectricityUsage { get; private set; }
    public decimal WaterOld { get; private set; }
    public decimal WaterNew { get; private set; }
    public decimal WaterUsage { get; private set; }
    public string? Notes { get; private set; }

    public Room Room { get; private set; } = default!;

    private UtilityReading() { }

    public static UtilityReading Create(
        Guid roomId, int month, int year,
        decimal electricityOld, decimal electricityNew,
        decimal waterOld, decimal waterNew,
        string? notes = null)
    {
        if (electricityNew < electricityOld)
            throw new DomainException(
                "New electricity reading must be >= old");
        if (waterNew < waterOld)
            throw new DomainException(
                "New water reading must be >= old");

        return new UtilityReading
        {
            RoomId = roomId,
            Month = month,
            Year = year,
            ElectricityOld = electricityOld,
            ElectricityNew = electricityNew,
            ElectricityUsage = electricityNew - electricityOld,
            WaterOld = waterOld,
            WaterNew = waterNew,
            WaterUsage = waterNew - waterOld,
            Notes = notes
        };
    }

    public void Update(
        decimal electricityNew,
        decimal waterNew,
        string? notes)
    {
        ElectricityNew = electricityNew;
        ElectricityUsage = electricityNew - ElectricityOld;
        WaterNew = waterNew;
        WaterUsage = waterNew - WaterOld;
        Notes = notes;
    }
}
