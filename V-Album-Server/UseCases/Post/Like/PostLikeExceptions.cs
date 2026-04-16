namespace V_Album_Server.UseCases.Post;

public sealed class PostNotFoundException(Guid postUuid) : Exception("Post not found.")
{
    public Guid PostUuid { get; } = postUuid;
}

public sealed class PostAccessDeniedException(Guid postUuid, Guid userUuid)
    : Exception("You do not have permission to access this post.")
{
    public Guid PostUuid { get; } = postUuid;
    public Guid UserUuid { get; } = userUuid;
}
