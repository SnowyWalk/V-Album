namespace V_Album_Server.Domains.Auth;

public class User
{ 
    public Guid UserUuid { get; }
    public string? GoogleSub { get; }

    public User(Guid userUuid, string? googleSub)
    { 
        UserUuid = userUuid;
        GoogleSub = googleSub;
    }

    public static User NewWithGoogle(string googleSub) => new User(Guid.NewGuid(), googleSub.Trim());
}