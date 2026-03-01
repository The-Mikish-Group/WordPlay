namespace WordPlay.Models;

public class RabbitAssignment
{
    public int Id { get; set; }
    public int BotUserId { get; set; }
    public User BotUser { get; set; } = null!;
    public int TargetUserId { get; set; }
    public User TargetUser { get; set; } = null!;
    public string PaceMode { get; set; } = "leading";  // "leading" or "trailing"
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
