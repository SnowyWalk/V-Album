using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Domains.Group;
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

    public sealed record GetMeResponse(string UserUuid, string Nickname, string? Pic);

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
            return Unauthorized(new { error = "No user found for this googleSub" });
        }
    }
    
    public sealed record GetGroupsResponse(List<Group> Groups);
    
    [HttpGet("groups")]
    public async Task<IActionResult> GetGroups([FromHeader(Name = "X-Google-Sub")] string googleSub, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });
        
        try
        {
            return Ok(await m_userService.GetGroups(googleSub, ct));
        }
        catch (UserNotFoundException)
        {
            return NotFound();
        }
    }


}