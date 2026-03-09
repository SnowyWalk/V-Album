namespace V_Album_Server.Domains.Post;

public class Post
{
    public Guid PostUuid { get; }
    public Guid GroupUuid { get; }
    public Guid UserUuid { get; }
    public string? Content { get; }

    public Post(Guid postUuid, Guid groupUuid, Guid userUuid, string? content)
    {
        PostUuid = postUuid;
        GroupUuid = groupUuid;
        UserUuid = userUuid;
        Content = content;
    }
}