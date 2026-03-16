using V_Album_Server.Controllers;
using V_Album_Server.Domains.User;
using V_Album_Server.Infrastructures.Persistence.Repositories;

namespace V_Album_Server.Services.User;

public class UserService(UserRepository userRepository, MemberRepository memberRepository)
{
    public async Task<UserDto> GetMe(string googleSub, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        return new UserDto(me.UserUuid, me.Nickname, me.Pic);
    }

    public async Task<UserController.GetGroupsResponse> GetGroups(string googleSub, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        List<DomainGroup> groups = await memberRepository.GetUsersAllGroupsAsync(me.UserUuid, ct);
        return new UserController.GetGroupsResponse(groups);
    }
    public async Task<UserDto> GetUserAvatar(Guid userUuid, CancellationToken ct)
    {
        DomainUser? user = await userRepository.GetUserByUuid(userUuid, ct);
        if (user is null)
            throw new UserNotFoundException(userUuid.ToString());

        return new UserDto(user.UserUuid, user.Nickname, user.Pic);
    }
}