namespace V_Album_Server.Domains.Member;

public enum MemberRole { Owner, Admin, Member }

public class Member
{
    public Guid UserUuid { get; }
    public Guid GroupUuid { get; }
    public MemberRole Role { get; }
    public string? Alias { get; } = null!;
    
    public Member(Guid userUuid, Guid groupUuid, string role, string? alias)
    {
        UserUuid = userUuid;
        GroupUuid = groupUuid;
        Role = Enum.Parse<MemberRole>(role);
        Alias = alias;
    }
}