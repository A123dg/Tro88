using MediatR;

namespace Tro88.Application.Features.Houses.Commands.DeleteHouse;

public sealed record DeleteHouseCommand(Guid Id) : IRequest<bool>;