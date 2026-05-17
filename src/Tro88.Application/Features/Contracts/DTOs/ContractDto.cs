using Tro88.Domain.Entities;

namespace Tro88.Application.Features.Contracts.DTOs;

public sealed record ContractDto(
    Guid Id,
    Guid RoomId,
    string RoomNumber,
    Guid TenantId,
    string TenantName,
    string ContractCode,
    DateTime StartDate,
    DateTime EndDate,
    decimal MonthlyRent,
    decimal DepositAmount,
    int PaymentDayOfMonth,
    string Status,
    DateTime? SignedAt)
{
    public static ContractDto FromEntity(Contract c)
        => new(
            c.Id,
            c.RoomId,
            c.Room.RoomNumber,
            c.TenantId,
            c.Tenant.FullName,
            c.ContractCode,
            c.StartDate,
            c.EndDate,
            c.MonthlyRent,
            c.DepositAmount,
            c.PaymentDayOfMonth,
            c.Status.ToString(),
            c.SignedAt);
};