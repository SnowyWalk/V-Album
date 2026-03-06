namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class ThumbnailJob
{
    public string GroupUuid { get; set; }
    public string PostUuid { get; set; }
    public string ImageUuid { get; set; }
    public string Format { get; set; }
}