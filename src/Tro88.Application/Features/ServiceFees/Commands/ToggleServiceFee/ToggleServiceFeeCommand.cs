using MediatR;
using Tro88.Application.Features.ServiceFees.DTOs;

namespace Tro88.Application.Features.ServiceFees.Commands.ToggleServiceFee;

public record ToggleServiceFeeCommand(Guid Id) : IRequest<ServiceFeeDto>;