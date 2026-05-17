using MediatR;
using Tro88.Application.Features.Auth.DTOs;

namespace Tro88.Application.Features.Auth.Commands.Register;

public sealed record RegisterCommand(
    string FullName,
    string Email,
    string PhoneNumber,
    string Password,
    string Role) : IRequest<AuthResponseDto>;