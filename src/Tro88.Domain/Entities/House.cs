using Tro88.Domain.Entities.Common;
using Tro88.Domain.Enums;
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
    public List<string> MediaUrls { get; private set; } = new();
    public HouseStatus Status { get; private set; } = HouseStatus.PendingApproval;
    public bool IsActive { get; private set; }

    public User Owner { get; private set; } = default!;
    public ICollection<Room> Rooms { get; private set; } = new List<Room>();
    public ICollection<ServiceFee> ServiceFees { get; private set; } = new List<ServiceFee>();

    private House() { }

    public static House Create(
        Guid ownerId, string name, string address,
        string? province = null, string? district = null,
        string? description = null,
        IEnumerable<string>? mediaUrls = null,
        HouseStatus status = HouseStatus.PendingApproval)
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
            Description = description,
            MediaUrls = mediaUrls?.Where(url => !string.IsNullOrWhiteSpace(url)).ToList() ?? new List<string>(),
            Status = status,
            IsActive = status == HouseStatus.Active
        };
    }

    public void Update(
        string name, string address,
        string? province, string? district,
        string? description,
        IEnumerable<string>? mediaUrls)
    {
        Name = name;
        Address = address;
        Province = province;
        District = district;
        Description = description;
        MediaUrls = mediaUrls?.Where(url => !string.IsNullOrWhiteSpace(url)).ToList() ?? new List<string>();
    }

    public void ChangeStatus(HouseStatus status)
    {
        Status = status;
        IsActive = status == HouseStatus.Active;
    }
}
