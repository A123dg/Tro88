using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.ServiceFees.DTOs;

namespace Tro88.Application.Features.ServiceFees.Queries.GetServiceFees;

public record GetServiceFeesQuery(
    Guid? HouseId,
    bool? IsActive,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ServiceFeeDto>>;