using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Constants;
using Tro88.Application.DTOs.Responses;
using Tro88.Application.Interfaces.Services;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;
using Tro88.Domain.Exceptions;

namespace Tro88.Application.Services;

public record RecordUtilityReadingCommand(
    Guid RoomId,
    int Month,
    int Year,
    decimal? ElectricityOld,
    decimal ElectricityNew,
    decimal? WaterOld,
    decimal WaterNew,
    string? Notes = null) : IRequest<UtilityReadingDto>
{
public sealed class Handler
    : IRequestHandler<RecordUtilityReadingCommand, UtilityReadingDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public Handler(
        IAppDbContext db,
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

        // Fetch previous month's final readings (or latest reading before target month/year)
        var previousReading = await _db.UtilityReadings
            .Where(r => r.RoomId == request.RoomId && (r.Year < request.Year || (r.Year == request.Year && r.Month < request.Month)))
            .OrderByDescending(r => r.Year)
            .ThenByDescending(r => r.Month)
            .FirstOrDefaultAsync(ct);

        decimal electricityOld = previousReading?.ElectricityNew ?? 0;
        decimal waterOld = previousReading?.WaterNew ?? 0;

        if (request.ElectricityNew < electricityOld)
            throw new BusinessRuleException($"Chỉ số điện mới ({request.ElectricityNew}) phải lớn hơn hoặc bằng chỉ số cũ ({electricityOld})");
        if (request.WaterNew < waterOld)
            throw new BusinessRuleException($"Chỉ số nước mới ({request.WaterNew}) phải lớn hơn hoặc bằng chỉ số cũ ({waterOld})");

        var existing = await _db.UtilityReadings
            .FirstOrDefaultAsync(r =>
                r.RoomId == request.RoomId &&
                r.Month == request.Month &&
                r.Year == request.Year, ct);

        UtilityReading reading;
        if (existing != null)
        {
            existing.Update(request.ElectricityNew, request.WaterNew, request.Notes);
            reading = existing;
        }
        else
        {
            reading = UtilityReading.Create(
                request.RoomId,
                request.Month,
                request.Year,
                electricityOld,
                request.ElectricityNew,
                waterOld,
                request.WaterNew,
                request.Notes);
            _db.UtilityReadings.Add(reading);
        }

        // Generate/Update Invoice
        var contract = await _db.Contracts
            .Include(c => c.Room)
            .ThenInclude(r => r.House)
            .ThenInclude(h => h.ServiceFees)
            .FirstOrDefaultAsync(c =>
                c.RoomId == request.RoomId &&
                c.Status == ContractStatus.Active &&
                !c.IsDeleted, ct);

        if (contract != null)
        {
            var roomFees = await _db.RoomServiceFees
                .Where(rs => rs.RoomId == contract.RoomId)
                .ToListAsync(ct);

            decimal serviceAmount = 0;
            foreach (var houseFee in contract.Room.House.ServiceFees.Where(sf => sf.IsActive))
            {
                var roomOverride = roomFees.FirstOrDefault(rs => rs.ServiceId == houseFee.ServiceId);
                serviceAmount += roomOverride?.Amount ?? houseFee.Amount;
            }

            decimal electricityAmount = (request.ElectricityNew - electricityOld) * contract.Room.ElectricityUnitPrice;
            decimal waterAmount = (request.WaterNew - waterOld) * contract.Room.WaterUnitPrice;

            var existingInvoice = await _db.Invoices
                .FirstOrDefaultAsync(i =>
                    i.ContractId == contract.Id &&
                    i.BillingMonth == request.Month &&
                    i.BillingYear == request.Year &&
                    !i.IsDeleted, ct);

            if (existingInvoice != null)
            {
                existingInvoice.UpdateCharges(contract.MonthlyRent, electricityAmount, waterAmount, serviceAmount);
            }
            else
            {
                var dueDate = new DateTime(request.Year, request.Month, contract.PaymentDayOfMonth);
                if (dueDate < DateTime.UtcNow)
                    dueDate = dueDate.AddMonths(1);

                var newInvoice = Invoice.Create(
                    contract.Id,
                    contract.RoomId,
                    request.Month,
                    request.Year,
                    contract.MonthlyRent,
                    electricityAmount,
                    waterAmount,
                    serviceAmount,
                    dueDate);

                _db.Invoices.Add(newInvoice);
            }
        }

        await _db.SaveChangesAsync(ct);

        reading = await _db.UtilityReadings
            .AsNoTracking()
            .Include(r => r.Room)
            .FirstAsync(r => r.Id == reading.Id, ct);

        return UtilityReadingDto.FromEntity(reading);
    }
}
}


