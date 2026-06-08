using Tro88.Domain.Entities;

namespace Tro88.Application.Features.ServiceFees.DTOs;

public sealed record ServiceFeeDto(
    Guid Id,
    Guid HouseId,
    Guid ServiceId,
    string Name,
    string FeeType,
    decimal Amount,
    string? Unit,
    bool IsActive,
    DateTime CreatedAt)
{
    public static ServiceFeeDto FromEntity(ServiceFee s)
        => new(s.Id, s.HouseId, s.ServiceId, s.Service?.Name ?? string.Empty, s.Service?.FeeType ?? string.Empty,
               s.Amount, s.Service?.Unit, s.IsActive, s.CreatedAt);
}
