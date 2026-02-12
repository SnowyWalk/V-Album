using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
using V_Album_Server.Services.Login;

namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class UserRepository
{
    private readonly AppDbContext m_dbContext;
    public UserRepository(AppDbContext dbContext)
    {
        m_dbContext = dbContext;
    }

    public async Task<LoginResult> GoogleLoginOrCreateAsync(string googleSub, CancellationToken ct)
    {
        var auth = await m_dbContext.Users
            .SingleOrDefaultAsync(a => a.GoogleSub == googleSub, ct);

        bool isNewUser = false;
        if (auth is null)
        {
            auth = new User
            {
                UserUuid = Guid.NewGuid().ToString("N"),
                GoogleSub = googleSub,
            };

            m_dbContext.Users.Add(auth);

            try
            {
                await m_dbContext.SaveChangesAsync(ct);
                isNewUser = true;
            }
            catch (DbUpdateException)
            {
                // 같은 googleSub로 동시 요청이 들어온 경우 unique 제약으로 실패할 수 있으므로 재조회
                auth = await m_dbContext.Users
                    .SingleAsync(a => a.GoogleSub == googleSub, ct);
                if (auth is null)
                    throw new InvalidOperationException("Auth record creation conflicted, but existing record was not found.");
            }
        }

        return new LoginResult(
            userUuid: auth.UserUuid,
            isNewUser: isNewUser
        );
    }

}
