namespace WordPlay.Models;

public class BannedWord
{
    public int Id { get; set; }
    public required string Word { get; set; }
    public int BannedById { get; set; }
    public DateTime BannedAt { get; set; } = DateTime.UtcNow;
    public User BannedBy { get; set; } = null!;
}
