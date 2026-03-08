namespace WordPlay.Models;

public class ProgressSnapshot
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int HighestLevel { get; set; }
    public int TotalCoinsEarned { get; set; }
    public int DifficultyTier { get; set; }
    public int DifficultyOffset { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
