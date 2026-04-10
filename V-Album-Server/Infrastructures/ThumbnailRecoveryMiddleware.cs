using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;

namespace V_Album_Server.Infrastructures;

public class ThumbnailRecoveryMiddleware(
    RequestDelegate next,
    IWebHostEnvironment environment,
    ILogger<ThumbnailRecoveryMiddleware> logger)
{
    private const string m_uploadsPrefix = "/uploads/";
    private const string m_thumbnailSuffix = "_thumb.webp";
    private static readonly TimeSpan m_postWarmupWindow = TimeSpan.FromSeconds(10);

    private readonly string m_uploadsRootPath = Path.Combine(environment.ContentRootPath, "uploads");

    private sealed record ThumbnailRequest(
        Guid GroupUuid,
        Guid PostUuid,
        Guid PhotoUuid,
        string PostDirPath,
        string ThumbnailPath);

    public async Task InvokeAsync(
        HttpContext context,
        PostRepository postRepository,
        ThumbnailQueue thumbnailQueue,
        ThumbnailRecoveryThrottle throttle)
    {
        if (!HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method))
        {
            await next(context);
            return;
        }

        if (!TryParseThumbnailRequest(context.Request.Path, out ThumbnailRequest parsedRequest))
        {
            await next(context);
            return;
        }
        ThumbnailRequest request = parsedRequest;

        if (File.Exists(request.ThumbnailPath))
        {
            await next(context);
            return;
        }

        await TryEnqueueThumbnailRecoveryAsync(request, postRepository, thumbnailQueue, throttle, context.RequestAborted);

        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
        context.Response.Headers.Pragma = "no-cache";
    }

    private async Task TryEnqueueThumbnailRecoveryAsync(
        ThumbnailRequest request,
        PostRepository postRepository,
        ThumbnailQueue thumbnailQueue,
        ThumbnailRecoveryThrottle throttle,
        CancellationToken ct)
    {
        DateTime? postCreatedAt = await postRepository.GetAlivePostCreatedAtAsync(request.PostUuid, ct);
        if (postCreatedAt is null)
            return;

        if (DateTime.Now - postCreatedAt.Value < m_postWarmupWindow)
            return;

        FileInfo? sourcePhoto = FindSourcePhoto(request.PostDirPath, request.PhotoUuid);
        if (sourcePhoto is null)
            return;

        if (!throttle.TryAcquire(request.ThumbnailPath, DateTime.UtcNow))
            return;

        await thumbnailQueue.EnqueueAsync(new ThumbnailJob {
            GroupUuid = request.GroupUuid,
            PostUuid = request.PostUuid,
            PhotoUuid = request.PhotoUuid,
            Format = sourcePhoto.Extension,
        });

        logger.LogInformation(
            "Queued thumbnail recovery for photo {PhotoUuid} in post {PostUuid}",
            request.PhotoUuid,
            request.PostUuid);
    }

    private static FileInfo? FindSourcePhoto(string postDirPath, Guid photoUuid)
    {
        if (!Directory.Exists(postDirPath))
            return null;

        DirectoryInfo directory = new(postDirPath);
        return directory
            .EnumerateFiles($"{photoUuid}.*", SearchOption.TopDirectoryOnly)
            .FirstOrDefault(file => !file.Name.EndsWith(m_thumbnailSuffix, StringComparison.OrdinalIgnoreCase));
    }

    private bool TryParseThumbnailRequest(PathString requestPath, out ThumbnailRequest request)
    {
        request = null!;

        string? path = requestPath.Value;
        if (string.IsNullOrWhiteSpace(path)
            || !path.StartsWith(m_uploadsPrefix, StringComparison.OrdinalIgnoreCase)
            || !path.EndsWith(m_thumbnailSuffix, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        string relativePath = path[m_uploadsPrefix.Length..];
        string[] segments = relativePath.Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (segments.Length != 3)
            return false;

        if (!Guid.TryParse(segments[0], out Guid groupUuid))
            return false;

        if (!Guid.TryParse(segments[1], out Guid postUuid))
            return false;

        string fileName = segments[2];
        string fileBaseName = Path.GetFileNameWithoutExtension(fileName);
        if (!fileBaseName.EndsWith("_thumb", StringComparison.OrdinalIgnoreCase))
            return false;

        string photoUuidText = fileBaseName[..^"_thumb".Length];
        if (!Guid.TryParse(photoUuidText, out Guid photoUuid))
            return false;

        string postDirPath = Path.Combine(m_uploadsRootPath, groupUuid.ToString(), postUuid.ToString());
        string thumbnailPath = Path.Combine(postDirPath, fileName);

        request = new ThumbnailRequest(groupUuid, postUuid, photoUuid, postDirPath, thumbnailPath);
        return true;
    }
}