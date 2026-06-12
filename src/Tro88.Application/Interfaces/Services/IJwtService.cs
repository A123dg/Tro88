using Tro88.Domain.Entities;

namespace Tro88.Application.Interfaces.Services;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
