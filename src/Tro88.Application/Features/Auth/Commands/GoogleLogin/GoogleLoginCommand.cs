using MediatR;
using Tro88.Application.Features.Auth.DTOs;

namespace Tro88.Application.Features.Auth.Commands.GoogleLogin;

public sealed record GoogleLoginCommand(
    string IdToken,
    string? Role = null) : IRequest<AuthResponseDto>;
