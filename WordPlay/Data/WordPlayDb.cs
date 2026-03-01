using Microsoft.EntityFrameworkCore;
using WordPlay.Models;

namespace WordPlay.Data;

public class WordPlayDb : DbContext
{
    public WordPlayDb(DbContextOptions<WordPlayDb> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<RabbitAssignment> RabbitAssignments => Set<RabbitAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => new { u.Provider, u.ProviderSubject }).IsUnique();
            e.Property(u => u.DisplayName).HasMaxLength(20);
            e.Property(u => u.Provider).HasMaxLength(20);
            e.Property(u => u.ProviderSubject).HasMaxLength(256);
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.Role).HasMaxLength(10).HasDefaultValue("user");
            e.Property(u => u.ShowOnLeaderboard).HasDefaultValue(true);
        });

        modelBuilder.Entity<UserProgress>(e =>
        {
            e.HasIndex(p => p.UserId).IsUnique();
            e.HasIndex(p => p.HighestLevel);
            e.HasOne(p => p.User).WithOne().HasForeignKey<UserProgress>(p => p.UserId);
        });

        modelBuilder.Entity<RabbitAssignment>(e =>
        {
            e.HasOne(r => r.BotUser).WithMany().HasForeignKey(r => r.BotUserId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(r => r.TargetUser).WithMany().HasForeignKey(r => r.TargetUserId).OnDelete(DeleteBehavior.NoAction);
            e.HasIndex(r => new { r.TargetUserId, r.IsActive });
        });
    }
}
