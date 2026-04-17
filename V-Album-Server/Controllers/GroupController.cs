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
    public sealed record PostRequest(string? Content, Guid GroupUuid, List<IFormFile>? Photos);
    public sealed record PostResponse(Guid GroupUuid, Guid PostUuid);
    public sealed record FeedRequest(Guid GroupUuid, DateTime? CursorDateTime, Guid? CursorPostUuid, int Limit);
    public sealed record FeedItem(DomainPost Post, DomainPhoto[]? Photos, bool LikedByMe, int LikeCount);
    public sealed record LikeStatus(Guid PostUuid, bool IsLiked, int LikeCount);
    public sealed record FeedCursor(DateTime DateTime, Guid PostUuid);
    public sealed record FeedResponse(FeedItem[] FeedPosts, bool HasMore, FeedCursor? NextCursor);
    public sealed record DeletePostRequest(Guid PostUuid);
    public sealed record UpdatePostRequest(Guid PostUuid, string? Content, string? PhotoOrder, List<string>? NewPhotoClientIds, List<IFormFile>? NewPhotos);

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
    [Consumes("multipart/form-data")]
    [ProducesResponseType<PostResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CreatePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromForm] PostRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        PostResponse result = await createPostUseCase.Execute(
            googleSub,
            request.GroupUuid,
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
            request.GroupUuid,
            request.Limit,
            request.CursorDateTime,
            request.CursorPostUuid is not null ? request.CursorPostUuid : null,
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
            request.CursorPostUuid,
            ct);

        return Ok(result);
    }

    [HttpPost("delete-post")]
    public async Task<IActionResult> DeletePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromBody] DeletePostRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        await deletePostUseCase.Execute(googleSub, request.PostUuid, ct);

        return Ok();
    }

    [HttpPost("update-post")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdatePost([FromHeader(Name = "X-Google-Sub")] string googleSub, [FromForm] UpdatePostRequest request, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        await updatePostUseCase.Execute(
            googleSub,
            request.PostUuid,
            request.Content,
            request.PhotoOrder,
            request.NewPhotoClientIds is { Count: > 0 } ? request.NewPhotoClientIds : null,
            request.NewPhotos is { Count: > 0 } ? request.NewPhotos : null,
            ct);

        return Ok();
    }
}
