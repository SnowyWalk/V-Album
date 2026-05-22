using V_Album_Server.Controllers;
using V_Album_Server.Domains.User;
using V_Album_Server.Infrastructures.Persistence.Repositories;

namespace V_Album_Server.Services.User;

public class UserService(UserRepository userRepository, MemberRepository memberRepository)
{
    public async Task<DomainUser> GetMe(string googleSub, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        return me;
    }

    public async Task<List<DomainGroup>> GetGroups(string googleSub, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        List<DomainGroup> groups = await memberRepository.GetUsersAllGroupsAsync(me.UserUuid, ct);
        return groups;
    }
    public async Task<DomainUser> GetUserAvatar(Guid userUuid, CancellationToken ct)
    {
        DomainUser? user = await userRepository.GetUserByUuid(userUuid, ct);
        if (user is null)
            throw new UserNotFoundException(userUuid.ToString());

        return user;
    }
}