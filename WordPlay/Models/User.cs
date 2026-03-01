namespace WordPlay.Models;

public class User
{
    public int Id { get; set; }
    public required string Provider { get; set; }        // "google" or "microsoft"
    public required string ProviderSubject { get; set; } // sub claim from provider
    public string? Email { get; set; }
    public string? DisplayName { get; set; }             // max 20 chars
    public bool ShowOnLeaderboard { get; set; } = true;
    public string Role { get; set; } = "user";             // "user", "admin", or "bot"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
}
