namespace V_Album_Server.Domains.Auth;

public class Auth
{ 
    public Guid UserUuid { get; }
    public string? GoogleSub { get; }

    public Auth(Guid userUuid, string? googleSub)
    { 
        UserUuid = userUuid;
        GoogleSub = googleSub;
    }

    public static Auth NewWithGoogle(string googleSub) => new Auth(Guid.NewGuid(), googleSub.Trim());
}