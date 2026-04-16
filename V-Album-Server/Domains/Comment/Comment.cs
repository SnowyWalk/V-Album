namespace V_Album_Server.Domains.Comment;

public class Comment
{
    public Guid CommentUuid { get; }
    public Guid PostUuid { get; }
    public Guid UserUuid { get; }
    public string Content { get; }
    public DateTime CreatedAt { get; }
    public DateTime? DeletedAt { get; }

    public Comment(Guid commentUuid, Guid postUuid, Guid userUuid, string content, DateTime createdAt, DateTime? deletedAt)
    {
        CommentUuid = commentUuid;
        PostUuid = postUuid;
        UserUuid = userUuid;
        Content = content;
        CreatedAt = createdAt;
        DeletedAt = deletedAt;
    }
}