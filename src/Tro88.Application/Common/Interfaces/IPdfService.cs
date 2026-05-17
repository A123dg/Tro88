using Tro88.Domain.Entities;

namespace Tro88.Application.Common.Interfaces;

public interface IPdfService
{
    Task<byte[]> GenerateInvoicePdfAsync(
        Invoice invoice,
        CancellationToken ct = default);
}
