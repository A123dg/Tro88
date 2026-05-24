using System.Text.Json;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.AiAgent.Tools;

public sealed class GetContractsTool : BaseAiTool
{
    public GetContractsTool(
        IApplicationDbContext db,
        ILogger<GetContractsTool> logger)
        : base(db, logger) { }

    public override string Name => "get_contracts";

    public override string Description =>
        "Lấy danh sách hợp đồng thuê phòng. Hỗ trợ lọc theo trạng thái, phòng sắp hết hạn. " +
        "Dùng khi hỏi về hợp đồng, tenant đang thuê, thời hạn thuê.";

    public override object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            status = new
            {
                type = "string",
                @enum = new[] { "all", "active", "draft", "expired", "terminated" },
                description = "Lọc theo trạng thái HĐ"
            },
            expiringInDays = new
            {
                type = "integer",
                description = "Lọc HĐ sắp hết hạn trong N ngày"
            },
            roomId = new
            {
                type = "string",
                description = "ID phòng cụ thể (optional)"
            }
        },
        required = Array.Empty<string>()
    };

    protected override async Task<AiToolResult> ExecuteCoreAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct)
    {
        var p = JsonSerializer.Deserialize<GetContractsParams>(
            parametersJson,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new();

        var query = Db.Contracts
            .AsNoTracking()
            .Where(c =>
                !c.IsDeleted &&
                c.OwnerId == userId);

        if (!string.IsNullOrEmpty(p.Status) && p.Status != "all")
        {
            var status = Enum.Parse<ContractStatus>(p.Status, ignoreCase: true);
            query = query.Where(c => c.Status == status);
        }

        if (p.ExpiringInDays.HasValue)
        {
            var deadline = DateTime.UtcNow.AddDays(p.ExpiringInDays.Value);
            query = query.Where(c =>
                c.Status == ContractStatus.Active &&
                c.EndDate <= deadline);
        }

        if (p.RoomId.HasValue)
            query = query.Where(c => c.RoomId == p.RoomId.Value);

        var contracts = await query
            .OrderByDescending(c => c.CreatedAt)
            .Take(10)
            .Select(c => new
            {
                ContractCode = c.ContractCode,
                TenantName = c.Tenant.FullName,
                TenantPhone = c.Tenant.PhoneNumber,
                RoomNumber = c.Room.RoomNumber,
                HouseName = c.Room.House.Name,
                StartDate = c.StartDate.ToString("dd/MM/yyyy"),
                EndDate = c.EndDate.ToString("dd/MM/yyyy"),
                DaysLeft = (c.EndDate - DateTime.UtcNow).Days,
                MonthlyRent = c.MonthlyRent,
                DepositAmount = c.DepositAmount,
                Status = c.Status.ToString(),
                SignedAt = c.SignedAt.HasValue
                    ? c.SignedAt.Value.ToString("dd/MM/yyyy")
                    : null
            })
            .ToListAsync(ct);

        return AiToolResult.Ok(Name, contracts, contracts.Count);
    }

    private sealed class GetContractsParams
    {
        public string? Status { get; set; } = "all";
        public int? ExpiringInDays { get; set; }
        public Guid? RoomId { get; set; }
    }
}