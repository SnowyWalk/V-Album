using SixLabors.ImageSharp;
using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Services.User;
namespace V_Album_Server.Services.Group;

public class GroupService(UserRepository userRepository, GroupRepository groupRepository, ThumbnailQueue thumbnailQueue)
{
    public async Task<GroupController.CreateResponse> CreateGroupAsync(string googleSub, string groupName, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        DomainGroup newGroup = await groupRepository.CreateGroupWithOwnerAsync(groupName, me.UserUuid, ct);
        return new GroupController.CreateResponse(newGroup);
    }
}