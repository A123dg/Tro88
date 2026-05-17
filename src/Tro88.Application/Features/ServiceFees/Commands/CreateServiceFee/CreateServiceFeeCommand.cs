using MediatR;
using Tro88.Application.Features.ServiceFees.DTOs;

namespace Tro88.Application.Features.ServiceFees.Commands.CreateServiceFee;

public record CreateServiceFeeCommand(
    Guid HouseId,
    string Name,
    string FeeType,
    decimal Amount,
    string? Unit = null) : IRequest<ServiceFeeDto>;
