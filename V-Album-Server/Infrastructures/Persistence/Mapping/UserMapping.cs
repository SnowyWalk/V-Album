using System;
namespace V_Album_Server.Infrastructures.Persistence.Mapping;
public static class UserMapping
{
    public static Domains.User.User ToDomain(this Scaffold.User user)
    {
        return new Domains.User.User(user.UserUuid, user.Nickname, user.GoogleSub, user.Pic);
    }
}
