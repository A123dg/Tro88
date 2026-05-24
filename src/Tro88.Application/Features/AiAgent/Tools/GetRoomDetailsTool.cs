using System.Text.Json;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.AiAgent.Tools;

public sealed class GetRoomDetailsTool : BaseAiTool
{
    public GetRoomDetailsTool(
        IApplicationDbContext db,
        ILogger<GetRoomDetailsTool> logger)
        : base(db, logger) { }

    public override string Name => "get_room_details";

    public override string Description =>
        "Lấy thông tin chi tiết một phòng cụ thể gồm tenant hiện tại, hợp đồng, " +
        "chỉ số điện nước gần nhất. Dùng khi hỏi chi tiết về một phòng cụ thể.";

    public override object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            roomNumber = new
            {
                type = "string",
                description = "Số phòng (VD: P.101, 101)"
            },
            houseId = new
            {
                type = "string",
                description = "ID nhà trọ (optional nếu roomNumber đã đủ unique)"
            }
        },
        required = new[] { "roomNumber" }
    };

    protected override async Task<AiToolResult> ExecuteCoreAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct)
    {
        var p = JsonSerializer.Deserialize<GetRoomDetailsParams>(
            parametersJson,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? throw new ArgumentNullException();

        if (string.IsNullOrWhiteSpace(p.RoomNumber))
            return AiToolResult.Fail(Name, "RoomNumber is required");

        var roomQuery = Db.Rooms
            .AsNoTracking()
            .Where(r =>
                !r.IsDeleted &&
                r.House.OwnerId == userId &&
                r.RoomNumber.Contains(p.RoomNumber));

        if (p.HouseId.HasValue)
            roomQuery = roomQuery.Where(r => r.HouseId == p.HouseId.Value);

        var room = await roomQuery
            .Select(r => new
            {
                RoomId = r.Id,
                RoomNumber = r.RoomNumber,
                HouseName = r.House.Name,
                HouseAddress = r.House.Address,
                Floor = r.Floor,
                Area = r.Area,
                MaxOccupants = r.MaxOccupants,
                MonthlyRent = r.MonthlyRent,
                DepositAmount = r.DepositAmount,
                Status = r.Status.ToString(),
                ElectricityUnitPrice = r.ElectricityUnitPrice,
                WaterUnitPrice = r.WaterUnitPrice,
                Description = r.Description
            })
            .FirstOrDefaultAsync(ct);

        if (room is null)
            return AiToolResult.Fail(Name, $"Room {p.RoomNumber} not found");

        var activeContract = await Db.Contracts
            .AsNoTracking()
            .Where(c =>
                c.RoomId == room.RoomId &&
                c.Status == ContractStatus.Active &&
                !c.IsDeleted)
            .Select(c => new
            {
                ContractCode = c.ContractCode,
                TenantName = c.Tenant.FullName,
                TenantPhone = c.Tenant.PhoneNumber,
                TenantEmail = c.Tenant.Email,
                StartDate = c.StartDate.ToString("dd/MM/yyyy"),
                EndDate = c.EndDate.ToString("dd/MM/yyyy"),
                DaysLeft = (c.EndDate - DateTime.UtcNow).Days,
                MonthlyRent = c.MonthlyRent
            })
            .FirstOrDefaultAsync(ct);

        var latestReading = await Db.UtilityReadings
            .AsNoTracking()
            .Where(u => u.RoomId == room.RoomId)
            .OrderByDescending(u => u.Year)
            .ThenByDescending(u => u.Month)
            .Select(u => new
            {
                Month = u.Month,
                Year = u.Year,
                ElectricityUsage = u.ElectricityUsage,
                WaterUsage = u.WaterUsage,
                ElectricityCost = u.ElectricityUsage * u.Room.ElectricityUnitPrice,
                WaterCost = u.WaterUsage * u.Room.WaterUnitPrice
            })
            .FirstOrDefaultAsync(ct);

        return AiToolResult.Ok(Name, new
        {
            Room = room,
            CurrentContract = activeContract,
            LatestUtilityReading = latestReading
        });
    }

    private sealed class GetRoomDetailsParams
    {
        public string RoomNumber { get; set; } = default!;
        public Guid? HouseId { get; set; }
    }
}