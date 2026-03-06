using System.Threading.Channels;
namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class ThumbnailQueue
{
    private readonly Channel<ThumbnailJob> _queue = Channel.CreateUnbounded<ThumbnailJob>();

    public async ValueTask EnqueueAsync(ThumbnailJob job)
    {
        await _queue.Writer.WriteAsync(job);
    }

    public ValueTask<ThumbnailJob> DequeueAsync(CancellationToken ct)
    {
        return _queue.Reader.ReadAsync(ct);
    }
}