namespace V_Album_Server.Domains.Member;

public enum MemberRole { Owner, Admin, Member }

public class Member
{
    public Guid UserUuid { get; }
    public Guid GroupUuid { get; }
    public MemberRole Role { get; }
    public string? Alias { get; } = null!;
    
    public Member(Guid memberUserUuid, Guid memberGroupUuid, string memberRole, string? memberAlias)
    {
        UserUuid = memberUserUuid;
        GroupUuid = memberGroupUuid;
        Role = Enum.Parse<MemberRole>(memberRole);
        Alias = memberAlias;
    }
}