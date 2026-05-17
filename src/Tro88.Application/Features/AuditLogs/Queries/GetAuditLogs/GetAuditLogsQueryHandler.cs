using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.AuditLogs.DTOs;

namespace Tro88.Application.Features.AuditLogs.Queries.GetAuditLogs;

public sealed class GetAuditLogsQueryHandler
    : IRequestHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    private readonly IApplicationDbContext _db;

    public GetAuditLogsQueryHandler(IApplicationDbContext db) => _db = db;

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
