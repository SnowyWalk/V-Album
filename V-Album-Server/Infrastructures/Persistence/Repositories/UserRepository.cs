using Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;

namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class UserRepository(AppDbContext dbContext, IOptions<AppDefaultsOptions> appDefaultOptions)
{
    public async Task<(DomainUser User, bool IsNewUser)> FindOrCreateUserByGoogleSubAsync(string googleSub, CancellationToken ct)
    {
        User? user = await dbContext.Users
            .SingleOrDefaultAsync(a => a.GoogleSub == googleSub, ct);

        bool isNewUser = false;
        if (user is null)
        {
            user = new User
            {
                UserUuid = Guid.NewGuid(),
                Nickname = $"User_{Guid.NewGuid()}",
                GoogleSub = googleSub,
            };

            dbContext.Users.Add(user);
            dbContext.Members.Add(new Member
            {
                UserUuid = user.UserUuid,
                GroupUuid = appDefaultOptions.Value.DefaultGroupUuid,
            });

            try
            {
                await dbContext.SaveChangesAsync(ct);
                isNewUser = true;
            }
            catch (DbUpdateException)
            {
                // 같은 googleSub로 동시 요청이 들어온 경우 unique 제약으로 실패할 수 있으므로 재조회
                user = await dbContext.Users
                    .SingleOrDefaultAsync(a => a.GoogleSub == googleSub, ct);
                if (user is null)
                    throw new InvalidOperationException("Auth record creation conflicted, but existing record was not found.");
            }
            
            
        }

        return (user.ToDomain(), isNewUser);
    }

    public async Task<DomainUser?> GetUserByGoogleSub(string googleSub, CancellationToken ct)
    {
        User? user = await dbContext.Users.AsNoTracking().SingleOrDefaultAsync(e => e.GoogleSub == googleSub, ct);
        if (user is null)
            return null;

        return user.ToDomain();
    }

}
