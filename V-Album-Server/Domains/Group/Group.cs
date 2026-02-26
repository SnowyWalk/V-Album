namespace V_Album_Server.Domains.Group;

public class Group
{
    public Guid GroupUuid { get; }
    public string Name { get; }
    public string? Pic { get; }

    public Group(Guid groupGroupUuid, string groupName, string? groupPic)
    {
        GroupUuid = groupGroupUuid;
        Name = groupName;
        Pic = groupPic;
    }
}