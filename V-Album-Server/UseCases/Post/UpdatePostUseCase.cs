using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Interfaces;
using V_Album_Server.Services.Member;
using V_Album_Server.Services.User;

namespace V_Album_Server.UseCases.Post;

public class UpdatePostUseCase(
    UserRepository userRepository,
    PostRepository postRepository,
    IUnitOfWork uow,
    MemberService memberService)
{
    public async Task Execute(string googleSub, Guid postUuid, string? content, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        PostEntity? postEntity = await postRepository.GetPostAsync(postUuid, ct);
        if (postEntity is null)
            throw new InvalidOperationException("Post not found.");

        if (!await memberService.HasAuthorityAsync(me.UserUuid, postEntity.GroupUuid, postEntity.UserUuid, ct))
            throw new UnauthorizedAccessException();

        postEntity.Content = string.IsNullOrWhiteSpace(content) ? null : content;
        postEntity.UpdatedAt = DateTime.UtcNow;

        await uow.SaveChangesAsync(ct);
    }
}
