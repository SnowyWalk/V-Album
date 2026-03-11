using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Services.Group;
using V_Album_Server.UseCases.Post;
namespace V_Album_Server.Controllers;

[ApiController]
[Route("api/group")]
public class GroupController(GroupService groupService, CreatePostUseCase createPostUseCase) : ControllerBase
{
    public sealed record CreateRequest(string GroupName);
    public sealed record CreateResponse(DomainGroup CreatedGroup);

    [HttpPost("create")]
    public async Task<IActionResult> CreateGroup([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromBody] CreateRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        var result = await groupService.CreateGroupAsync(googleSub, request.GroupName, ct);
        return Ok(result);
    }

    public sealed record PostRequest(string Content, string GroupUuid, List<IFormFile>? photos);
    public sealed record PostResponse(Guid GroupUuid, Guid PostUuid);
    
    [HttpPost("post")]
    public async Task<IActionResult> CreatePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromForm] PostRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });
        
        PostResponse result = await createPostUseCase.Execute(googleSub, new Guid(request.GroupUuid), request.Content, request.photos, ct);
        
        return Ok(result);
    }
    
}