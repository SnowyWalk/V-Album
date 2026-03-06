using V_Album_Server.Controllers;
namespace V_Album_Server.UseCases.Post;

public class CreatePostUseCase
{
    public static Task<GroupController.PostResponse> Execute()
    {
        Guid TEST_postUuid = Guid.NewGuid();
        return new GroupController.PostResponse(groupUuid, TEST_postUuid);
    }
}