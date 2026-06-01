using MediatR;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.Application.Features.Houses.Commands.ChangeHouseStatus;

public sealed record ChangeHouseStatusCommand(
    Guid Id,
    string Status) : IRequest<HouseDto>;
