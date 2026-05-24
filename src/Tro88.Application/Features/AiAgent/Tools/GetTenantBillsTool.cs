using System.Text.Json;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.AiAgent.Tools;

public sealed class GetTenantBillsTool : BaseAiTool
{
    public GetTenantBillsTool(
        IApplicationDbContext db,
        ILogger<GetTenantBillsTool> logger)
        : base(db, logger) { }

    public override string Name => "get_tenant_bills";

    public override string Description =>
        "Lấy hóa đơn của tenant. Owner dùng để xem hóa đơn của tenant cụ thể. " +
        "Tenant dùng để xem hóa đơn của chính mình. Hỗ trợ lọc theo trạng thái và tháng.";

    public override object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            tenantId = new
            {
                type = "string",
                description = "ID tenant cụ thể (optional). Owner truyền để xem HĐ tenant."
            },
            status = new
            {
                type = "string",
                @enum = new[] { "all", "unpaid", "paid", "overdue" },
                description = "Lọc theo trạng thái hóa đơn"
            },
            month = new
            {
                type = "integer",
                description = "Tháng (1-12, optional)"
            },
            year = new
            {
                type = "integer",
                description = "Năm (optional)"
            }
        },
        required = Array.Empty<string>()
    };

    protected override async Task<AiToolResult> ExecuteCoreAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct)
    {
        var p = JsonSerializer.Deserialize<GetTenantBillsParams>(
            parametersJson,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new();

        var query = Db.Invoices
            .AsNoTracking()
            .Where(i =>
                i.Contract.OwnerId == userId ||
                i.Contract.TenantId == userId);

        if (p.TenantId.HasValue)
        {
            query = query.Where(i =>
                i.Contract.TenantId == p.TenantId &&
                i.Contract.OwnerId == userId);
        }

        if (!string.IsNullOrEmpty(p.Status) && p.Status != "all")
        {
            var status = p.Status switch
            {
                "unpaid" => InvoiceStatus.Unpaid,
                "paid" => InvoiceStatus.Paid,
                "overdue" => InvoiceStatus.Overdue,
                _ => InvoiceStatus.Unpaid
            };
            query = query.Where(i => i.Status == status);
        }

        if (p.Month.HasValue)
            query = query.Where(i => i.BillingMonth == p.Month.Value);

        if (p.Year.HasValue)
            query = query.Where(i => i.BillingYear == p.Year.Value);

        var invoices = await query
            .OrderByDescending(i => i.DueDate)
            .Take(10)
            .Select(i => new
            {
                InvoiceCode = i.InvoiceCode,
                TenantName = i.Contract.Tenant.FullName,
                RoomNumber = i.Contract.Room.RoomNumber,
                HouseName = i.Contract.Room.House.Name,
                BillingMonth = i.BillingMonth,
                BillingYear = i.BillingYear,
                RentAmount = i.RentAmount,
                ElectricityAmount = i.ElectricityAmount,
                WaterAmount = i.WaterAmount,
                ServiceAmount = i.ServiceAmount,
                TotalAmount = i.TotalAmount,
                DueDate = i.DueDate.ToString("dd/MM/yyyy"),
                Status = i.Status.ToString(),
                PaidAt = i.PaidAt.HasValue
                    ? i.PaidAt.Value.ToString("dd/MM/yyyy")
                    : null,
                IsOverdue = i.Status != InvoiceStatus.Paid && i.DueDate < DateTime.UtcNow
            })
            .ToListAsync(ct);

        var totalAmount = invoices.Sum(i => i.TotalAmount);

        return AiToolResult.Ok(
            Name,
            new { invoices, totalAmount },
            invoices.Count);
    }

    private sealed class GetTenantBillsParams
    {
        public Guid? TenantId { get; set; }
        public string? Status { get; set; } = "all";
        public int? Month { get; set; }
        public int? Year { get; set; }
    }
}