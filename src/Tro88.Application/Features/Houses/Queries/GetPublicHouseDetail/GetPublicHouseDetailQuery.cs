using System;
using MediatR;
using Tro88.Application.Features.Houses.DTOs;

namespace Tro88.Application.Features.Houses.Queries.GetPublicHouseDetail;

public sealed record GetPublicHouseDetailQuery(Guid Id) : IRequest<PublicHouseDetailDto>;
