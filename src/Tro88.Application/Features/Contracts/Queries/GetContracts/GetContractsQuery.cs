using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.Contracts.DTOs;

namespace Tro88.Application.Features.Contracts.Queries.GetContracts;

public sealed record GetContractsQuery(
    Guid? RoomId = null,
    Guid? TenantId = null,
    int Page = 1,
    int PageSize = 10,
    string? Status = null) : IRequest<PagedResult<ContractDto>>;