namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class DeletePostWorker(DeletePostQueue queue, ILogger<DeletePostWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            DeletePostJob job = await queue.DequeueAsync(stoppingToken);

            string path = $"uploads/{job.GroupUuid}/{job.PostUuid}";
            await DeleteDirectory(path);
        }
    }

    private async Task DeleteDirectory(string path)
    {
        for (int i = 0; i < 3; i++)
        {
            try
            {
                if (!Directory.Exists(path))
                    return;
                
                Directory.Delete(path, recursive: true);
                return;
            }
            catch (DirectoryNotFoundException)
            {
                // 이미 삭제됨 → 정상
                return;
            }
            catch (IOException)
            {
                // 파일 사용 중 → 재시도 필요
                await Task.Delay(100 * (i + 1));
            }
            catch (UnauthorizedAccessException)
            {
                // 권한 문제 → 로그
                logger.LogWarning("Failed to delete directory {Path}: Unauthorized access", path);
                await Task.Delay(100 * (i + 1));
            }
        }
    }
}