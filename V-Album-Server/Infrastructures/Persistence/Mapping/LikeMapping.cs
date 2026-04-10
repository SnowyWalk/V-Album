namespace V_Album_Server.Infrastructures.Persistence.Mapping;

public static class LikeMapping
{
    public static DomainLike ToDomain(this LikeEntity likeEntity)
    {
        return new DomainLike(likeEntity.UserUuid, likeEntity.PostUuid, likeEntity.CreatedAt, likeEntity.DeletedAt);
    }
}