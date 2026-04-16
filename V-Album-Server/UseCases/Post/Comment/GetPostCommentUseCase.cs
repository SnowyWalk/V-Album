using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Interfaces;
using V_Album_Server.Services.Member;
using V_Album_Server.Services.User;
namespace V_Album_Server.UseCases.Post;

public class GetPostCommentUseCase(UserRepository userRepository, MemberService memberService, PostRepository postRepository)
{
    public async Task<List<DomainComment>> Execute(string googleSub, Guid postUuid, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        PostEntity? postEntity = await postRepository.GetPostAsync(postUuid, ct);
        if (postEntity is null)
            throw new PostNotFoundException(postUuid);

        if (!await memberService.IsMemberAsync(me.UserUuid, postEntity.GroupUuid, ct))
            throw new CommentAccessDeniedException(postUuid, me.UserUuid);

        List<DomainComment> commentList = await postRepository.GetCommentsAsync(postUuid, ct);
        return commentList;
    }
}