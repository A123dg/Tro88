using MediatR;

namespace Tro88.Application.Features.Services.Commands.DeleteService;

public record DeleteServiceCommand(Guid Id) : IRequest<Unit>;
