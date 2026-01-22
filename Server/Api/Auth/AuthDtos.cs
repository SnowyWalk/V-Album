namespace Server.Api.Auth;

public sealed record NicknameLoginRequest(string DisplayName);
public sealed record LoginResponse(Guid UserUuid, string DisplayName, string UserType);
