namespace WordPlay.Models;

public class LeagueCohort
{
    public int Id { get; set; }
    public required string WeekId { get; set; }   // "2026-W23"
    public int Division { get; set; }             // 0..4
    public DateTime? SettledAt { get; set; }      // null = not settled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
