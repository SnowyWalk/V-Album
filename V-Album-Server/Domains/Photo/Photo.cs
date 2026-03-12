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
    
    public Photo(Guid photoPhotoUuid, Guid photoPostUuid, int sortOrder, Guid? worldUuid, int width, int height, long size, byte[] photoHash, string? format)
    {
        PhotoUuid = photoPhotoUuid;
        PostUuid = photoPostUuid;
        SortOrder = sortOrder;
        WorldUuid = worldUuid;
        Width = width;
        Height = height;
        Size = size;
        Hash = photoHash;
        Format = format;
    }
}