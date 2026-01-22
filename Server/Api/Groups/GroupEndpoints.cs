using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Api.Common;

namespace Server.Api.Groups;

public static class GroupEndpoints
{
    public static IEndpointRouteBuilder MapGroupEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("");

        // 1) 특정 유저의 그룹 목록 받아오기
        // - 인증 없이도 가능하게 열어둘지/막을지는 정책인데,
        //   지금은 "현재 로그인 유저" 기준으로도 쉽게 쓰게 /me도 제공.
        g.MapGet("/users/{userUuid:guid}/groups", async (Guid userUuid, AppDbContext db) =>
        {
            var groups = await db.Members
                .AsNoTracking()
                .Where(m => m.UserUuid == userUuid && m.DeletedAt == null)
                .Join(db.Groups.AsNoTracking(),
                    m => m.GroupUuid,
                    gr => gr.Uuid,
                    (m, gr) => new GroupSummaryDto(gr.Uuid, gr.Name))
                .ToListAsync();

            return Results.Ok(groups);
        });

        // (편의) 나의 그룹 목록
        g.MapGet("/users/me/groups", async (HttpContext ctx, AppDbContext db) =>
        {
            var me = CurrentUserMiddleware.RequireUser(ctx);
            var groups = await db.Members
                .AsNoTracking()
                .Where(m => m.UserUuid == me.Uuid && m.DeletedAt == null)
                .Join(db.Groups.AsNoTracking(),
                    m => m.GroupUuid,
                    gr => gr.Uuid,
                    (m, gr) => new GroupSummaryDto(gr.Uuid, gr.Name))
                .ToListAsync();

            return Results.Ok(groups);
        });

        // 2) 특정 그룹의 타임라인 받아오기 (posts, 최신순)
        // 커서 페이징: beforeCreatedAt (옵션)
        g.MapGet("/groups/{groupUuid:guid}/timeline", async (
            Guid groupUuid,
            DateTimeOffset? beforeCreatedAt,
            int? limit,
            HttpContext ctx,
            AppDbContext db) =>
        {
            var me = CurrentUserMiddleware.RequireUser(ctx);

            // 멤버만 접근 가능
            var isMember = await db.Members.AnyAsync(m =>
                m.GroupUuid == groupUuid && m.UserUuid == me.Uuid && m.DeletedAt == null);

            if (!isMember)
                return Results.Forbid();

            var take = Math.Clamp(limit ?? 20, 1, 50);

            var baseQuery = db.Posts
                .AsNoTracking()
                .Where(p => p.GroupUuid == groupUuid && p.DeletedAt == null);

            if (beforeCreatedAt is not null)
                baseQuery = baseQuery.Where(p => p.CreatedAt < beforeCreatedAt.Value);

            // 성능/단순화를 위해 서브쿼리 카운트 사용 (초기 버전)
            var timeline = await baseQuery
                .OrderByDescending(p => p.CreatedAt)
                .Take(take)
                .Select(p => new TimelinePostDto(
                    p.Uuid,
                    p.UserUuid,
                    db.Users.Where(u => u.Uuid == p.UserUuid).Select(u => u.DisplayName).First(),
                    p.Title,
                    p.Body,
                    p.CreatedAt,
                    db.Photos.Count(ph => ph.PostUuid == p.Uuid),
                    db.PostComments.Count(c => c.PostUuid == p.Uuid && c.DeletedAt == null),
                    db.PostTags.Count(t => t.PostUuid == p.Uuid),
                    db.Photos
                        .Where(ph => ph.PostUuid == p.Uuid)
                        .OrderBy(ph => ph.SortOrder)
                        .Select(ph => ph.PreviewSrc)
                        .FirstOrDefault()
                ))
                .ToListAsync();

            return Results.Ok(timeline);
        });

        // 3) 특정 그룹의 사진목록 받아오기 (최신순)
        // 커서 페이징: beforeCreatedAt (옵션)
        g.MapGet("/groups/{groupUuid:guid}/photos", async (
            Guid groupUuid,
            DateTimeOffset? beforeCreatedAt,
            int? limit,
            HttpContext ctx,
            AppDbContext db) =>
        {
            var me = CurrentUserMiddleware.RequireUser(ctx);

            var isMember = await db.Members.AnyAsync(m =>
                m.GroupUuid == groupUuid && m.UserUuid == me.Uuid && m.DeletedAt == null);

            if (!isMember)
                return Results.Forbid();

            var take = Math.Clamp(limit ?? 30, 1, 100);

            var q = db.Photos
                .AsNoTracking()
                .Where(ph => ph.GroupUuid == groupUuid);

            if (beforeCreatedAt is not null)
                q = q.Where(ph => ph.CreatedAt < beforeCreatedAt.Value);

            var photos = await q
                .OrderByDescending(ph => ph.CreatedAt)
                .ThenByDescending(ph => ph.SortOrder)
                .Take(take)
                .Select(ph => new PhotoItemDto(
                    ph.Uuid,
                    ph.PostUuid,
                    ph.SortOrder,
                    ph.Src,
                    ph.PreviewSrc,
                    ph.Width,
                    ph.Height,
                    ph.Size,
                    ph.SrcHash,
                    ph.CreatedAt,
                    ph.PlaceUuid,
                    ph.PlaceUuid == null
                        ? null
                        : db.Places.Where(pl => pl.Uuid == ph.PlaceUuid).Select(pl => pl.Name).FirstOrDefault()
                ))
                .ToListAsync();

            return Results.Ok(photos);
        });

        return app;
    }
}
