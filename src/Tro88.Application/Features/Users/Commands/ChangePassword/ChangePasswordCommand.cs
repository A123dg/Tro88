using MediatR;

namespace Tro88.Application.Features.Users.Commands.ChangePassword;

public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword) : IRequest;
