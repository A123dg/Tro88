using MediatR;

namespace Tro88.Application.Features.ServiceFees.Commands.DeleteServiceFee;

public record DeleteServiceFeeCommand(Guid Id) : IRequest<Unit>;