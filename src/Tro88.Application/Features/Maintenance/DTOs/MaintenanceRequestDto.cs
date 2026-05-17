using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Maintenance.DTOs;

public sealed record MaintenanceRequestDto(
    Guid Id,
    Guid RoomId,
    string RoomNumber,
    string RequestedByName,
    string? AssignedToName,
    string Title,
    string Description,
    string Category,
    string Priority,
    string Status,
    List<string> ImageUrls,
    string? ResolutionNote,
    DateTime? ResolvedAt,
    DateTime CreatedAt)
{
    public static MaintenanceRequestDto FromEntity(MaintenanceRequest m)
        => new(m.Id, m.RoomId, m.Room.RoomNumber,
               m.RequestedBy.FullName,
               m.AssignedTo?.FullName,
               m.Title, m.Description,
               m.Category, m.Priority,
               m.Status.ToString(),
               m.ImageUrls,
               m.ResolutionNote, m.ResolvedAt,
               m.CreatedAt);
}
