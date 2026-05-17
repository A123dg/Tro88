using MediatR;
using Tro88.Application.Features.Auth.DTOs;

namespace Tro88.Application.Features.Auth.Commands.RefreshToken;

public sealed record RefreshTokenCommand(
    string RefreshToken) : IRequest<AuthResponseDto>;