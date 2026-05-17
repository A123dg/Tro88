using System.Text;
using Tro88.Application.Common.Interfaces;
using Tro88.Domain.Entities;

namespace Tro88.Infrastructure.Services.Pdf;

public class PdfService : IPdfService
{
    public Task<byte[]> GenerateInvoicePdfAsync(
        Invoice invoice,
        CancellationToken ct = default)
    {
        var text = $"""
            TRO88 INVOICE
            Code: {invoice.InvoiceCode}
            Period: {invoice.BillingMonth}/{invoice.BillingYear}
            Rent: {invoice.RentAmount:N0}
            Electricity: {invoice.ElectricityAmount:N0}
            Water: {invoice.WaterAmount:N0}
            Services: {invoice.ServiceAmount:N0}
            Total: {invoice.TotalAmount:N0}
            Due: {invoice.DueDate:dd/MM/yyyy}
            """;

        return Task.FromResult(Encoding.UTF8.GetBytes(text));
    }
}
