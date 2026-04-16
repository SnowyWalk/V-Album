using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Interfaces;
using V_Album_Server.Services.Member;
using V_Album_Server.Services.User;
namespace V_Album_Server.UseCases.Post;

public class DeletePostCommentUseCase(UserRepository userRepository, MemberService memberService, PostRepository postRepository, IUnitOfWork uow)
{
    public async Task<List<DomainComment>> Execute(string googleSub, Guid commentUuid, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        DomainComment? comment = await postRepository.GetCommentAsync(commentUuid, ct);
        if (comment is null)
            throw new CommentNotFoundException(commentUuid);

        PostEntity? postEntity = await postRepository.GetPostAsync(comment.PostUuid, ct);
        if (postEntity is null)
            throw new PostNotFoundException(comment.PostUuid);

        if (!await memberService.HasAuthorityAsync(me.UserUuid, postEntity.GroupUuid, comment.UserUuid, ct))
            throw new CommentAccessDeniedException(commentUuid, me.UserUuid);

        await postRepository.DeleteCommentAsync(commentUuid, ct);
        await uow.SaveChangesAsync(ct);

        List<DomainComment> commentList = await postRepository.GetCommentsAsync(comment.PostUuid, ct);
        return commentList;
    }
}