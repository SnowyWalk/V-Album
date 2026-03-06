using SixLabors.ImageSharp;
using V_Album_Server.Controllers;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Services.User;
namespace V_Album_Server.Services.Group;

public class GroupService(UserRepository userRepository, GroupRepository groupRepository, ThumbnailQueue thumbnailQueue)
{
    public async Task<GroupController.CreateResponse> CreateGroupAsync(string googleSub, string groupName, CancellationToken ct)
    {
        DomainUser? me = await userRepository.GetUserByGoogleSub(googleSub, ct);
        if (me is null)
            throw new UserNotFoundException(googleSub);

        DomainGroup newGroup = await groupRepository.CreateGroupWithOwnerAsync(groupName, me.UserUuid, ct);
        return new GroupController.CreateResponse(newGroup);
    }

    public async Task<GroupController.PostResponse> UploadPostAsync(string googleSub, Guid groupUuid, string content, List<IFormFile> images)
    {
        
        // Handle Images
        List<IFormFile> validImages = images.Where(IsValidImage).ToList();
        foreach (IFormFile image in validImages)
        {
            await thumbnailQueue.EnqueueAsync(new ThumbnailJob {
                GroupUuid = groupUuid.ToString(),
                PostUuid = TEST_postUuid.ToString(),
                ImageUuid = Guid.NewGuid().ToString(),
                Format = GetFileExtension(image),
            });
        }

        // TODO: 
        
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