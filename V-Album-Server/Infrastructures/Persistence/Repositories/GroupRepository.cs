using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class GroupRepository(AppDbContext dbContext)
{
    public async Task<DomainGroup> CreateGroupWithOwnerAsync(string groupName, Guid userUuid, CancellationToken ct)
    {
        List<Group> createdGroups = await dbContext.Groups
            .FromSqlInterpolated($"CALL sp_create_group({Guid.NewGuid()}, {groupName}, {userUuid})")
            .AsNoTracking()
            .ToListAsync(ct);
        return createdGroups.First().ToDomain();
    }
}