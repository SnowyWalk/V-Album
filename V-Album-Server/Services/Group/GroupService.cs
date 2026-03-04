using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Services.User;
namespace V_Album_Server.Services.Group;

public class GroupService(UserRepository userRepository, GroupRepository groupRepository)
{
    public async Task<GroupController.GroupCreateResponse> CreateGroupAsync(string googleSub, string groupName, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        DomainGroup newGroup = await groupRepository.CreateGroupWithOwnerAsync(groupName, me.UserUuid, ct);
        return new GroupController.GroupCreateResponse(newGroup);
    }

}