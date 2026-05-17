namespace Tro88.Application.Features.Auth.DTOs;

public sealed record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    Guid UserId,
    string FullName,
    string Email,
    string Role);