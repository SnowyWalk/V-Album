public interface ISoftDeletable
{
    DateTimeOffset? DeletedAt { get; set; }
}
