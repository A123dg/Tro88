using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Contracts.DTOs;

public sealed record TenantInRoomDto(
    Guid Id,
    Guid ContractId,
    Guid UserId,
    string FullName,
    string Email,
    string PhoneNumber,
    DateTime CheckIn,
    DateTime? CheckOut,
    string Status)
{
    public static TenantInRoomDto FromEntity(TenantInRoom t)
        => new(t.Id, t.ContractId, t.UserId,
               t.User.FullName, t.User.Email,
               t.User.PhoneNumber,
               t.CheckIn, t.CheckOut, t.Status);
}
