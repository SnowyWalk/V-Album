using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Services.Login;

namespace V_Album_Server.Controllers;

public sealed record GoogleLoginRequest(string? GoogleIdToken);

[ApiController]
[Route("api/auth/login")]
public class LoginController : ControllerBase
{
    private readonly LoginService m_loginService;

    public LoginController(LoginService loginService)
    {
        m_loginService = loginService;
    }

    [HttpPost("google")]
    public async Task<IActionResult> LoginWithGoogle([FromBody] GoogleLoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.GoogleIdToken))
            return BadRequest(new { error = "googleIdToken is required." });

        LoginResult result = await m_loginService.LoginAsync(LoginProvider.Google, request.GoogleIdToken, ct);
        return Ok(new { result.userUuid, result.isNewUser });
    }

}
