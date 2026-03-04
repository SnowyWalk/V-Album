using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class MemberRepository(AppDbContext dbContext)
{
    // 특정 유저의 모든 그룹 조회
    public async Task<List<DomainGroup>> GetUsersAllGroupsAsync(Guid userUuid, CancellationToken ct)
    {
        return await dbContext.Members
            .Where(member => member.UserUuid == userUuid && member.DeletedAt == null)
            .Join(
                dbContext.Groups.Where(group => group.DeletedAt == null),
                member => member.GroupUuid,
                group => group.GroupUuid,
                (member, group) => new { member, group }
                )
            .OrderBy(ret => ret.member.JoinedAt)
            .Select(ret => ret.group.ToDomain())
            .ToListAsync(ct);
    }
}