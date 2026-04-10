namespace V_Album_Server.Domains.Like;

public class Like
{
    public Guid UserUuid { get; }
    public Guid PostUuid { get; }
    public DateTime CreatedAt { get; }
    public DateTime? DeletedAt { get; } = null!;
    
    public Like(Guid userUuid, Guid postUuid, DateTime createdAt, DateTime? deletedAt = null)
    {
        UserUuid = userUuid;
        PostUuid = postUuid;
        CreatedAt = createdAt;
        DeletedAt = deletedAt;
    }
}