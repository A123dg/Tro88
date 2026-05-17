using MediatR;
using Tro88.Application.Features.UtilityReadings.DTOs;

namespace Tro88.Application.Features.UtilityReadings.Commands.RecordUtilityReading;

public record RecordUtilityReadingCommand(
    Guid RoomId,
    int Month,
    int Year,
    decimal ElectricityOld,
    decimal ElectricityNew,
    decimal WaterOld,
    decimal WaterNew,
    string? Notes = null) : IRequest<UtilityReadingDto>;
