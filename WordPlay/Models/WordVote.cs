namespace WordPlay.Models;

public class WordVote
{
    public int Id { get; set; }
    public required string Word { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
}
