using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.Application.Features.Houses.Queries.GetHouses;

public sealed record GetHousesQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null) : IRequest<PagedResult<HouseDto>>;