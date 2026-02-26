namespace V_Album_Server.Domains.User;

public class User
{ 
    public Guid UserUuid { get; }
    public string Nickname { get; }
    public string? GoogleSub { get; }
    public string? Pic { get; }

    public User(Guid userUuid, string nickname, string? googleSub, string? pic)
    { 
        UserUuid = userUuid;
        Nickname = nickname;
        GoogleSub = googleSub;
        Pic = pic;
    }
}