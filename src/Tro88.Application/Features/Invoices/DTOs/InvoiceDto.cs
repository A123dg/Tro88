using Tro88.Domain.Entities;
using Tro88.Domain.Enums;

namespace Tro88.Application.Features.Invoices.DTOs;

public sealed record InvoiceDto(
    Guid Id,
    Guid ContractId,
    Guid RoomId,
    string InvoiceCode,
    int BillingMonth,
    int BillingYear,
    decimal RentAmount,
    decimal ElectricityAmount,
    decimal WaterAmount,
    decimal ServiceAmount,
    decimal TotalAmount,
    DateTime DueDate,
    DateTime? PaidAt,
    string Status,
    string? Notes,
    List<InvoiceLineItemDto> LineItems)
{
    public static InvoiceDto FromEntity(Invoice i)
        => new(i.Id, i.ContractId, i.RoomId, i.InvoiceCode, i.BillingMonth, i.BillingYear,
            i.RentAmount, i.ElectricityAmount, i.WaterAmount, i.ServiceAmount, i.TotalAmount,
            i.DueDate, i.PaidAt, i.Status.ToString(), i.Notes,
            i.LineItems.Select(InvoiceLineItemDto.FromEntity).ToList());
}

public sealed record InvoiceLineItemDto(
    Guid Id,
    string Description,
    decimal UnitPrice,
    decimal Quantity,
    decimal Amount)
{
    public static InvoiceLineItemDto FromEntity(InvoiceLineItem item)
        => new(item.Id, item.Description, item.UnitPrice, item.Quantity, item.Amount);
}