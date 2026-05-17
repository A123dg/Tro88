namespace Tro88.Application.Common.Interfaces;

public interface IStorageService
{
    Task<string> UploadImageAsync(Stream imageStream, string fileName, string folder, CancellationToken ct = default);
    Task DeleteImageAsync(string publicId, CancellationToken ct = default);
}