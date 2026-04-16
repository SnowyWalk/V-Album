using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Interfaces;
using V_Album_Server.Services.Member;
using V_Album_Server.Services.User;
namespace V_Album_Server.UseCases.Post;

public class UpdatePostLikeUseCase(
    UserRepository userRepository,
    MemberService memberService,
    PostRepository postRepository,
    IUnitOfWork uow)
{
    public async Task<(bool isLikedByMe, int likeCount)> Execute(string googleSub, Guid postUuid, bool isLike, CancellationToken ct)
    {
        (DomainUser me, _) = await GetAuthorizedContextAsync(googleSub, postUuid, ct);

        bool isDirty;
        if (isLike)
            isDirty = await postRepository.PutLikeAsync(me.UserUuid, postUuid, ct);
        else
            isDirty = await postRepository.DeleteLikeAsync(me.UserUuid, postUuid, ct);

        if (isDirty)
            await uow.SaveChangesAsync(ct);

        bool isLikedByMe = await postRepository.IsLikeAsync(me.UserUuid, postUuid, ct);
        int likeCount = await postRepository.GetLikeCountAsync(postUuid, ct);
        return (isLikedByMe, likeCount);
    }

    private async Task<(DomainUser me, PostEntity postEntity)> GetAuthorizedContextAsync(string googleSub, Guid postUuid, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        PostEntity? postEntity = await postRepository.GetPostAsync(postUuid, ct);
        if (postEntity is null)
            throw new PostNotFoundException(postUuid);

        if (!await memberService.IsMemberAsync(me.UserUuid, postEntity.GroupUuid, ct))
            throw new PostAccessDeniedException(postUuid, me.UserUuid);

        return (me, postEntity);
    }
}
