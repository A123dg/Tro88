using MediatR;
using Tro88.Application.Features.Services.DTOs;

namespace Tro88.Application.Features.Services.Commands.CreateService;

public record CreateServiceCommand(
    string Name,
    string FeeType,
    string? Unit = null) : IRequest<ServiceDto>;
