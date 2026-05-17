using MediatR;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.Application.Features.Houses.Queries.GetHouseById;

public sealed record GetHouseByIdQuery(Guid Id) : IRequest<HouseDto>;