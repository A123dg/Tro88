using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.UtilityReadings.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.UtilityReadings.Commands.RecordUtilityReading;

public sealed class RecordUtilityReadingCommandHandler
    : IRequestHandler<RecordUtilityReadingCommand, UtilityReadingDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordUtilityReadingCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UtilityReadingDto> Handle(
        RecordUtilityReadingCommand request,
        CancellationToken ct)
    {
        var room = await _db.Rooms
            .Include(r => r.House)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId && !r.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.ROOM_NOT_FOUND);

        if (room.House.OwnerId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        var existing = await _db.UtilityReadings
            .FirstOrDefaultAsync(r =>
                r.RoomId == request.RoomId &&
                r.Month == request.Month &&
                r.Year == request.Year, ct);

        if (existing != null)
            throw new BusinessRuleException(
                ErrorMessages.UTILITY_READING_ALREADY_EXISTS);

        var reading = UtilityReading.Create(
            request.RoomId,
            request.Month,
            request.Year,
            request.ElectricityOld,
            request.ElectricityNew,
            request.WaterOld,
            request.WaterNew,
            request.Notes);

        _db.UtilityReadings.Add(reading);
        await _db.SaveChangesAsync(ct);

        reading = await _db.UtilityReadings
            .AsNoTracking()
            .Include(r => r.Room)
            .FirstAsync(r => r.Id == reading.Id, ct);

        return UtilityReadingDto.FromEntity(reading);
    }
}
