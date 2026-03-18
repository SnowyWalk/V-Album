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

    public async Task<bool> IsPostAlive(Guid postUuid, CancellationToken ct)
    {
        return await dbContext.Posts.AsNoTracking().AnyAsync(p => p.PostUuid == postUuid && p.DeletedAt == null, ct);
    }
}