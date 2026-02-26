using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.Persistence.Mapping;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
using Group = V_Album_Server.Domains.Group.Group;
namespace V_Album_Server.Infrastructures.Persistence.Repositories;

public class MemberRepository
{
    private readonly AppDbContext m_dbContext;
    
    public MemberRepository(AppDbContext dbContext) 
    {
        m_dbContext = dbContext;
    }

    // 특정 유저의 모든 그룹 조회
    public async Task<List<Group>> GetUsersAllGroupsAsync(Guid userUuid, CancellationToken ct)
    {
        return await m_dbContext.Members
            .Where(member => member.UserUuid == userUuid && member.DeletedAt == null)
            .Join(
                m_dbContext.Groups.Where(group => group.DeletedAt == null),
                member => member.GroupUuid,
                group => group.GroupUuid,
                (member, group) => new { member, group }
                )
            .OrderBy(ret => ret.member.JoinedAt)
            .Select(ret => ret.group.ToDomain())
            .ToListAsync(ct);
    }
}