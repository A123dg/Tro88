using Tro88.Domain.Entities;

namespace Tro88.Application.Features.ServiceFees.DTOs;

public sealed record ServiceFeeDto(
    Guid Id,
    Guid HouseId,
    string Name,
    string FeeType,
    decimal Amount,
    string? Unit,
    bool IsActive,
    DateTime CreatedAt)
{
    public static ServiceFeeDto FromEntity(ServiceFee s)
        => new(s.Id, s.HouseId, s.Name, s.FeeType,
               s.Amount, s.Unit, s.IsActive, s.CreatedAt);
}
