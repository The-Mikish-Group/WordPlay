namespace WordPlay.Models;

public class LeagueResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string WeekId { get; set; }
    public int Division { get; set; }
    public int Rank { get; set; }
    public required string Outcome { get; set; }  // promoted | held | demoted
    public int RewardCoins { get; set; }
    public int RewardHoney { get; set; }
    public string? RewardBeeId { get; set; }
    public bool Claimed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
