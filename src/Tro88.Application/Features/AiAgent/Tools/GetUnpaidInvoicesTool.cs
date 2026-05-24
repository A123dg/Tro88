using System.Text.Json;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.AiAgent.Tools;

public sealed class GetUnpaidInvoicesTool : BaseAiTool
{
    public GetUnpaidInvoicesTool(
        IApplicationDbContext db,
        ILogger<GetUnpaidInvoicesTool> logger)
        : base(db, logger) { }

    public override string Name => "get_unpaid_invoices";

    public override string Description =>
        "Lấy danh sách hóa đơn chưa thanh toán. " +
        "Dùng khi hỏi ai chưa đóng tiền, hóa đơn quá hạn, cần nhắc nhở tenant.";

    public override object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            overdueOnly = new
            {
                type = "boolean",
                description = "true = chỉ lấy HĐ quá hạn"
            }
        },
        required = Array.Empty<string>()
    };

    protected override async Task<AiToolResult> ExecuteCoreAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct)
    {
        var p = JsonSerializer.Deserialize<GetUnpaidParams>(
            parametersJson,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new();

        var today = DateTime.UtcNow.Date;

        var query = Db.Invoices
            .AsNoTracking()
            .Where(i =>
                i.Contract.OwnerId == userId &&
                i.Status == InvoiceStatus.Unpaid);

        if (p.OverdueOnly == true)
            query = query.Where(i => i.DueDate.Date < today);

        var invoices = await query
            .OrderBy(i => i.DueDate)
            .Take(20)
            .Select(i => new
            {
                InvoiceCode = i.InvoiceCode,
                TenantName = i.Contract.Tenant.FullName,
                TenantPhone = i.Contract.Tenant.PhoneNumber,
                RoomNumber = i.Contract.Room.RoomNumber,
                TotalAmount = i.TotalAmount,
                DueDate = i.DueDate.ToString("dd/MM/yyyy"),
                IsOverdue = i.DueDate.Date < today,
                DaysOverdue = i.DueDate.Date < today ? (today - i.DueDate.Date).Days : 0,
                BillingMonth = i.BillingMonth,
                BillingYear = i.BillingYear
            })
            .ToListAsync(ct);

        var totalUnpaid = invoices.Sum(i => i.TotalAmount);

        return AiToolResult.Ok(Name, new
        {
            Invoices = invoices,
            TotalUnpaidAmount = totalUnpaid,
            OverdueCount = invoices.Count(i => i.IsOverdue)
        }, invoices.Count);
    }

    private sealed class GetUnpaidParams
    {
        public bool? OverdueOnly { get; set; }
    }
}