using MediatR;
using Tro88.Application.Features.ServiceFees.DTOs;

namespace Tro88.Application.Features.ServiceFees.Commands.CreateServiceFee;

public record CreateServiceFeeCommand(
    Guid HouseId,
    Guid ServiceId,
    decimal Amount) : IRequest<ServiceFeeDto>;
