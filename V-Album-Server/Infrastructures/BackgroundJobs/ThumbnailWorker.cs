using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class ThumbnailWorker(ThumbnailQueue queue) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            ThumbnailJob job = await queue.DequeueAsync(stoppingToken);

            string basePath = $"/uploads/{job.GroupUuid}/{job.PostUuid}/{job.ImageUuid}";
            string src = $"{basePath}.{job.Format}";
            string dst = $"{basePath}_thumb.webp";
            await GenerateThumbnail(src, dst);
        }
    }

    private async Task GenerateThumbnail(string src, string dst)
    {
        using Image image = await Image.LoadAsync(src);

        WebpEncoder encoder = new WebpEncoder {
            Quality = 70,
        };

        await image.SaveAsync(dst, encoder);
    }
}