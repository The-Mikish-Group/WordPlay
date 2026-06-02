namespace WordPlay.Models;

public class LeagueBotMember
{
    public int Id { get; set; }
    public int CohortId { get; set; }
    public required string Name { get; set; }
    public string? AvatarData { get; set; }       // "emoji:<key>"
    public int WeeklyXp { get; set; }             // full-week target
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
