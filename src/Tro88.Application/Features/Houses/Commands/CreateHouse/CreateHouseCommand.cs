using MediatR;
using System;
using System.Collections.Generic;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.Application.Features.Houses.Commands.CreateHouse;

public record HouseServiceInput(Guid ServiceId, decimal Amount);

public sealed record CreateHouseCommand(
    string Name,
    string Address,
    string? Province = null,
    string? District = null,
    string? Description = null,
    List<string>? MediaUrls = null,
    List<HouseServiceInput>? Services = null) : IRequest<HouseDto>;
