using MediatR;
using Tro88.Application.Features.Contracts.DTOs;

namespace Tro88.Application.Features.Contracts.Commands.TerminateContract;

public sealed record TerminateContractCommand(
    Guid Id,
    string Reason) : IRequest<ContractDto>;