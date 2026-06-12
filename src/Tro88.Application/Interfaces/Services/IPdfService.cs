using Tro88.Domain.Entities;

namespace Tro88.Application.Interfaces.Services;

public interface IPdfService
{
    Task<byte[]> GenerateInvoicePdfAsync(
        Invoice invoice,
        CancellationToken ct = default);
}

