using MediatR;
using Tro88.Application.Features.Users.DTOs;

namespace Tro88.Application.Features.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<UserDto>;
