using MediatR;
using Tro88.Application.Features.Users.DTOs;

namespace Tro88.Application.Features.Users.Commands.UpdateProfile;

public record UpdateProfileCommand(
    string FullName,
    string PhoneNumber,
    string? NationalId,
    DateTime? DateOfBirth) : IRequest<UserDto>;
