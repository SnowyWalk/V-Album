using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
using V_Album_Server.Services.User;
namespace V_Album_Server.Services.Group;

public class GroupService(AppDbContext dbContext, UserRepository userRepository, GroupRepository groupRepository)
{
    public async Task<GroupController.GroupCreateResponse> CreateGroupAsync(string googleSub, string groupName, CancellationToken ct)
    {
        Domains.User.User? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        var newGroup = new Infrastructures.Persistence.Scaffold.Group() {
            Name = groupName,
        };
        await dbContext.Groups.AddAsync(newGroup, ct);

        var newOwnerMember = new Member() {
            GroupUuid = newGroup.GroupUuid,
            UserUuid = me.UserUuid,
            Role = "Owner"
        }

        await dbContext.Members.AddAsync()

        await dbContext.SaveChangesAsync(ct);

        return new GroupController.GroupCreateResponse(newGroup.ToDomain());
    }

}