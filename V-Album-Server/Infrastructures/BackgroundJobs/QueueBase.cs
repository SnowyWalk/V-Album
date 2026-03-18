using System.Threading.Channels;
namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class QueueBase<T> where T : class
{
    private readonly Channel<T> m_queue = Channel.CreateUnbounded<T>();

    public async ValueTask EnqueueAsync(T job)
    {
        await m_queue.Writer.WriteAsync(job);
    }

    public ValueTask<T> DequeueAsync(CancellationToken ct)
    {
        return m_queue.Reader.ReadAsync(ct);
    }
}