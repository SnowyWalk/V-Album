namespace V_Album_Server.Infrastructures.Persistence.Mapping;

public static class PostMapping
{
    public static DomainPost ToDomain(this PostEntity post)
    {
        return new DomainPost(post.PostUuid, post.GroupUuid, post.UserUuid, post.Content);
    }
}