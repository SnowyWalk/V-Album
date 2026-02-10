using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.Persistence.Scaffold;

namespace V_Album_Server.Infrastructures.Persistence.Scaffold;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Auth> Auths { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8_general_ci")
            .HasCharSet("utf8");

        modelBuilder.Entity<Auth>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("auth");

            entity.HasIndex(e => e.GoogleSub, "google_id_token_UNIQUE").IsUnique();

            entity.HasIndex(e => e.Id, "id_UNIQUE").IsUnique();

            entity.HasIndex(e => e.UserUuid, "user_uuid_UNIQUE").IsUnique();

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.GoogleSub)
                .HasMaxLength(64)
                .HasColumnName("google_sub");
            entity.Property(e => e.UserUuid)
                .HasMaxLength(32)
                .HasColumnName("user_uuid");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
