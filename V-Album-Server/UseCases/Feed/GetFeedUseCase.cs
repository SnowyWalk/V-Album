using Microsoft.EntityFrameworkCore;
using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
using V_Album_Server.Services.User;
namespace V_Album_Server.UseCases.Feed;

public class GetFeedUseCase(AppDbContext dbContext, UserRepository userRepository)
{
    public async Task<GroupController.FeedResponse> Execute(string googleSub, Guid groupUuid, int limit, DateTime? cursorDateTime, Guid? cursorPostUuid, CancellationToken ct)
    {
        if (!await userRepository.IsUserExists(googleSub, ct))
            throw new UserNotFoundException(googleSub);

        IQueryable<PostEntity> postQuery = dbContext.Posts
            .AsNoTracking()
            .Where(e => e.GroupUuid == groupUuid && e.DeletedAt == null);

        if (cursorDateTime != null && cursorPostUuid != null)
            postQuery = postQuery.Where(e => e.CreatedAt < cursorDateTime || (e.CreatedAt == cursorDateTime && e.PostUuid < cursorPostUuid));

        // Post들 조회
        PostEntity[] postEntities = await postQuery
            .OrderByDescending(e => e.CreatedAt)
            .ThenByDescending(e => e.PostUuid)
            .Take(limit + 1) // HasMore 계산하기 위해 1개 더 조회
            .ToArrayAsync(ct);
        
        // Cursor 정보 획득
        bool hasMore = postEntities.Length == limit + 1;
        postEntities = postEntities.Take(limit).ToArray();
        
        // 그 Post들의 Photo 조회
        Guid[] postUuids = postEntities.Select(e => e.PostUuid).ToArray();
        PhotoEntity[] photoEntities = await dbContext.Photos
            .AsNoTracking()
            .Where(e => postUuids.Contains(e.PostUuid))
            .OrderBy(e => e.SortOrder)
            .ThenBy(e => e.PhotoUuid)
            .ToArrayAsync(ct);
        DomainPhoto[] photos = photoEntities.Select(e => e.ToDomain()).ToArray();

        Dictionary<Guid, DomainPhoto[]> photoMap = photos
            .GroupBy(e => e.PostUuid)
            .ToDictionary(k => k.Key, v => v.ToArray());

        GroupController.FeedItem[] results = postEntities
            .Select(e => new GroupController.FeedItem(e.ToDomain(), photoMap.GetValueOrDefault(e.PostUuid)))
            .ToArray();
        
        return new GroupController.FeedResponse(
            FeedPosts: results,
            hasMore,
            NextCursor: hasMore ? new GroupController.FeedCursor(results.Last().Post.CreatedAt, results.Last().Post.PostUuid) : null
            );
    }
}
