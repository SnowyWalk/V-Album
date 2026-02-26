using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Services.User;

namespace V_Album_Server.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly UserService m_userService;

    public UserController(UserService userService)
    {
        m_userService = userService;
    }

    public sealed record GetMeResponse(string userUuid, string nickname, string? pic);

    [HttpGet("me")]
    public async Task<IActionResult> GetMe([FromHeader(Name = "X-Google-Sub")] string googleSub, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        try
        {
            return Ok(await m_userService.GetMe(googleSub, ct));
        }
        catch (UserNotFoundException)
        {
            return NotFound();
        }
    }


}