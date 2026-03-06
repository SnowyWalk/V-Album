using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Services.Group;
namespace V_Album_Server.Controllers;

[ApiController]
[Route("api/group")]
public class GroupController(GroupService groupService) : ControllerBase
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

    public sealed record PostRequest(string Content, Guid GroupUuid, List<IFormFile> Images);
    public sealed record PostResponse(Guid GroupUuid, Guid PostUuid);
    
    [HttpPost("post")]
    public async Task<IActionResult> CreatePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromForm] PostRequest request)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });
        
        var result = await groupService.UploadPostAsync(googleSub, request.GroupUuid, request.Content, request.Images);
        
        string content = request.Content;
        List<IFormFile> images = request.Images;

        foreach (var image in images)
        {
            var fileName = image.FileName;
            var length = image.Length;

            using var stream = new FileStream($"uploads/{fileName}", FileMode.Create);
            await image.CopyToAsync(stream);
        }

        return Ok();
    }
    
}