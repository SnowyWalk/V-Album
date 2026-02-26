using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;

namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class UserRepository
{
    private readonly AppDbContext m_dbContext;
    public UserRepository(AppDbContext dbContext)
    {
        m_dbContext = dbContext;
    }

    public async Task<(Domains.User.User User, bool IsNewUser)> FindOrCreateUserByGoogleSubAsync(string googleSub, CancellationToken ct)
    {
        User? user = await m_dbContext.Users
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

            m_dbContext.Users.Add(user);

            try
            {
                await m_dbContext.SaveChangesAsync(ct);
                isNewUser = true;
            }
            catch (DbUpdateException)
            {
                // 같은 googleSub로 동시 요청이 들어온 경우 unique 제약으로 실패할 수 있으므로 재조회
                user = await m_dbContext.Users
                    .SingleOrDefaultAsync(a => a.GoogleSub == googleSub, ct);
                if (user is null)
                    throw new InvalidOperationException("Auth record creation conflicted, but existing record was not found.");
            }
        }

        return (user.ToDomain(), isNewUser);
    }

    public async Task<Domains.User.User?> GetUserByGoogleSub(string googleSub, CancellationToken ct)
    {
        User? user = await m_dbContext.Users.AsNoTracking().SingleOrDefaultAsync(e => e.GoogleSub == googleSub, ct);
        if (user is null)
            return null;

        return user.ToDomain();
    }

}
