namespace V_Album_Server.Infrastructures.Persistence.Mapping;
public static class UserMapping
{
    public static DomainUser ToDomain(this UserEntity user)
    {
        return new DomainUser(user.UserUuid, user.Nickname, user.GoogleSub, user.Pic);
    }
}
