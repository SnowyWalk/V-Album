namespace V_Album_Server.Domains.Photo;

public class Photo
{
    public Guid PhotoUuid { get; }
    public Guid PostUuid { get; }
    public int SortOrder { get; }
    public Guid? WorldUuid { get; }
    public int Width { get; }
    public int Height { get; }
    public long Size { get; }
    public byte[] Hash { get; }
    public string? Format { get; }
    
    public Photo(Guid photoUuid, Guid postUuid, int sortOrder, Guid? worldUuid, int width, int height, long size, byte[] hash, string? format)
    {
        PhotoUuid = photoUuid;
        PostUuid = postUuid;
        SortOrder = sortOrder;
        WorldUuid = worldUuid;
        Width = width;
        Height = height;
        Size = size;
        Hash = hash;
        Format = format;
    }
}