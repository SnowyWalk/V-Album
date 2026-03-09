using SixLabors.ImageSharp;
using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Services.User;
namespace V_Album_Server.UseCases.Post;

public class CreatePostUseCase(ThumbnailQueue thumbnailQueue, UserRepository userRepository, PostRepository postRepository)
{
    public async Task<GroupController.PostResponse> Execute(string googleSub, Guid groupUuid, string content, List<IFormFile>? photos, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        // Post 생성
        DomainPost createdPost = await postRepository.CreatePostAsync(groupUuid, me.UserUuid, content, ct);

        // 사진 처리
        await HandlePhotos(createdPost.PostUuid, groupUuid, photos);

        return new GroupController.PostResponse(groupUuid, createdPost.PostUuid);
    }

    private async Task HandlePhotos(Guid postUuid, Guid groupUuid, List<IFormFile>? images)
    {
        if (images is null)
            return;

        List<IFormFile> validImages = images.Where(IsValidImage).ToList();

        // Save original Images
        foreach (IFormFile image in validImages)
        {
            string photoUuid = Guid.NewGuid().ToString();
            string ext = GetFileExtension(image);
            string path = $"uploads/{groupUuid}/{postUuid}/{photoUuid}{ext}";
            CommonUtils.EnsureDirectoryExists(path);
            await using FileStream stream = new FileStream(path, FileMode.Create);
            await image.CopyToAsync(stream);

            // Queue to generate thumbnails
            await thumbnailQueue.EnqueueAsync(new ThumbnailJob {
                GroupUuid = groupUuid.ToString(),
                PostUuid = postUuid.ToString(),
                PhotoUuid = photoUuid,
                Format = GetFileExtension(image),
            });
        }
    }

    private string GetFileExtension(IFormFile file)
    {
        return Path.GetExtension(file.FileName);
    }

    private bool IsValidImage(IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            using var image = Image.Load(stream);
            return true;
        }
        catch
        {
            return false;
        }
    }
}