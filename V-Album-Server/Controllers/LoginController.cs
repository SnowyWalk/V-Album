using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Services.Login;

namespace V_Album_Server.Controllers;

[ApiController]
[Route("api/auth/login")]
public class LoginController(LoginService loginService) : ControllerBase
{
    public sealed record GoogleLoginRequest(string? GoogleIdToken);
    
    [HttpPost("google")]
    public async Task<IActionResult> LoginWithGoogle([FromBody] GoogleLoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.GoogleIdToken))
            return BadRequest(new { error = "googleIdToken is required." });

        LoginResult result = await loginService.LoginAsync(LoginProvider.Google, request.GoogleIdToken, ct);
        return Ok(new { result.userUuid, result.isNewUser });
    }

}