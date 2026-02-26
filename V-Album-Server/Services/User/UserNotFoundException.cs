namespace V_Album_Server.Services.User;

public sealed class UserNotFoundException : Exception
{
    public string GoogleSub { get; }

    public UserNotFoundException(string googleSub)
        : base($"User not found for googleSub: {googleSub}")
    {
        GoogleSub = googleSub;
    }
}
