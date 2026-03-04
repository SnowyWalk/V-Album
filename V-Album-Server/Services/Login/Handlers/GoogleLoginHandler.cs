
using Google.Apis.Auth;
using V_Album_Server.Infrastructures.Persistence.Repositories;

namespace V_Album_Server.Services.Login.Handlers;

public class GoogleLoginHandler : ILoginHandler
{
    public LoginProvider Provider => LoginProvider.Google;

    private readonly IConfiguration m_configuration;
    private readonly UserRepository m_userRepository;
    public GoogleLoginHandler(UserRepository userRepository, IConfiguration configuration)
    {
        m_configuration = configuration;
        m_userRepository = userRepository;
    }


    public async Task<LoginResult> LoginAsync(string token, CancellationToken ct)
    {
        var googleSub = await GetGoogleSubFromGoogleIdToken(token);
        if (string.IsNullOrWhiteSpace(googleSub))
            throw new InvalidDataException("Google subject(sub) was missing from token.");

        var (user, isNewUser) = await m_userRepository.FindOrCreateUserByGoogleSubAsync(googleSub, ct);
        return new LoginResult(user.UserUuid.ToString(), isNewUser);
    }

    private async Task<string> GetGoogleSubFromGoogleIdToken( string googleIdToken)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                googleIdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [GetClientId()],
                });
        }
        catch (InvalidJwtException)
        {
            throw new UnauthorizedAccessException("Invalid Google ID token.");
        }

        return payload.Subject;
    }
    private string GetClientId()
    {
        var clientId = m_configuration["GoogleAuth:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
            throw new InvalidOperationException("GoogleAuth:ClientId is not configured.");
        return clientId;
    }
}
