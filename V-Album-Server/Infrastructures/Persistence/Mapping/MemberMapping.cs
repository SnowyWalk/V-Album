using V_Album_Server.Domains.Member;
namespace V_Album_Server.Infrastructures.Persistence.Mapping;

public static class MemberMapping
{
    public static Member ToDomain(this MemberEntity member)
    {
        return new Member(
            member.UserUuid,
            member.GroupUuid,
            member.Role,
            member.Alias
            );
    }
}