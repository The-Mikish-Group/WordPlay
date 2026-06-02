namespace WordPlay.Models;

public class UserProgress
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string ProgressJson { get; set; } = "{}";  // full save blob
    public int HighestLevel { get; set; }              // denormalized for leaderboard
    public int LevelsCompleted { get; set; }           // denormalized
    public int MonthlyStart { get; set; }              // HighestLevel at start of current month
    public int TotalCoinsEarned { get; set; }          // lifetime coins earned (for points leaderboard)
    public int MonthlyCoinsStart { get; set; }         // TotalCoinsEarned at start of current month
    public string CurrentMonth { get; set; } = "";     // e.g. "2026-02"
    public int LeagueDivision { get; set; }       // 0..4, persists across weeks
    public int LeagueXp { get; set; }             // lifetime monotonic (client "lxp")
    public int WeeklyXpStart { get; set; }        // LeagueXp at start of CurrentWeek
    public string CurrentWeek { get; set; } = ""; // "2026-W23"
    public int CohortId { get; set; }             // this week's cohort (0 = none)
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
