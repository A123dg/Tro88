namespace Tro88.Application.DTOs.Responses;

public sealed record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    Guid UserId,
    string FullName,
    string Email,
    string Role);
