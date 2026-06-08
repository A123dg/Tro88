using MediatR;
using Tro88.Application.Features.Services.DTOs;

namespace Tro88.Application.Features.Services.Commands.UpdateService;

public record UpdateServiceCommand(
    Guid Id,
    string Name,
    string FeeType,
    string? Unit = null) : IRequest<ServiceDto>;
