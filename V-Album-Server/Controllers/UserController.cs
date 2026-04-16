using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Domains.Group;
using V_Album_Server.Domains.User;
using V_Album_Server.Services.User;

namespace V_Album_Server.Controllers;

[ApiController]
[Route("api/user")]
public class UserController(UserService userService) : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType<UserDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMe([FromHeader(Name = "X-Google-Sub")] string googleSub, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        try
        {
            return Ok(await userService.GetMe(googleSub, ct));
        }
        catch (UserNotFoundException)
        {
            return Unauthorized(new { error = "No user found for this googleSub" });
        }
    }
    
    public sealed record GetGroupsResponse(List<Group> Groups);
    
    [HttpGet("groups")]
    [ProducesResponseType<GetGroupsResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGroups([FromHeader(Name = "X-Google-Sub")] string googleSub, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });
        
        try
        {
            return Ok(await userService.GetGroups(googleSub, ct));
        }
        catch (UserNotFoundException)
        {
            return NotFound();
        }
    }
    
    [HttpGet("avatar/{userUuid}")]
    [ProducesResponseType<UserDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserAvatar(Guid userUuid, CancellationToken ct)
    {
        try
        {
            return Ok(await userService.GetUserAvatar(userUuid, ct));
        }
        catch (UserNotFoundException)
        {
            return NotFound();
        }
    }

}