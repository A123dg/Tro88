using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Features.UtilityReadings.Queries.GetUtilityReadingPreview;

public record GetUtilityReadingPreviewQuery(
    Guid HouseId,
    int Month,
    int Year) : IRequest<List<UtilityReadingPreviewDto>>;

public record UtilityReadingPreviewDto(
    Guid RoomId,
    string RoomNumber,
    decimal ElectricityUnitPrice,
    decimal WaterUnitPrice,
    decimal ElectricityOld,
    decimal WaterOld,
    decimal? ElectricityNew,
    decimal? WaterNew,
    string? Notes,
    bool HasContract
);

public class GetUtilityReadingPreviewQueryHandler
    : IRequestHandler<GetUtilityReadingPreviewQuery, List<UtilityReadingPreviewDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetUtilityReadingPreviewQueryHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<UtilityReadingPreviewDto>> Handle(
        GetUtilityReadingPreviewQuery request,
        CancellationToken ct)
    {
        var house = await _db.Houses
            .FirstOrDefaultAsync(h => h.Id == request.HouseId && !h.IsDeleted, ct)
            ?? throw new NotFoundException(ErrorMessages.HOUSE_NOT_FOUND);

        if (house.OwnerId != _currentUser.UserId)
            throw new ForbiddenException(ErrorMessages.ACCESS_DENIED);

        var rooms = await _db.Rooms
            .Where(r => r.HouseId == request.HouseId && !r.IsDeleted)
            .OrderBy(r => r.RoomNumber)
            .ToListAsync(ct);

        var results = new List<UtilityReadingPreviewDto>();

        var startOfBillingMonth = new DateTime(request.Year, request.Month, 1);
        var endOfBillingMonth = new DateTime(request.Year, request.Month, DateTime.DaysInMonth(request.Year, request.Month));

        foreach (var room in rooms)
        {
            var hasContract = await _db.Contracts.AnyAsync(c =>
                c.RoomId == room.Id &&
                c.Status == ContractStatus.Active &&
                c.StartDate <= endOfBillingMonth &&
                c.EndDate >= startOfBillingMonth &&
                !c.IsDeleted, ct);

            var existingReading = await _db.UtilityReadings
                .FirstOrDefaultAsync(r =>
                    r.RoomId == room.Id &&
                    r.Month == request.Month &&
                    r.Year == request.Year, ct);

            var previousReading = await _db.UtilityReadings
                .Where(r => r.RoomId == room.Id && (r.Year < request.Year || (r.Year == request.Year && r.Month < request.Month)))
                .OrderByDescending(r => r.Year)
                .ThenByDescending(r => r.Month)
                .FirstOrDefaultAsync(ct);

            results.Add(new UtilityReadingPreviewDto(
                room.Id,
                room.RoomNumber,
                room.ElectricityUnitPrice,
                room.WaterUnitPrice,
                previousReading?.ElectricityNew ?? 0,
                previousReading?.WaterNew ?? 0,
                existingReading?.ElectricityNew,
                existingReading?.WaterNew,
                existingReading?.Notes,
                hasContract
            ));
        }

        return results;
    }
}
