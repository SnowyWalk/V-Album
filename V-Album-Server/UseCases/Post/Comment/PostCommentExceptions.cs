namespace V_Album_Server.UseCases.Post;

    public sealed class CommentNotFoundException(Guid commentUuid) : Exception("Comment not found.")
{
    public Guid CommentUuid { get; } = commentUuid;
}
public sealed class CommentAccessDeniedException(Guid postUuid, Guid userUuid)
    : Exception("You do not have permission to access this post.")
{
    public Guid PostUuid { get; } = postUuid;
    public Guid UserUuid { get; } = userUuid;
}
