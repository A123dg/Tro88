using MediatR;
using Tro88.Application.Common.Models;
using Tro88.Application.Features.AuditLogs.DTOs;

namespace Tro88.Application.Features.AuditLogs.Queries.GetAuditLogs;

public record GetAuditLogsQuery(
    Guid? UserId = null,
    string? Module = null,
    string? Action = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<AuditLogDto>>;
