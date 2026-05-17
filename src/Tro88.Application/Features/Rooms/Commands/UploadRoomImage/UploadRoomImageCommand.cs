using MediatR;

namespace Tro88.Application.Features.Rooms.Commands.UploadRoomImage;

public sealed record UploadRoomImageCommand(
    Guid RoomId,
    Stream ImageStream,
    string FileName) : IRequest<string>;