using MediatR;
using Tro88.Application.Features.UtilityReadings.DTOs;

namespace Tro88.Application.Features.UtilityReadings.Commands.BulkRecordReadings;

public record BulkRecordReadingsCommand(
    List<ReadingItem> Readings) : IRequest<List<UtilityReadingDto>>;

public sealed record ReadingItem(
    Guid RoomId,
    int Month,
    int Year,
    decimal ElectricityOld,
    decimal ElectricityNew,
    decimal WaterOld,
    decimal WaterNew,
    string? Notes = null);
