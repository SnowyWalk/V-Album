using Microsoft.EntityFrameworkCore;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Group> Groups { get; set; }

    public virtual DbSet<Member> Members { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8_general_ci")
            .HasCharSet("utf8");

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.GroupUuid).HasName("PRIMARY");

            entity.ToTable("group");

            entity.HasIndex(e => e.GroupUuid, "group_uuid").IsUnique();

            entity.Property(e => e.GroupUuid).HasColumnName("group_uuid");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.Name)
                .HasMaxLength(64)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasKey(e => new { e.UserUuid, e.GroupUuid })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });

            entity.ToTable("member");

            entity.HasIndex(e => new { e.UserUuid, e.DeletedAt }, "유저가 가입한 그룹 조회용 인덱스");

            entity.HasIndex(e => new { e.GroupUuid, e.DeletedAt, e.JoinedAt }, "특정 그룹의 그룹 멤버 목록 조회용 인덱스");

            entity.Property(e => e.UserUuid).HasColumnName("user_uuid");
            entity.Property(e => e.GroupUuid).HasColumnName("group_uuid");
            entity.Property(e => e.Alias)
                .HasMaxLength(64)
                .HasColumnName("alias");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.JoinedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("joined_at");
            entity.Property(e => e.Role)
                .HasDefaultValueSql("'Member'")
                .HasColumnType("enum('Master','Manager','Member')")
                .HasColumnName("role");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("user");

            entity.HasIndex(e => e.GoogleSub, "google_id_token_UNIQUE").IsUnique();

            entity.HasIndex(e => e.Id, "id_UNIQUE").IsUnique();

            entity.HasIndex(e => e.UserUuid, "user_uuid_UNIQUE").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.GoogleSub)
                .HasMaxLength(64)
                .HasColumnName("google_sub");
            entity.Property(e => e.Nickname)
                .HasMaxLength(50)
                .HasColumnName("nickname");
            entity.Property(e => e.Pic)
                .HasMaxLength(64)
                .HasColumnName("pic");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserUuid)
                .HasDefaultValueSql("''")
                .HasColumnName("user_uuid");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
