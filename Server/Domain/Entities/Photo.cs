namespace Server.Domain.Entities
{
    public class Photo : EntityBase
    {
        public Guid GroupUuid { get; set; }
        public Guid PostUuid { get; set; }

        public int SortOrder { get; set; }

        public Guid? PlaceUuid { get; set; }

        public string Src { get; set; } = null!;
        public string PreviewSrc { get; set; } = null!;

        public int Width { get; set; }
        public int Height { get; set; }

        public long Size { get; set; }
        public string SrcHash { get; set; } = null!;

        public Group Group { get; set; } = null!;
        public Post Post { get; set; } = null!;
        public Place? Place { get; set; }
    }
}