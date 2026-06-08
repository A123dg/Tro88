using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Services.DTOs;

namespace Tro88.Application.Features.Services.Queries.GetServices;

public record GetServicesQuery(
    bool? IsActive = null,
    int Page = 1,
    int PageSize = 100) : IRequest<PagedResult<ServiceDto>>;
