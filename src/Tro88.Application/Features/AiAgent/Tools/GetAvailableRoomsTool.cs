using System.Text.Json;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.AiAgent.Tools;

public sealed class GetAvailableRoomsTool : BaseAiTool
{
    public GetAvailableRoomsTool(
        IApplicationDbContext db,
        ILogger<GetAvailableRoomsTool> logger)
        : base(db, logger) { }

    public override string Name => "get_available_rooms";

    public override string Description =>
        "Lấy danh sách phòng trống đang có thể cho thuê. " +
        "Dùng khi user hỏi về phòng trống, phòng available, hoặc cần tìm phòng.";

    public override object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            houseId = new
            {
                type = "string",
                description = "ID nhà trọ cụ thể (optional). Nếu không truyền sẽ lấy tất cả nhà."
            },
            maxRent = new
            {
                type = "number",
                description = "Giá thuê tối đa (VND, optional)"
            },
            minArea = new
            {
                type = "number",
                description = "Diện tích tối thiểu m² (optional)"
            }
        },
        required = Array.Empty<string>()
    };

    protected override async Task<AiToolResult> ExecuteCoreAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct)
    {
        var p = JsonSerializer.Deserialize<GetAvailableRoomsParams>(
            parametersJson,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new();

        var query = Db.Rooms
            .AsNoTracking()
            .Where(r =>
                !r.IsDeleted &&
                r.Status == RoomStatus.Available &&
                r.House.OwnerId == userId);

        if (p.HouseId.HasValue)
            query = query.Where(r => r.HouseId == p.HouseId.Value);

        if (p.MaxRent.HasValue)
            query = query.Where(r => r.MonthlyRent <= p.MaxRent.Value);

        if (p.MinArea.HasValue)
            query = query.Where(r => r.Area >= p.MinArea.Value);

        var rooms = await query
            .OrderBy(r => r.MonthlyRent)
            .Take(10)
            .Select(r => new
            {
                RoomId = r.Id,
                RoomNumber = r.RoomNumber,
                HouseName = r.House.Name,
                Floor = r.Floor,
                Area = r.Area,
                MonthlyRent = r.MonthlyRent,
                DepositAmount = r.DepositAmount,
                MaxOccupants = r.MaxOccupants,
                ElectricityPrice = r.ElectricityUnitPrice,
                WaterPrice = r.WaterUnitPrice,
                Description = r.Description,
                ImageCount = r.Images.Count
            })
            .ToListAsync(ct);

        return AiToolResult.Ok(Name, rooms, rooms.Count);
    }

    private sealed class GetAvailableRoomsParams
    {
        public Guid? HouseId { get; set; }
        public decimal? MaxRent { get; set; }
        public decimal? MinArea { get; set; }
    }
}