using System.Collections.Concurrent;

namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class ThumbnailRecoveryThrottle
{
    private static readonly TimeSpan m_cooldown = TimeSpan.FromSeconds(15);
    private static readonly TimeSpan m_retention = TimeSpan.FromMinutes(2);

    private readonly ConcurrentDictionary<string, DateTime> m_recentEnqueues = new();

    public bool TryAcquire(string key, DateTime nowUtc)
    {
        while (true)
        {
            if (m_recentEnqueues.TryGetValue(key, out DateTime lastQueuedAt))
            {
                if (nowUtc - lastQueuedAt < m_cooldown)
                    return false;

                if (!m_recentEnqueues.TryUpdate(key, nowUtc, lastQueuedAt))
                    continue;
            }
            else if (!m_recentEnqueues.TryAdd(key, nowUtc))
            {
                continue;
            }

            Cleanup(nowUtc);
            return true;
        }
    }

    private void Cleanup(DateTime nowUtc)
    {
        foreach ((string key, DateTime lastQueuedAt) in m_recentEnqueues)
        {
            if (nowUtc - lastQueuedAt >= m_retention)
                m_recentEnqueues.TryRemove(key, out _);
        }
    }
}
