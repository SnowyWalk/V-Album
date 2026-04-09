using SixLabors.ImageSharp;
using System.Security.Cryptography;
using V_Album_Server.Infrastructures;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;

namespace V_Album_Server.Services.Post;

public class PostPhotoService(
    ThumbnailQueue thumbnailQueue,
    PhotoRepository photoRepository,
    ILogger<PostPhotoService> logger)
{
    public async Task AddPhotoAsync(Guid postUuid, Guid groupUuid, int sortOrder, IFormFile image, CancellationToken ct)
    {
        Guid photoUuid = Guid.NewGuid();
        string format = Path.GetExtension(image.FileName);
        string photoPath = $"uploads/{groupUuid}/{postUuid}/{photoUuid}{format}";

        CommonUtils.EnsureDirectoryExists(photoPath);
        await using (FileStream stream = new FileStream(photoPath, FileMode.Create))
        {
            await image.CopyToAsync(stream, ct);
        }

        using Image imageInfo = await Image.LoadAsync(photoPath, ct);

        using var sha = SHA256.Create();
        await using var fs = File.OpenRead(photoPath);
        byte[] hash = await sha.ComputeHashAsync(fs, ct);

        await photoRepository.AddPhotoAsync(
            postUuid,
            photoUuid,
            sortOrder,
            null,
            imageInfo.Width,
            imageInfo.Height,
            new FileInfo(photoPath).Length,
            hash,
            format,
            false,
            ct);

        await thumbnailQueue.EnqueueAsync(new ThumbnailJob
        {
            GroupUuid = groupUuid,
            PostUuid = postUuid,
            PhotoUuid = photoUuid,
            Format = format,
        });
    }

    public Task DeletePhotoFilesAsync(Guid groupUuid, Guid postUuid, IEnumerable<DomainPhoto> photos, CancellationToken ct)
    {
        foreach (DomainPhoto photo in photos)
        {
            ct.ThrowIfCancellationRequested();

            if (!string.IsNullOrWhiteSpace(photo.Format))
                DeleteFileIfExists($"uploads/{groupUuid}/{postUuid}/{photo.PhotoUuid}{photo.Format}");

            DeleteFileIfExists($"uploads/{groupUuid}/{postUuid}/{photo.PhotoUuid}_thumb.webp");
        }

        return Task.CompletedTask;
    }

    private void DeleteFileIfExists(string path)
    {
        if (!File.Exists(path))
            return;

        try
        {
            File.Delete(path);
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            logger.LogWarning(ex, "Failed to delete photo file {Path}", path);
        }
    }
}
