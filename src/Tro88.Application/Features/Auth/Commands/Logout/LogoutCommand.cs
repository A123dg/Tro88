using MediatR;

namespace Tro88.Application.Features.Auth.Commands.Logout;

public record LogoutCommand : IRequest<Unit>;