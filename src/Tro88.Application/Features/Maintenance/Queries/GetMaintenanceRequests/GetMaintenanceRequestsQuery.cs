using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Maintenance.DTOs;

namespace Tro88.Application.Features.Maintenance.Queries.GetMaintenanceRequests;

public record GetMaintenanceRequestsQuery(
    int Page = 1,
    int PageSize = 10,
    Guid? RoomId = null,
    string? Status = null) : IRequest<PagedResult<MaintenanceRequestDto>>;