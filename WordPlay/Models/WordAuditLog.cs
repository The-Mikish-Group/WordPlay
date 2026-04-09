namespace WordPlay.Models;

public class WordAuditLog
{
    public int Id { get; set; }
    public required string Word { get; set; }
    public required string Action { get; set; } // "ban", "unban", "dismiss"
    public int AdminId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User Admin { get; set; } = null!;
}
