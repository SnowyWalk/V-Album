using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class GroupRepository(AppDbContext dbContext)
{
    public async Task<Domains.Group.Group> CreateGroupAsync(string groupName, CancellationToken ct)
    {
        Group newGroup = new Group() {
            Name = groupName,
        };
        await dbContext.Groups.AddAsync(newGroup, ct);
        await dbContext.SaveChangesAsync(ct);
        return newGroup.ToDomain();
    }
}