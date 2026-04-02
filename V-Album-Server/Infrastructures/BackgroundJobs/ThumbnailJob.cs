namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class ThumbnailJob
{
    public Guid GroupUuid { get; set; }
    public Guid PostUuid { get; set; }
    public Guid PhotoUuid { get; set; }
    public string Format { get; set; }
}