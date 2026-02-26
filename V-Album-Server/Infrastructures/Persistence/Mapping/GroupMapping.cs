using V_Album_Server.Domains.Group;
namespace V_Album_Server.Infrastructures.Persistence.Mapping;

public static class GroupMapping
{
    public static Group ToDomain(this Scaffold.Group group)
    {
        return new Group(group.GroupUuid, group.Name, group.Pic);
    }
}