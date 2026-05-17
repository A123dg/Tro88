using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.UtilityReadings.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.UtilityReadings.Commands.BulkRecordReadings;

public sealed class BulkRecordReadingsCommandHandler
    : IRequestHandler<BulkRecordReadingsCommand, List<UtilityReadingDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public BulkRecordReadingsCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<UtilityReadingDto>> Handle(
        BulkRecordReadingsCommand request,
        CancellationToken ct)
    {
        var roomIds = request.Readings.Select(r => r.RoomId).Distinct().ToList();

        var rooms = await _db.Rooms
            .Include(r => r.House)
            .Where(r => roomIds.Contains(r.Id) && !r.IsDeleted)
            .ToDictionaryAsync(r => r.Id, ct);

        if (rooms.Count != roomIds.Count)
            throw new NotFoundException(ErrorMessages.ROOM_NOT_FOUND);

        foreach (var room in rooms.Values)
        {
            if (room.House.OwnerId != _currentUser.UserId)
                throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);
        }

        var results = new List<UtilityReadingDto>();

        foreach (var item in request.Readings)
        {
            var existing = await _db.UtilityReadings
                .FirstOrDefaultAsync(r =>
                    r.RoomId == item.RoomId &&
                    r.Month == item.Month &&
                    r.Year == item.Year, ct);

            if (existing != null)
                continue;

            var reading = UtilityReading.Create(
                item.RoomId,
                item.Month,
                item.Year,
                item.ElectricityOld,
                item.ElectricityNew,
                item.WaterOld,
                item.WaterNew,
                item.Notes);

            _db.UtilityReadings.Add(reading);
            results.Add(new UtilityReadingDto(
                reading.Id,
                reading.RoomId,
                rooms[item.RoomId].RoomNumber,
                reading.Month,
                reading.Year,
                reading.ElectricityOld,
                reading.ElectricityNew,
                reading.ElectricityUsage,
                reading.WaterOld,
                reading.WaterNew,
                reading.WaterUsage,
                reading.Notes,
                reading.CreatedAt));
        }

        await _db.SaveChangesAsync(ct);
        return results;
    }
}
