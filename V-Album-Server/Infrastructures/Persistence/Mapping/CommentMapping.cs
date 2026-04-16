namespace V_Album_Server.Infrastructures.Persistence.Mapping;

public static class CommentMapping
{
    public static DomainComment ToDomain(this CommentEntity comment)
    {
        return new DomainComment(comment.CommentUuid, comment.PostUuid, comment.UserUuid, comment.Content, comment.CreatedAt, comment.DeletedAt);
    }
}