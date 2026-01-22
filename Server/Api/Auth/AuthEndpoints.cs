using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Domain.Entities;

namespace Server.Api.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/auth");

        // 닉네임 로그인(= user upsert)
        g.MapPost("/nickname", async (NicknameLoginRequest req, AppDbContext db) =>
        {
            var name = (req.DisplayName ?? "").Trim();
            if (string.IsNullOrWhiteSpace(name))
                return Results.BadRequest(new { message = "DisplayName은 필수야." });

            // displayName 중복 허용 정책이지만 "자격증명"으로 쓰겠다고 했으니
            // 여기서는 1개로 고정(동명이인 문제는 나중에 구글로그인/외부ID로 해결)
            var user = await db.Users
                .IgnoreQueryFilters() // 혹시 deletedAt 있는 레코드도 검사하고 싶으면
                .FirstOrDefaultAsync(u => u.DisplayName == name && u.DeletedAt == null);

            if (user is null)
            {
                user = new User
                {
                    Uuid = Guid.NewGuid(),
                    DisplayName = name,
                    UserType = UserType.Guest,
                    ExternalId = null,
                    RegisteredAt = null,
                    DeletedAt = null,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow,
                };
                db.Users.Add(user);
                await db.SaveChangesAsync();
            }

            return Results.Ok(new LoginResponse(user.Uuid, user.DisplayName, user.UserType.ToString()));
        });

        return app;
    }
}
