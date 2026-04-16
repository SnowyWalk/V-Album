using Microsoft.AspNetCore.Mvc;
using V_Album_Server.Services.User;
using V_Album_Server.UseCases.Post;
namespace V_Album_Server.Controllers;

[ApiController]
[Route("api/post")]
public class PostController(
    UpdatePostLikeUseCase updatePostLikeUseCase, 
    CreatePostCommentUseCase createPostCommentUseCase, 
    GetPostCommentUseCase getPostCommentUseCase,
    ILogger<PostController> logger) : ControllerBase
{
    public sealed record PutLikeRequest(Guid PostUuid, Guid MutationUuid);
    public sealed record DeleteLikeRequest(Guid PostUuid, Guid MutationUuid);
    public sealed record LikeResponse(bool IsSuccess, bool IsLikedByMe, int LikeCount, Guid MutationUuid);

    [HttpPut("like")]
    public async Task<IActionResult> PutLike([FromHeader(Name = "X-Google-Sub")] string? googleSub, [FromBody] PutLikeRequest? request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        IActionResult? validationError = ValidateLikeRequest(request);
        if (validationError is not null)
            return validationError;

        PutLikeRequest validatedRequest = request!;
        return await UpdateLike(googleSub, validatedRequest.PostUuid, true, validatedRequest.MutationUuid, ct);
    }

    [HttpDelete("like")]
    public async Task<IActionResult> DeleteLike([FromHeader(Name = "X-Google-Sub")] string? googleSub, [FromBody] DeleteLikeRequest? request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        IActionResult? validationError = ValidateLikeRequest(request);
        if (validationError is not null)
            return validationError;

        DeleteLikeRequest validatedRequest = request!;
        return await UpdateLike(googleSub, validatedRequest.PostUuid, false, validatedRequest.MutationUuid, ct);
    }

    private async Task<IActionResult> UpdateLike(string googleSub, Guid postUuid, bool isLike, Guid mutationUuid, CancellationToken ct)
    {
        try
        {
            (bool isLikedByMe, int likeCount) = await updatePostLikeUseCase.Execute(googleSub, postUuid, isLike, ct);
            return Ok(new LikeResponse(true, isLikedByMe, likeCount, mutationUuid));
        }
        catch (UserNotFoundException userNotFoundException)
        {
            logger.LogWarning(userNotFoundException, "User not found while updating post like.");
            return Unauthorized(new { error = "No user found for this googleSub." });
        }
        catch (PostNotFoundException postNotFoundException)
        {
            return NotFound(new { error = postNotFoundException.Message });
        }
        catch (PostAccessDeniedException postAccessDeniedException)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = postAccessDeniedException.Message });
        }
        catch (InvalidOperationException invalidOperationException)
        {
            return BadRequest(new { error = invalidOperationException.Message });
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Unexpected error while updating post like. PostUuid: {PostUuid}, MutationUuid: {MutationUuid}, IsLike: {IsLike}",
                postUuid,
                mutationUuid,
                isLike);
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "An unexpected error occurred." });
        }
    }

    private IActionResult? ValidateLikeRequest(PutLikeRequest? request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (request is null)
            return BadRequest(new { error = "Request body is required." });

        if (request.PostUuid == Guid.Empty)
            return BadRequest(new { error = "postUuid is required." });

        if (request.MutationUuid == Guid.Empty)
            return BadRequest(new { error = "mutationUuid is required." });

        return null;
    }

    private IActionResult? ValidateLikeRequest(DeleteLikeRequest? request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (request is null)
            return BadRequest(new { error = "Request body is required." });

        if (request.PostUuid == Guid.Empty)
            return BadRequest(new { error = "postUuid is required." });

        if (request.MutationUuid == Guid.Empty)
            return BadRequest(new { error = "mutationUuid is required." });

        return null;
    }

    public sealed record GetCommentsRequest(Guid PostUuid);
    public sealed record PutCommentRequest(Guid PostUuid, string Content);
    public sealed record DeleteCommentRequest(Guid PostUuid, Guid CommentUuid);
    public sealed record CommentResponse();

    [HttpGet("comment")]
    public async Task<IActionResult> GetComments([FromHeader(Name = "X-Google-Sub")] string? googleSub, [FromQuery] GetCommentsRequest? request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });
        
        IActionResult? validationError = ValidateCommentRequest(request);
        if (validationError is not null)
            return validationError;
        
        List<DomainComment> commentList = await getPostCommentUseCase.Execute(googleSub, request!.PostUuid, ct);
        return Ok(commentList);
    }

    [HttpPut("comment")]
    public async Task<IActionResult> PutComment([FromHeader(Name = "X-Google-Sub")] string? googleSub, [FromBody] PutCommentRequest? request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(googleSub))
            return Unauthorized(new { error = "Missing X-Google-Sub header" });

        IActionResult? validationError = ValidateCommentRequest(request);
        if (validationError is not null)
            return validationError;
        
        List<DomainComment> commentList = await createPostCommentUseCase.Execute(googleSub, request!.PostUuid, request.Content, ct);
        return Ok(commentList);
    }

    private IActionResult? ValidateCommentRequest(GetCommentsRequest? request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        if (request is null)
            return BadRequest(new { error = "Request body is required." });

        if (request.PostUuid == Guid.Empty)
            return BadRequest(new { error = "postUuid is required." });

        return null;
    }
    
    private IActionResult? ValidateCommentRequest(PutCommentRequest? request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        if (request is null)
            return BadRequest(new { error = "Request body is required." });

        if (request.PostUuid == Guid.Empty)
            return BadRequest(new { error = "postUuid is required." });
        
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { error = "Content is required." });
        
        return null;
    }
    
    private IActionResult? ValidateCommentRequest(DeleteCommentRequest? request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        if (request is null)
            return BadRequest(new { error = "Request body is required." });

        if (request.PostUuid == Guid.Empty)
            return BadRequest(new { error = "postUuid is required." });
        
        if (request.CommentUuid == Guid.Empty)
            return BadRequest(new { error = "commentUuid is required." });
        
        return null;
    }
}
