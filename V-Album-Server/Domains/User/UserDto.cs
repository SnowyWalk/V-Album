namespace V_Album_Server.Domains.User;

public record UserDto(Guid UserUuid, string Nickname, string? Pic);