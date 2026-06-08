using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Services.DTOs;

public sealed record ServiceDto(
    Guid Id,
    string Name,
    string FeeType,
    string? Unit,
    bool IsActive,
    DateTime CreatedAt)
{
    public static ServiceDto FromEntity(Service s)
        => new(s.Id, s.Name, s.FeeType, s.Unit, s.IsActive, s.CreatedAt);
}
