using Microsoft.EntityFrameworkCore;

namespace Supatable.Infrastructure.Persistence.Ef;

public sealed class SupatableDbContext : DbContext
{
    public SupatableDbContext(DbContextOptions<SupatableDbContext> options) : base(options) { }

    public DbSet<UserRow> Users => Set<UserRow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserRow>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).IsRequired();
            e.Property(x => x.FullName).IsRequired();
            e.Property(x => x.Role).IsRequired();
            e.Property(x => x.CreatedAt).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();

            e.HasData(
                new UserRow
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Email = "john@example.com",
                    FullName = "John Smith",
                    Role = "Admin",
                    CreatedAt = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc)
                },
                new UserRow
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Email = "alice@example.com",
                    FullName = "Alice Johnson",
                    Role = "User",
                    CreatedAt = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        });
    }
}

public sealed class UserRow
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Role { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}