using System;
using System.Collections.Generic;
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

    public virtual DbSet<Photo> Photos { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<World> Worlds { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8_general_ci")
            .HasCharSet("utf8");

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.GroupUuid).HasName("PRIMARY");

            entity
                .ToTable("groups")
                .HasCharSet("utf8mb4")
                .UseCollation("utf8mb4_general_ci");

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
            entity.Property(e => e.Pic)
                .HasMaxLength(64)
                .HasColumnName("pic");
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

            entity
                .ToTable("member")
                .HasCharSet("utf8mb4")
                .UseCollation("utf8mb4_general_ci");

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
                .HasColumnType("enum('Owner','Admin','Member')")
                .HasColumnName("role");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.GroupUu).WithMany(p => p.Members)
                .HasForeignKey(d => d.GroupUuid)
                .HasConstraintName("FK_member_groups");

            entity.HasOne(d => d.UserUu).WithMany(p => p.Members)
                .HasForeignKey(d => d.UserUuid)
                .HasConstraintName("FK_member_user");
        });

        modelBuilder.Entity<Photo>(entity =>
        {
            entity.HasKey(e => e.PhotoUuid).HasName("PRIMARY");

            entity
                .ToTable("photo")
                .HasCharSet("utf8mb4")
                .UseCollation("utf8mb4_general_ci");

            entity.HasIndex(e => e.WorldUuid, "FK_photo_world");

            entity.HasIndex(e => e.Hash, "중복 탐지용 인덱스");

            entity.HasIndex(e => new { e.PostUuid, e.SortOrder }, "포스트에 포함된 사진 인덱스");

            entity.Property(e => e.PhotoUuid).HasColumnName("photo_uuid");
            entity.Property(e => e.Format)
                .HasMaxLength(5)
                .HasColumnName("format");
            entity.Property(e => e.Hash)
                .HasMaxLength(32)
                .IsFixedLength()
                .HasColumnName("hash");
            entity.Property(e => e.Height)
                .HasColumnType("int(11)")
                .HasColumnName("height");
            entity.Property(e => e.PostUuid).HasColumnName("post_uuid");
            entity.Property(e => e.Size)
                .HasColumnType("bigint(20)")
                .HasColumnName("size");
            entity.Property(e => e.SortOrder)
                .HasColumnType("int(11)")
                .HasColumnName("sort_order");
            entity.Property(e => e.Width)
                .HasColumnType("int(11)")
                .HasColumnName("width");
            entity.Property(e => e.WorldUuid).HasColumnName("world_uuid");

            entity.HasOne(d => d.PostUu).WithMany(p => p.Photos)
                .HasForeignKey(d => d.PostUuid)
                .HasConstraintName("FK_photo_post");

            entity.HasOne(d => d.WorldUu).WithMany(p => p.Photos)
                .HasForeignKey(d => d.WorldUuid)
                .HasConstraintName("FK_photo_world");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.PostUuid).HasName("PRIMARY");

            entity
                .ToTable("post")
                .HasCharSet("utf8mb4")
                .UseCollation("utf8mb4_general_ci");

            entity.HasIndex(e => e.UserUuid, "FK_post_user");

            entity.HasIndex(e => new { e.GroupUuid, e.DeletedAt, e.CreatedAt }, "그룹별 시간순 포스트 인덱스");

            entity.Property(e => e.PostUuid).HasColumnName("post_uuid");
            entity.Property(e => e.Content)
                .HasColumnType("mediumtext")
                .HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.GroupUuid).HasColumnName("group_uuid");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserUuid).HasColumnName("user_uuid");

            entity.HasOne(d => d.GroupUu).WithMany(p => p.Posts)
                .HasForeignKey(d => d.GroupUuid)
                .HasConstraintName("FK_post_groups");

            entity.HasOne(d => d.UserUu).WithMany(p => p.Posts)
                .HasForeignKey(d => d.UserUuid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_post_user");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserUuid).HasName("PRIMARY");

            entity
                .ToTable("user")
                .HasCharSet("utf8mb4")
                .UseCollation("utf8mb4_general_ci");

            entity.HasIndex(e => e.GoogleSub, "google_id_token_UNIQUE").IsUnique();

            entity.Property(e => e.UserUuid).HasColumnName("user_uuid");
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
        });

        modelBuilder.Entity<World>(entity =>
        {
            entity.HasKey(e => e.WorldUuid).HasName("PRIMARY");

            entity
                .ToTable("world")
                .HasCharSet("utf8mb4")
                .UseCollation("utf8mb4_general_ci");

            entity.Property(e => e.WorldUuid)
                .HasDefaultValueSql("''")
                .HasColumnName("world_uuid");
            entity.Property(e => e.Name)
                .HasMaxLength(256)
                .HasColumnName("name");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
