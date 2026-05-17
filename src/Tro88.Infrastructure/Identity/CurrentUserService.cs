using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Tro88.Application.Common.Interfaces;

namespace Tro88.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    public Guid UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Guid.TryParse(userIdClaim, out var userId)
                ? userId
                : Guid.Empty;
        }
    }

    public string Email
        => _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;

    public string Role
        => _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

    public bool IsAuthenticated
        => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

    public bool IsInRole(string role)
        => _httpContextAccessor.HttpContext?.User.IsInRole(role) ?? false;
}