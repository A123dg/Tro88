using System.Text.Json;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.AiAgent.Tools;

public sealed class GetRevenueSummaryTool : BaseAiTool
{
    public GetRevenueSummaryTool(
        IApplicationDbContext db,
        ILogger<GetRevenueSummaryTool> logger)
        : base(db, logger) { }

    public override string Name => "get_revenue_summary";

    public override string Description =>
        "Tổng hợp doanh thu, thống kê tài chính của chủ trọ. " +
        "Dùng khi hỏi về doanh thu, thu nhập, thống kê tháng/năm, tổng tiền thu được.";

    public override object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            months = new
            {
                type = "integer",
                description = "Số tháng gần nhất cần thống kê (mặc định 6)"
            },
            year = new
            {
                type = "integer",
                description = "Năm cụ thể (optional)"
            },
            houseId = new
            {
                type = "string",
                description = "ID nhà cụ thể (optional)"
            }
        },
        required = Array.Empty<string>()
    };

    protected override async Task<AiToolResult> ExecuteCoreAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct)
    {
        var p = JsonSerializer.Deserialize<GetRevenueSummaryParams>(
            parametersJson,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new();

        var monthsBack = p.Months ?? 6;
        var fromDate = DateTime.UtcNow.AddMonths(-monthsBack);

        var query = Db.Invoices
            .AsNoTracking()
            .Where(i =>
                i.Contract.OwnerId == userId &&
                i.Status == InvoiceStatus.Paid &&
                i.PaidAt >= fromDate);

        if (p.HouseId.HasValue)
            query = query.Where(i => i.Contract.Room.HouseId == p.HouseId);

        if (p.Year.HasValue)
            query = query.Where(i => i.BillingYear == p.Year.Value);

        var monthly = await query
            .GroupBy(i => new { i.BillingYear, i.BillingMonth })
            .Select(g => new
            {
                Year = g.Key.BillingYear,
                Month = g.Key.BillingMonth,
                TotalRevenue = g.Sum(i => i.TotalAmount),
                RentRevenue = g.Sum(i => i.RentAmount),
                UtilityRevenue = g.Sum(i => i.ElectricityAmount) + g.Sum(i => i.WaterAmount),
                ServiceRevenue = g.Sum(i => i.ServiceAmount),
                InvoiceCount = g.Count()
            })
            .OrderBy(g => g.Year)
            .ThenBy(g => g.Month)
            .ToListAsync(ct);

        var totalRevenue = monthly.Sum(m => m.TotalRevenue);
        var avgMonthly = monthly.Count > 0 ? totalRevenue / monthly.Count : 0;

        var unpaidTotal = await Db.Invoices
            .AsNoTracking()
            .Where(i =>
                i.Contract.OwnerId == userId &&
                i.Status == InvoiceStatus.Unpaid)
            .SumAsync(i => i.TotalAmount, ct);

        var unpaidCount = await Db.Invoices
            .AsNoTracking()
            .Where(i =>
                i.Contract.OwnerId == userId &&
                i.Status == InvoiceStatus.Unpaid)
            .CountAsync(ct);

        return AiToolResult.Ok(Name, new
        {
            Summary = new
            {
                TotalRevenue = totalRevenue,
                AverageMonthly = avgMonthly,
                MonthsAnalyzed = monthly.Count,
                UnpaidAmount = unpaidTotal,
                UnpaidCount = unpaidCount
            },
            MonthlyBreakdown = monthly
        });
    }

    private sealed class GetRevenueSummaryParams
    {
        public int? Months { get; set; } = 6;
        public int? Year { get; set; }
        public Guid? HouseId { get; set; }
    }
}