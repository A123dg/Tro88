using MediatR;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.Application.Features.Houses.Commands.UpdateHouse;

public sealed record UpdateHouseCommand(
    Guid Id,
    string Name,
    string Address,
    string? Province = null,
    string? District = null,
    string? Description = null) : IRequest<HouseDto>;