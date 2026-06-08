using MediatR;
using Tro88.Application.Features.ServiceFees.DTOs;

namespace Tro88.Application.Features.ServiceFees.Commands.UpdateServiceFee;

public record UpdateServiceFeeCommand(
    Guid Id,
    decimal Amount) : IRequest<ServiceFeeDto>;
