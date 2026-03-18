using Microsoft.EntityFrameworkCore;
using V_Album_Server.Domains.Member;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
namespace V_Album_Server.Services.Member;

public class MemberService(AppDbContext dbContext)
{
    public async Task<bool> HasAuthorityAsync(Guid userUuid, Guid groupUuid, Guid writerUserUuid, CancellationToken ct)
    {
        MemberEntity? memberEntity = await dbContext.Members.AsNoTracking().FirstOrDefaultAsync(e => e.UserUuid == userUuid && e.GroupUuid == groupUuid && e.DeletedAt == null, ct);
        if (memberEntity is null)
            return false;
        
        if (!Enum.TryParse(memberEntity.Role, out MemberRole role))
            throw new InvalidMemberRoleException("MemberRole is not defined.");

        if (role is MemberRole.Owner or MemberRole.Admin)
            return true;

        return userUuid == writerUserUuid;
    }
}

public class InvalidMemberRoleException(string message) : Exception(message);