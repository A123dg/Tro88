using MediatR;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.Application.Features.Houses.Queries.GetFavoriteHouses;

public sealed record GetFavoriteHousesQuery : IRequest<List<HouseDto>>;
