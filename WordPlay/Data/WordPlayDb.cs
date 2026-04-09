using Microsoft.EntityFrameworkCore;
using WordPlay.Models;

namespace WordPlay.Data;

public class WordPlayDb : DbContext
{
    public WordPlayDb(DbContextOptions<WordPlayDb> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<RabbitAssignment> RabbitAssignments => Set<RabbitAssignment>();
    public DbSet<ProgressSnapshot> ProgressSnapshots => Set<ProgressSnapshot>();
    public DbSet<WordVote> WordVotes => Set<WordVote>();
    public DbSet<BannedWord> BannedWords => Set<BannedWord>();
    public DbSet<WordAuditLog> WordAuditLogs => Set<WordAuditLog>();

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
            e.Property(u => u.AvatarData).HasColumnType("nvarchar(max)");
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
            e.Property(r => r.PaceMode).HasMaxLength(10).HasDefaultValue("leading");
        });

        modelBuilder.Entity<ProgressSnapshot>(e =>
        {
            e.HasOne(s => s.User).WithMany().HasForeignKey(s => s.UserId);
            e.HasIndex(s => s.UserId);
        });

        modelBuilder.Entity<WordVote>(e =>
        {
            e.Property(v => v.Word).HasMaxLength(20);
            e.HasIndex(v => new { v.Word, v.UserId }).IsUnique();
            e.HasIndex(v => v.Word);
            e.HasOne(v => v.User).WithMany().HasForeignKey(v => v.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BannedWord>(e =>
        {
            e.Property(b => b.Word).HasMaxLength(20);
            e.HasIndex(b => b.Word).IsUnique();
            e.HasOne(b => b.BannedBy).WithMany().HasForeignKey(b => b.BannedById).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<WordAuditLog>(e =>
        {
            e.Property(a => a.Word).HasMaxLength(20);
            e.Property(a => a.Action).HasMaxLength(10);
            e.HasIndex(a => a.CreatedAt);
            e.HasOne(a => a.Admin).WithMany().HasForeignKey(a => a.AdminId).OnDelete(DeleteBehavior.NoAction);
        });
    }
}
