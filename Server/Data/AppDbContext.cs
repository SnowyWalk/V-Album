using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

namespace Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Group> Groups => Set<Group>();
        public DbSet<Member> Members => Set<Member>();
        public DbSet<Post> Posts => Set<Post>();
        public DbSet<PostTag> PostTags => Set<PostTag>();
        public DbSet<PostComment> PostComments => Set<PostComment>();
        public DbSet<Place> Places => Set<Place>();
        public DbSet<Photo> Photos => Set<Photo>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            // 전역 소프트삭제 필터: DeletedAt != null 인 레코드는 자동으로 제외
            ApplySoftDeleteQueryFilters(modelBuilder);

            base.OnModelCreating(modelBuilder);
        }

        private static void ApplySoftDeleteQueryFilters(ModelBuilder modelBuilder)
        {
            var softDeletableTypes = modelBuilder.Model
                .GetEntityTypes()
                .Where(t => typeof(ISoftDeletable).IsAssignableFrom(t.ClrType))
                .Select(t => t.ClrType)
                .ToList();

            foreach (var clrType in softDeletableTypes)
            {
                // EF.Property<DateTimeOffset?>(e, "DeletedAt") == null
                var method = typeof(AppDbContext)
                    .GetMethod(nameof(SetSoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(clrType);

                method.Invoke(null, new object[] { modelBuilder });
            }
        }

        private static void SetSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder)
            where TEntity : class, ISoftDeletable
        {
            modelBuilder.Entity<TEntity>()
                .HasQueryFilter(e => EF.Property<DateTimeOffset?>(e, nameof(ISoftDeletable.DeletedAt)) == null);
        }

        public override int SaveChanges()
        {
            TouchTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            TouchTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void TouchTimestamps()
        {
            var now = UtcClock.Now;

            foreach (var entry in ChangeTracker.Entries<EntityBase>())
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity.Uuid == Guid.Empty)
                        entry.Entity.Uuid = Guid.NewGuid();

                    entry.Entity.CreatedAt = now;
                    entry.Entity.UpdatedAt = now;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                }
            }

            // Member는 EntityBase가 아니라 별도 처리
            foreach (var entry in ChangeTracker.Entries<Member>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.JoinedAt = now;
                    entry.Entity.UpdatedAt = now;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                }
            }
        }
    }
}