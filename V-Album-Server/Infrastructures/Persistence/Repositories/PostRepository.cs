using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class PostRepository(AppDbContext dbContext)
{
    public async Task<DomainPost> CreatePostAsync(Guid groupUuid, Guid userUuid, string content, CancellationToken ct)
    {
        Guid postUuid = Guid.NewGuid();
        PostEntity post = new PostEntity {
            PostUuid = postUuid,
            GroupUuid = groupUuid,
            UserUuid = userUuid,
            Content = content,
        };
        await dbContext.Posts.AddAsync(post, ct);
        return post.ToDomain();
    }

    public async Task<PostEntity?> GetPostAsync(Guid postUuid, CancellationToken ct)
    {
        return await dbContext.Posts.FirstOrDefaultAsync(p => p.PostUuid == postUuid && p.DeletedAt == null, ct);
    }

    public async Task<DateTime?> GetAlivePostCreatedAtAsync(Guid postUuid, CancellationToken ct)
    {
        return await dbContext.Posts
            .AsNoTracking()
            .Where(p => p.PostUuid == postUuid && p.DeletedAt == null)
            .Select(p => (DateTime?)p.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<bool> IsPostAlive(Guid postUuid, CancellationToken ct)
    {
        return await dbContext.Posts.AsNoTracking().AnyAsync(p => p.PostUuid == postUuid && p.DeletedAt == null, ct);
    }

    public async Task<bool> PutLikeAsync(Guid userUuid, Guid postUuid, CancellationToken ct)
    {
        LikeEntity? likeEntity = await dbContext.Likes.Where(e => e.UserUuid == userUuid && e.PostUuid == postUuid).FirstOrDefaultAsync(ct);
        if (likeEntity is null) // 없으면 생성
        {
            likeEntity = new LikeEntity() { UserUuid = userUuid, PostUuid = postUuid };
            await dbContext.Likes.AddAsync(likeEntity, ct);
            return true;
        }

        if (likeEntity.DeletedAt != null) // 삭제되어있던거면 DeletedAt을 NULL 처리
        {
            likeEntity.DeletedAt = null;
            return true;
        }

        // 이미 있고 동일한 상태임
        return false;
    }

    public async Task<bool> DeleteLikeAsync(Guid userUuid, Guid postUuid, CancellationToken ct)
    {
        LikeEntity? likeEntity = await dbContext.Likes.Where(e => e.UserUuid == userUuid && e.PostUuid == postUuid).FirstOrDefaultAsync(ct);
        if (likeEntity is null || likeEntity.DeletedAt != null)
            return false;

        likeEntity.DeletedAt = DateTime.UtcNow;
        return true;
    }

    public async Task<int> GetLikeCountAsync(Guid postUuid, CancellationToken ct)
    {
        return await dbContext.Likes.Where(e => e.PostUuid == postUuid && e.DeletedAt == null).CountAsync(ct);
    }

    public async Task<bool> IsLikeAsync(Guid userUuid, Guid postUuid, CancellationToken ct)
    {
        return await dbContext.Likes.AsNoTracking().AnyAsync(e => e.UserUuid == userUuid && e.PostUuid == postUuid && e.DeletedAt == null, ct);
    }
}