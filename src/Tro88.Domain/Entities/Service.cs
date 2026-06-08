using Tro88.Domain.Entities.Common;

namespace Tro88.Domain.Entities;

public class Service : AuditableEntity
{
    public string Name { get; private set; } = default!;
    public string FeeType { get; private set; } = default!; // e.g. Fixed, Usage
    public string? Unit { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Service() { }

    public static Service Create(string name, string feeType, string? unit = null)
    {
        return new Service
        {
            Name = name,
            FeeType = feeType,
            Unit = unit,
            IsActive = true
        };
    }

    public static Service CreateSeeded(Guid id, string name, string feeType, string? unit = null)
    {
        return new Service
        {
            Id = id,
            Name = name,
            FeeType = feeType,
            Unit = unit,
            IsActive = true
        };
    }

    public void Update(string name, string feeType, string? unit = null)
    {
        Name = name;
        FeeType = feeType;
        Unit = unit;
    }

    public void Toggle() => IsActive = !IsActive;
}
