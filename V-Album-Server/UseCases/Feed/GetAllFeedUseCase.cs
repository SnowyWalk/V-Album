using Microsoft.EntityFrameworkCore;
using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
using V_Album_Server.Services.User;

namespace V_Album_Server.UseCases.Feed;

public class GetAllFeedUseCase(AppDbContext dbContext, UserRepository userRepository)
{
    public async Task<GroupController.FeedResponse> Execute(string googleSub, int limit, DateTime? cursorDateTime, Guid? cursorPostUuid, CancellationToken ct)
    {
        // 1. 사용자 존재 확인 및 UUID 획득
        var user = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (user == null)
            throw new UserNotFoundException(googleSub);

        // 2. 사용자가 가입한 그룹 UUID 목록 조회
        var groupUuids = await dbContext.Members
            .AsNoTracking()
            .Where(m => m.UserUuid == user.UserUuid && m.DeletedAt == null)
            .Select(m => m.GroupUuid)
            .ToListAsync(ct);

        if (groupUuids.Count == 0)
            return new GroupController.FeedResponse([], false, null);

        // 3. 해당 그룹들의 게시물 쿼리 구성
        IQueryable<PostEntity> postQuery = dbContext.Posts
            .AsNoTracking()
            .Where(e => groupUuids.Contains(e.GroupUuid) && e.DeletedAt == null);

        // 4. 커서 기반 페이지네이션 적용
        if (cursorDateTime != null && cursorPostUuid != null)
        {
            postQuery = postQuery.Where(e => e.CreatedAt < cursorDateTime || (e.CreatedAt == cursorDateTime && e.PostUuid < cursorPostUuid));
        }

        // 5. 게시물 조회 (HasMore 확인을 위해 limit + 1개 조회)
        var postEntities = await postQuery
            .OrderByDescending(e => e.CreatedAt)
            .ThenByDescending(e => e.PostUuid)
            .Take(limit + 1)
            .ToArrayAsync(ct);

        bool hasMore = postEntities.Length == limit + 1;
        var postsToReturn = postEntities.Take(limit).ToArray();

        if (postsToReturn.Length == 0)
            return new GroupController.FeedResponse([], false, null);

        // 6. 조회된 게시물들의 사진 정보 조회
        var postUuids = postsToReturn.Select(e => e.PostUuid).ToArray();
        var photoEntities = await dbContext.Photos
            .AsNoTracking()
            .Where(e => postUuids.Contains(e.PostUuid))
            .OrderBy(e => e.SortOrder)
            .ToArrayAsync(ct);

        var photoMap = photoEntities
            .Select(e => e.ToDomain())
            .GroupBy(e => e.PostUuid)
            .ToDictionary(g => g.Key, g => g.ToArray());

        // 7. 결과 매핑
        var feedItems = postsToReturn.Select(e => new GroupController.FeedItem(
            e.ToDomain(),
            photoMap.GetValueOrDefault(e.PostUuid)
        )).ToArray();

        GroupController.FeedCursor? nextCursor = null;
        if (hasMore && feedItems.Length > 0)
        {
            var lastItem = feedItems.Last();
            nextCursor = new GroupController.FeedCursor(lastItem.Post.CreatedAt, lastItem.Post.PostUuid);
        }

        return new GroupController.FeedResponse(feedItems, hasMore, nextCursor);
    }
}
