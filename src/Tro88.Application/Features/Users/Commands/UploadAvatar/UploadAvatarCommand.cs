using MediatR;

namespace Tro88.Application.Features.Users.Commands.UploadAvatar;

public record UploadAvatarCommand(
    Stream ImageStream,
    string FileName) : IRequest<string>;
