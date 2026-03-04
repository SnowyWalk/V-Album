using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures.Persistence.Repositories;

namespace V_Album_Server.Services.User;

public class UserService(UserRepository userRepository, MemberRepository memberRepository)
{
    public async Task<UserController.GetMeResponse> GetMe(string googleSub, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        return new UserController.GetMeResponse(me.UserUuid.ToString(), me.Nickname, me.Pic);
    }

    public async Task<UserController.GetGroupsResponse> GetGroups(string googleSub, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        List<DomainGroup> groups = await memberRepository.GetUsersAllGroupsAsync(me.UserUuid, ct);
        return new UserController.GetGroupsResponse(groups);
    }
}