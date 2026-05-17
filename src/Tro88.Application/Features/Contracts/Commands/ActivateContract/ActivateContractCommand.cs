using MediatR;
using Tro88.Application.Features.Contracts.DTOs;

namespace Tro88.Application.Features.Contracts.Commands.ActivateContract;

public sealed record ActivateContractCommand(Guid Id) : IRequest<ContractDto>;