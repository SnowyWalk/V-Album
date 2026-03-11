using SixLabors.ImageSharp;
using System.Security.Cryptography;
using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Infrastructures.Persistence.Scaffold;
using V_Album_Server.Services.User;
namespace V_Album_Server.UseCases.Post;

public class CreatePostUseCase(ThumbnailQueue thumbnailQueue, UserRepository userRepository, PostRepository postRepository, PhotoRepository photoRepository, AppDbContext dbContext)
{
    public async Task<GroupController.PostResponse> Execute(string googleSub, Guid groupUuid, string content, List<IFormFile>? photos, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        // TODO: 해당 그룹원인지 (글 작성 권한 있는지) 확인 필요

        // Post 생성
        DomainPost createdPost = await postRepository.CreatePostAsync(groupUuid, me.UserUuid, content, ct);

        // 사진 처리
        await HandlePhotos(createdPost.PostUuid, groupUuid, photos, ct);

        return new GroupController.PostResponse(groupUuid, createdPost.PostUuid);
    }

    private async Task HandlePhotos(Guid postUuid, Guid groupUuid, List<IFormFile>? images, CancellationToken ct)
    {
        if (images is null)
            return;

        int sortOrder = 1;
        foreach (IFormFile image in images)
        {
            try
            {
                string photoUuid = Guid.NewGuid().ToString();
                string ext = GetFileExtension(image);
                string path = $"uploads/{groupUuid}/{postUuid}/{photoUuid}{ext}";
                CommonUtils.EnsureDirectoryExists(path);
                await using (FileStream stream = new FileStream(path, FileMode.Create))
                {
                    await image.CopyToAsync(stream, ct);
                }

                using Image imageInfo = await Image.LoadAsync(path, ct);

                using var sha = SHA256.Create();
                await using var fs = File.OpenRead(path);
                byte[] hash = await sha.ComputeHashAsync(fs, ct);

                // TODO: worldUuid 추가 필요
                await photoRepository.AddPhotoAsync(postUuid, sortOrder, null, imageInfo.Width, imageInfo.Height, new FileInfo(path).Length, hash, ext, false, ct);

                // Queue to generate thumbnails
                await thumbnailQueue.EnqueueAsync(new ThumbnailJob {
                    GroupUuid = groupUuid.ToString(),
                    PostUuid = postUuid.ToString(),
                    PhotoUuid = photoUuid,
                    Format = GetFileExtension(image),
                });

                sortOrder++;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
        
        if (sortOrder > 1)
            await dbContext.SaveChangesAsync(ct);
    }

    private string GetFileExtension(IFormFile file)
    {
        return Path.GetExtension(file.FileName);
    }
}