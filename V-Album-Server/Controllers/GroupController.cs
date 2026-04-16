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
    public sealed record PostRequest(string Content, string GroupUuid, List<IFormFile>? Photos);
    public sealed record PostResponse(Guid GroupUuid, Guid PostUuid);
    public sealed record FeedRequest(string GroupUuid, DateTime? CursorDateTime, string? CursorPostUuid, int Limit);
    public sealed record FeedItem(DomainPost Post, DomainPhoto[]? Photos, bool LikedByMe, int LikeCount);
    public sealed record LikeStatus(Guid PostUuid, bool IsLiked, int LikeCount);
    public sealed record FeedCursor(DateTime DateTime, Guid PostUuid);
    public sealed record FeedResponse(FeedItem[] FeedPosts, bool HasMore, FeedCursor? NextCursor);
    public sealed record DeletePostRequest(string PostUuid);

    [HttpPost("create")]
    [ProducesResponseType<CreateResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateGroup([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromBody] CreateRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        CreateResponse result = await groupService.CreateGroupAsync(googleSub, request.GroupName, ct);
        return Ok(result);
    }

    [HttpPost("post")]
    [ProducesResponseType<PostResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CreatePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromForm] PostRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        PostResponse result = await createPostUseCase.Execute(
            googleSub,
            new Guid(request.GroupUuid),
            request.Content,
            request.Photos,
            ct);

        return Ok(result);
    }

    [HttpGet("feed")]
    [ProducesResponseType<FeedResponse>(StatusCodes.Status200OK)]
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
    [ProducesResponseType<FeedResponse>(StatusCodes.Status200OK)]
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

    [HttpPost("delete-post")]
    public async Task<IActionResult> DeletePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromBody] DeletePostRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        await deletePostUseCase.Execute(googleSub, new Guid(request.PostUuid), ct);

        return Ok();
    }

    [HttpPost("update-post")]
    public async Task<IActionResult> UpdatePost([FromHeader(Name = "X-Google-Sub")] string googleSub, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        if (!Request.HasFormContentType)
            return StatusCode(StatusCodes.Status415UnsupportedMediaType, new { error = "multipart/form-data request is required." });

        IFormCollection form = await Request.ReadFormAsync(ct);
        string? postUuid = form["postUuid"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(postUuid))
            return BadRequest(new { error = "postUuid is required." });
        if (!Guid.TryParse(postUuid, out Guid postGuid))
            return BadRequest(new { error = "postUuid is invalid." });

        List<string>? newPhotoClientIds = form.TryGetValue("newPhotoClientIds", out var clientIds)
            ? clientIds
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Select(value => value!)
                .ToList()
            : null;
        List<IFormFile> newPhotos = form.Files.GetFiles("newPhotos").ToList();

        await updatePostUseCase.Execute(
            googleSub,
            postGuid,
            form["content"].FirstOrDefault(),
            form["photoOrder"].FirstOrDefault(),
            newPhotoClientIds is { Count: > 0 } ? newPhotoClientIds : null,
            newPhotos.Count > 0 ? newPhotos : null,
            ct);

        return Ok();
    }
}
