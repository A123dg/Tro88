using Tro88.Domain.Entities.Common;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Domain.Entities;

public class MaintenanceRequest : AuditableEntity
{
    public Guid RoomId { get; private set; }
    public Guid RequestedByUserId { get; private set; }
    public Guid? AssignedToUserId { get; private set; }
    public string Title { get; private set; } = default!;
    public string Description { get; private set; } = default!;
    public string Category { get; private set; } = default!;
    public string Priority { get; private set; } = default!;
    public MaintenanceStatus Status { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public string? ResolutionNote { get; private set; }
    public List<string> ImageUrls { get; private set; } = new();

    public Room Room { get; private set; } = default!;
    public User RequestedBy { get; private set; } = default!;
    public User? AssignedTo { get; private set; }

    private MaintenanceRequest() { }

    public static MaintenanceRequest Create(
        Guid roomId, Guid requestedByUserId,
        string title, string description,
        string category, string priority)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Title is required");

        return new MaintenanceRequest
        {
            RoomId = roomId,
            RequestedByUserId = requestedByUserId,
            Title = title,
            Description = description,
            Category = category,
            Priority = priority,
            Status = MaintenanceStatus.Open
        };
    }

    public void Assign(Guid assignedToUserId)
    {
        AssignedToUserId = assignedToUserId;
        Status = MaintenanceStatus.InProgress;
    }

    public void Resolve(string resolutionNote)
    {
        if (Status == MaintenanceStatus.Resolved)
            throw new BusinessRuleException("Already resolved");
        Status = MaintenanceStatus.Resolved;
        ResolutionNote = resolutionNote;
        ResolvedAt = DateTime.UtcNow;
    }

    public void AddImage(string imageUrl)
        => ImageUrls.Add(imageUrl);
}
