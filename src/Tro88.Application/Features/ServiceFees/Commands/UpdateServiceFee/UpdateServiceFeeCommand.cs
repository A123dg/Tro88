using MediatR;
using Tro88.Application.Features.ServiceFees.DTOs;

namespace Tro88.Application.Features.ServiceFees.Commands.UpdateServiceFee;

public record UpdateServiceFeeCommand(
    Guid Id,
    string Name,
    string FeeType,
    decimal Amount,
    string? Unit = null) : IRequest<ServiceFeeDto>;
