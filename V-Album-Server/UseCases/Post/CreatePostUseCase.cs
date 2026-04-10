using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Interfaces;
using V_Album_Server.Services.Post;
using V_Album_Server.Services.User;

namespace V_Album_Server.UseCases.Post;

public class CreatePostUseCase(
    UserRepository userRepository,
    PostRepository postRepository,
    IUnitOfWork uow,
    PostPhotoService postPhotoService)
{
    public async Task<GroupController.PostResponse> Execute(string googleSub, Guid groupUuid, string content, List<IFormFile>? photos, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        DomainPost createdPost = await postRepository.CreatePostAsync(groupUuid, me.UserUuid, content, ct);
        List<ThumbnailJob> thumbnailJobs = [];

        if (photos is not null)
        {
            int sortOrder = 1;
            foreach (IFormFile photo in photos)
            {
                ThumbnailJob thumbnailJob = await postPhotoService.AddPhotoAsync(createdPost.PostUuid, groupUuid, sortOrder, photo, ct);
                thumbnailJobs.Add(thumbnailJob);
                sortOrder++;
            }
        }

        await uow.SaveChangesAsync(ct);

        foreach (ThumbnailJob thumbnailJob in thumbnailJobs)
            await postPhotoService.EnqueueThumbnailAsync(thumbnailJob, ct);

        return new GroupController.PostResponse(groupUuid, createdPost.PostUuid);
    }
}
