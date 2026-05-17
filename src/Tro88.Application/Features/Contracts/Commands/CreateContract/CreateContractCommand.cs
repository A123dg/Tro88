using MediatR;
using Tro88.Application.Features.Contracts.DTOs;

namespace Tro88.Application.Features.Contracts.Commands.CreateContract;

public sealed record CreateContractCommand(
    Guid RoomId,
    Guid TenantId,
    DateTime StartDate,
    DateTime EndDate,
    decimal MonthlyRent,
    decimal DepositAmount,
    int PaymentDay,
    string? Terms = null) : IRequest<ContractDto>;