using MediatR;
using Tro88.Application.Features.Services.DTOs;

namespace Tro88.Application.Features.Services.Commands.ToggleService;

public record ToggleServiceCommand(Guid Id) : IRequest<ServiceDto>;
