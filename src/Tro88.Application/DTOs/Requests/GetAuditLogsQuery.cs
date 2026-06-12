using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;

namespace Tro88.Application.Services;

public record GetAuditLogsQuery(
    Guid? UserId = null,
    string? Module = null,
    string? Action = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<AuditLogDto>>
{
public sealed class Handler
    : IRequestHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IAppDbContext _db;

    public Handler(IAppDbContext db) => _db = db;

    public async Task<PagedResult<AuditLogDto>> Handle(
        GetAuditLogsQuery request,
        CancellationToken ct)
    {
        var query = _db.AuditLogs.AsNoTracking();

        if (request.UserId.HasValue)
            query = query.Where(a => a.UserId == request.UserId);

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(a => a.Module == request.Module);

        if (!string.IsNullOrWhiteSpace(request.Action))
            query = query.Where(a => a.Action == request.Action);

        if (request.From.HasValue)
            query = query.Where(a => a.CreatedAt >= request.From);

        if (request.To.HasValue)
            query = query.Where(a => a.CreatedAt <= request.To);

        var total = await query.CountAsync(ct);

        var logs = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var items = logs.Select(AuditLogDto.FromEntity).ToList();

        return new PagedResult<AuditLogDto>(
            items, total, request.Page, request.PageSize);
    }
}
}


