using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Interfaces;
namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class ThumbnailWorker : BackgroundService
{
    private readonly ThumbnailQueue m_queue;
    private readonly IServiceScopeFactory m_scopeFactory;
    private readonly ILogger<ThumbnailWorker> m_logger;

    private const string m_tempPath = "uploads/temp";

    public ThumbnailWorker(ThumbnailQueue queue, IServiceScopeFactory scopeFactory, ILogger<ThumbnailWorker> logger)
    {
        m_queue = queue;
        m_scopeFactory = scopeFactory;
        m_logger = logger;

        CommonUtils.EnsureDirectoryExists(m_tempPath);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            ThumbnailJob job = await m_queue.DequeueAsync(stoppingToken);

            string postDirPath = $"uploads/{job.GroupUuid}/{job.PostUuid}";
            string src = $"{postDirPath}/{job.PhotoUuid}{job.Format}";
            string dst = $"{postDirPath}/{job.PhotoUuid}_thumb.webp";

            await using var scope = m_scopeFactory.CreateAsyncScope();
            PostRepository postRepository = scope.ServiceProvider.GetRequiredService<PostRepository>();
            if (!await postRepository.IsPostAlive(job.PostUuid, stoppingToken))
                continue;

            await GenerateThumbnail(postDirPath, src, dst, job.PhotoUuid);
        }
    }

    private async Task GenerateThumbnail(string postDirPath, string src, string dst, Guid photoUuid)
    {
        if (!IsPostDirValid(postDirPath) || !IsSrcPhotoValid(src) || IsAlreadyGenerated(dst))
            return;

        string tmp = $"{m_tempPath}/{photoUuid}_{Guid.NewGuid()}.webp";

        try
        {
            using Image image = await Image.LoadAsync(src);
            await image.SaveAsync(tmp, new WebpEncoder {
                Quality = 70,
            });

            if (!IsPostDirValid(postDirPath))
                return;

            File.Move(tmp, dst, true);
        }
        catch (Exception ex)
        {
            m_logger.LogError("Failed to generate thumbnail for photo {PhotoUuid}: {ExMessage}", photoUuid, ex.Message);
        }
        finally
        {
            if (File.Exists(tmp))
                File.Delete(tmp);
        }

    }

    private bool IsPostDirValid(string postDirPath)
    {
        return Directory.Exists(postDirPath);
    }

    private bool IsSrcPhotoValid(string srcPath)
    {
        return File.Exists(srcPath);
    }

    private bool IsAlreadyGenerated(string dstPath)
    {
        return File.Exists(dstPath);
    }
}