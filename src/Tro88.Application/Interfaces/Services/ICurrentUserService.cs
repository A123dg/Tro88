namespace Tro88.Application.Interfaces.Services;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string Email { get; }
    string Role { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
}
