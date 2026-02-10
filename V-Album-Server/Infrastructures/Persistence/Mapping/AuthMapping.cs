using V_Album_Server.Domains.Auth;

namespace V_Album_Server.Infrastructures.Persistence.Mapping;
public static class AuthMapping
{

    public static Auth ToDomain(this Scaffold.Auth e)
        => new Auth(
                userUuid: new Guid(e.UserUuid),
                googleSub: e.GoogleSub
            );

    public static Scaffold.Auth ToEntity(this Auth e) => new Scaffold.Auth
    {
        UserUuid = e.UserUuid.ToString(),
        GoogleSub = e.GoogleSub
    };
}
