using MediatR;
using Tro88.Application.Features.Auth.DTOs;

namespace Tro88.Application.Features.Auth.Commands.Login;

public sealed record LoginCommand(
    string Username,
    string Password) : IRequest<AuthResponseDto>;
