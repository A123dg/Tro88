using Tro88.Domain.Entities.Common;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class House : SoftDeleteEntity
{
    public Guid OwnerId { get; private set; }
    public string Name { get; private set; } = default!;
    public string Address { get; private set; } = default!;
    public string? Province { get; private set; }
    public string? District { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;

    public User Owner { get; private set; } = default!;
    public ICollection<Room> Rooms { get; private set; } = new List<Room>();
    public ICollection<ServiceFee> ServiceFees { get; private set; } = new List<ServiceFee>();

    private House() { }

    public static House Create(
        Guid ownerId, string name, string address,
        string? province = null, string? district = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("House name is required");
        if (string.IsNullOrWhiteSpace(address))
            throw new DomainException("Address is required");

        return new House
        {
            OwnerId = ownerId,
            Name = name,
            Address = address,
            Province = province,
            District = district,
            Description = description
        };
    }

    public void Update(
        string name, string address,
        string? province, string? district,
        string? description)
    {
        Name = name;
        Address = address;
        Province = province;
        District = district;
        Description = description;
    }
}