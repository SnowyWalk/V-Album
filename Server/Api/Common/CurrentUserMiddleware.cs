using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Domain.Entities;

namespace Server.Api.Common;
public static class CurrentUserMiddleware
{
    public const string HeaderName = "X-User-UUID";
    public const string HttpContextItemKey = "CurrentUser";

    public static IApplicationBuilder UseCurrentUser(this IApplicationBuilder app)
    {
        return app.Use(async (ctx, next) =>
        {
            // 인증이 필요한 엔드포인트에서만 검사하도록: 일단 헤더 있으면 로드해 둠
            if (ctx.Request.Headers.TryGetValue(HeaderName, out var values) &&
                Guid.TryParse(values.FirstOrDefault(), out var userUuid))
            {
                var db = ctx.RequestServices.GetRequiredService<AppDbContext>();
                var user = await db.Users.FirstOrDefaultAsync(u => u.Uuid == userUuid);
                if (user is not null)
                    ctx.Items[HttpContextItemKey] = user;
            }

            await next();
        });
    }

    public static User RequireUser(HttpContext ctx)
    {
        if (ctx.Items.TryGetValue(HttpContextItemKey, out var obj) && obj is User u)
            return u;

        throw new UnauthorizedAccessException($"로그인이 필요해. 요청 헤더에 {HeaderName}: <userUuid> 를 넣어줘.");
    }
}