using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Services.Group;
using V_Album_Server.UseCases.Feed;
using V_Album_Server.UseCases.Post;
namespace V_Album_Server.Controllers;

[ApiController]
[Route("api/group")]
public class GroupController(
    GroupService groupService, 
    CreatePostUseCase createPostUseCase, 
    GetFeedUseCase getFeedUseCase, 
    GetAllFeedUseCase getAllFeedUseCase,
    DeletePostUseCase deletePostUseCase,
    UpdatePostUseCase updatePostUseCase) : ControllerBase
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
    
    
    public sealed record FeedRequest(string GroupUuid, DateTime? CursorDateTime, string? CursorPostUuid, int Limit);
    public sealed record FeedItem(DomainPost Post, DomainPhoto[]? Photos);
    public sealed record FeedCursor(DateTime DateTime, Guid PostUuid);
    public sealed record FeedResponse(FeedItem[] FeedPosts, bool HasMore, FeedCursor? NextCursor);
    
    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromQuery] FeedRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });
        
        FeedResponse result = await getFeedUseCase.Execute(
            googleSub, 
            new Guid(request.GroupUuid), 
            request.Limit,
            request.CursorDateTime, 
            request.CursorPostUuid is not null ? new Guid(request.CursorPostUuid) : null, 
            ct);
        
        return Ok(result);
    }

    [HttpGet("feed/all")]
    public async Task<IActionResult> GetAllFeed([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromQuery] FeedRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        FeedResponse result = await getAllFeedUseCase.Execute(
            googleSub,
            request.Limit,
            request.CursorDateTime,
            request.CursorPostUuid is not null ? new Guid(request.CursorPostUuid) : null,
            ct);

        return Ok(result);
    }
    
    public sealed record DeletePostRequest(string PostUuid);
    public sealed record UpdatePostRequest(string PostUuid, string? Content);
    
    [HttpPost("delete-post")]
    public async Task<IActionResult> DeletePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromBody] DeletePostRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });
        
        await deletePostUseCase.Execute(googleSub, new Guid(request.PostUuid), ct);
        
        return Ok();
    }

    [HttpPost("update-post")]
    public async Task<IActionResult> UpdatePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromBody] UpdatePostRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        await updatePostUseCase.Execute(googleSub, new Guid(request.PostUuid), request.Content, ct);

        return Ok();
    }
}
