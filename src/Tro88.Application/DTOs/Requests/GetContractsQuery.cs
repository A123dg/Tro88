using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Enums;

namespace Tro88.Application.Services;

public sealed record GetContractsQuery(
    Guid? RoomId = null,
    Guid? TenantId = null,
    int Page = 1,
    int PageSize = 10,
    string? Status = null,
    string? Keyword = null) : IRequest<PagedResult<ContractDto>>
{
public sealed class Handler
    : IRequestHandler<GetContractsQuery, PagedResult<ContractDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(
        IAppDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<ContractDto>> Handle(
        GetContractsQuery request,
        CancellationToken ct)
    {
        var query = _db.Contracts
            .Include(c => c.Room)
            .Include(c => c.Tenant)
            .AsQueryable();

        if (_currentUser.Role == "Owner")
        {
            query = query.Where(c => c.OwnerId == _currentUser.UserId);
        }
        else if (_currentUser.Role == "Tenant")
        {
            query = query.Where(c => c.TenantId == _currentUser.UserId);
        }

        if (request.RoomId.HasValue)
            query = query.Where(c => c.RoomId == request.RoomId);

        if (request.TenantId.HasValue)
            query = query.Where(c => c.TenantId == request.TenantId);

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var search = request.Keyword.Trim().ToLower();
            query = query.Where(c =>
                c.Room.RoomNumber.ToLower().Contains(search) ||
                c.Tenant.FullName.ToLower().Contains(search) ||
                c.Tenant.PhoneNumber.Contains(search));
        }

        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<ContractStatus>(request.Status, true, out var status))
                query = query.Where(c => c.Status == status);
        }

        var total = await query.CountAsync(ct);
        var totalPage = (int)Math.Ceiling(total / (double)request.PageSize);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => ContractDto.FromEntity(c))
            .ToListAsync(ct);

        return new PagedResult<ContractDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total,
            TotalPage = totalPage
        };
    }
}
}


