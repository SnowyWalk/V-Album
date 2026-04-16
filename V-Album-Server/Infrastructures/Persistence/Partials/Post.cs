namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class Post
{
    public bool IsDeleted => DeletedAt is not null;

    public void AddComment(Guid userUuid, string content)
    {
        if (IsDeleted)
            throw new InvalidOperationException("Post is deleted.");

        content = content.Trim();
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Comment content cannot be empty.", nameof(content));

        Comments.Add(new CommentEntity {
            PostUuid = PostUuid,
            UserUuid = userUuid,
            CommentUuid = Guid.NewGuid(),
            Content = content,
            // CreatedAt = DateTime.UtcNow, // DB자동생성
            DeletedAt = null,
        });
    }
}