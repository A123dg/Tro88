using MediatR;
using Microsoft.EntityFrameworkCore;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.UtilityReadings.DTOs;
using Tro88.Domain.Entities;
using Tro88.Domain.Enums;
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
            var previousReading = await _db.UtilityReadings
                .Where(r => r.RoomId == item.RoomId && (r.Year < item.Year || (r.Year == item.Year && r.Month < item.Month)))
                .OrderByDescending(r => r.Year)
                .ThenByDescending(r => r.Month)
                .FirstOrDefaultAsync(ct);

            decimal electricityOld = previousReading?.ElectricityNew ?? 0;
            decimal waterOld = previousReading?.WaterNew ?? 0;

            if (item.ElectricityNew < electricityOld)
                throw new BusinessRuleException($"Phòng {rooms[item.RoomId].RoomNumber}: Chỉ số điện mới ({item.ElectricityNew}) phải lớn hơn hoặc bằng chỉ số cũ ({electricityOld})");
            if (item.WaterNew < waterOld)
                throw new BusinessRuleException($"Phòng {rooms[item.RoomId].RoomNumber}: Chỉ số nước mới ({item.WaterNew}) phải lớn hơn hoặc bằng chỉ số cũ ({waterOld})");

            var existing = await _db.UtilityReadings
                .FirstOrDefaultAsync(r =>
                    r.RoomId == item.RoomId &&
                    r.Month == item.Month &&
                    r.Year == item.Year, ct);

            UtilityReading reading;
            if (existing != null)
            {
                existing.Update(item.ElectricityNew, item.WaterNew, item.Notes);
                reading = existing;
            }
            else
            {
                reading = UtilityReading.Create(
                    item.RoomId,
                    item.Month,
                    item.Year,
                    electricityOld,
                    item.ElectricityNew,
                    waterOld,
                    item.WaterNew,
                    item.Notes);
                _db.UtilityReadings.Add(reading);
            }

            // Generate/Update Invoice
            var startOfBillingMonth = new DateTime(item.Year, item.Month, 1);
            var endOfBillingMonth = new DateTime(item.Year, item.Month, DateTime.DaysInMonth(item.Year, item.Month));
            var contract = await _db.Contracts
                .Include(c => c.Room)
                .ThenInclude(r => r.House)
                .ThenInclude(h => h.ServiceFees)
                .FirstOrDefaultAsync(c =>
                    c.RoomId == item.RoomId &&
                    c.Status == ContractStatus.Active &&
                    c.StartDate <= endOfBillingMonth &&
                    c.EndDate >= startOfBillingMonth &&
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

                decimal electricityAmount = (item.ElectricityNew - electricityOld) * contract.Room.ElectricityUnitPrice;
                decimal waterAmount = (item.WaterNew - waterOld) * contract.Room.WaterUnitPrice;

                var existingInvoice = await _db.Invoices
                    .FirstOrDefaultAsync(i =>
                        i.ContractId == contract.Id &&
                        i.BillingMonth == item.Month &&
                        i.BillingYear == item.Year &&
                        !i.IsDeleted, ct);

                if (existingInvoice != null)
                {
                    existingInvoice.UpdateCharges(contract.MonthlyRent, electricityAmount, waterAmount, serviceAmount);
                }
                else
                {
                    var dueDate = new DateTime(item.Year, item.Month, contract.PaymentDayOfMonth);
                    if (dueDate < DateTime.UtcNow)
                        dueDate = dueDate.AddMonths(1);

                    var newInvoice = Invoice.Create(
                        contract.Id,
                        contract.RoomId,
                        item.Month,
                        item.Year,
                        contract.MonthlyRent,
                        electricityAmount,
                        waterAmount,
                        serviceAmount,
                        dueDate);

                    _db.Invoices.Add(newInvoice);
                }
            }

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
