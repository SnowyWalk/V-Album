namespace V_Album_Server.Infrastructures.BackgroundJobs;

public class DeletePostJob
{
    public string GroupUuid { get; set; }
    public string PostUuid { get; set; }
}