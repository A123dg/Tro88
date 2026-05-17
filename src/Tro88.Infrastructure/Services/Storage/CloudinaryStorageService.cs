using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using Tro88.Application.Common.Interfaces;

namespace Tro88.Infrastructure.Services.Storage;

public class CloudinarySettings
{
    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
}

public class CloudinaryStorageService : IStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageService(IOptions<CloudinarySettings> settings)
    {
        var s = settings.Value;
        var account = new Account(s.CloudName, s.ApiKey, s.ApiSecret);
        _cloudinary = new Cloudinary(account)
        {
            Api = { Secure = true }
        };
    }

    public async Task<string> UploadImageAsync(
        Stream imageStream,
        string fileName,
        string folder,
        CancellationToken ct = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, imageStream),
            Folder = folder,
            Transformation = new Transformation()
                .Width(1200).Crop("limit").Quality("auto"),
            UseFilenameAsDisplayName = true
        };

        var result = await _cloudinary.UploadAsync(uploadParams, ct);

        if (result.Error is not null)
            throw new InvalidOperationException(
                $"Cloudinary upload failed: {result.Error.Message}");

        return result.SecureUrl.ToString();
    }

    public async Task DeleteImageAsync(
        string publicId,
        CancellationToken ct = default)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);

        if (result.Result != "ok")
            throw new InvalidOperationException(
                $"Cloudinary delete failed: {result.Result}");
    }
}
