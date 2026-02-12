namespace V_Album_Server.Services.Login;

public enum LoginProvider
{
    Google,
    Guest,
}

public sealed record LoginResult(string userUuid, bool isNewUser);

public interface ILoginHandler
{
    LoginProvider Provider { get; }
    Task<LoginResult> LoginAsync(string token, CancellationToken ct);
}

public class LoginService
{
    private readonly IReadOnlyDictionary<LoginProvider, ILoginHandler> m_map;

    public LoginService(IEnumerable<ILoginHandler> handlers)
    {
        m_map = handlers.ToDictionary(e => e.Provider);
    }

    public async Task<LoginResult> LoginAsync(LoginProvider loginProvider, string token, CancellationToken ct)
    {
        if (!m_map.TryGetValue(loginProvider, out ILoginHandler? handler))
            throw new InvalidOperationException($"미구현된 LoginProvider에 대한 LoginAsync() 요청 호출됨. LoginProvider: {loginProvider}");

        return await handler.LoginAsync(token, ct);
    }
}
