namespace V_Album_Server.Domains.Post;

public class Post
{
    public Guid PostUuid { get; }
    public Guid GroupUuid { get; }
    public Guid UserUuid { get; }
    public string? Content { get; }
    public DateTime CreatedAt { get; }

    public Post(Guid postUuid, Guid groupUuid, Guid userUuid, string? content, DateTime createdAt)
    {
        PostUuid = postUuid;
        GroupUuid = groupUuid;
        UserUuid = userUuid;
        Content = content;
        CreatedAt = createdAt;
    }
}