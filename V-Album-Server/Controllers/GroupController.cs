using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Services.Group;
namespace V_Album_Server.Controllers;

[ApiController]
[Route("api/group")]
public class GroupController(GroupService groupService) : ControllerBase
{
    public sealed record GroupCreateRequest(string GroupName);
    public sealed record GroupCreateResponse(DomainGroup CreatedGroup);

    [HttpPost("create")]
    public async Task<IActionResult> CreateGroup([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromBody] GroupCreateRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        var result = await groupService.CreateGroupAsync(googleSub, request.GroupName, ct);
        return Ok(result);
    }
}