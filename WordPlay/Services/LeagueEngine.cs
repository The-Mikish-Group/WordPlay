using Microsoft.EntityFrameworkCore;
using WordPlay.Data;
using WordPlay.Models;

namespace WordPlay.Services;

/// <summary>EF orchestration for Weekly Leagues. Pure logic lives in WordPlay.LeagueLogic.</summary>
public static class LeagueEngine
{
    private static readonly TimeZoneInfo CentralTz = TimeZoneInfo.FindSystemTimeZoneById(
        OperatingSystem.IsWindows() ? "Central Standard Time" : "America/Chicago");

    public static DateTime NowCentral() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, CentralTz);
    public static string NowWeek() => LeagueLogic.WeekId(NowCentral());

    /// <summary>Settle the player's prior cohort (if any) and (re)assign them for the current week.</summary>
    public static async Task MaintainLeague(WordPlayDb db, int userId)
    {
        var progress = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == userId);
        if (progress == null) return; // no progress row yet (player hasn't synced)

        var nowWeek = NowWeek();
        if (progress.CurrentWeek == nowWeek && progress.CohortId != 0) return;

        // Settle the prior cohort first (idempotent), before resetting anyone's baseline.
        if (progress.CohortId != 0 && !string.IsNullOrEmpty(progress.CurrentWeek) && progress.CurrentWeek != nowWeek)
        {
            var oldCohort = await db.LeagueCohorts.FirstOrDefaultAsync(c => c.Id == progress.CohortId);
            if (oldCohort != null && oldCohort.SettledAt == null)
                await SettleCohort(db, oldCohort);
            // Reload progress: settlement may have changed LeagueDivision.
            await db.Entry(progress).ReloadAsync();
        }

        await AssignToCohort(db, progress, nowWeek, progress.LeagueDivision);
        progress.WeeklyXpStart = progress.LeagueXp;
        progress.CurrentWeek = nowWeek;
        await db.SaveChangesAsync();
    }

    private static async Task AssignToCohort(WordPlayDb db, UserProgress progress, string weekId, int division)
    {
        // Find an open cohort (real members < CohortSize, unsettled) in this week+division.
        var candidates = await db.LeagueCohorts
            .Where(c => c.WeekId == weekId && c.Division == division && c.SettledAt == null)
            .ToListAsync();

        LeagueCohort? open = null;
        foreach (var c in candidates)
        {
            var realCount = await db.UserProgress.CountAsync(p => p.CohortId == c.Id);
            if (realCount < LeagueLogic.CohortSize) { open = c; break; }
        }

        if (open == null)
        {
            open = new LeagueCohort { WeekId = weekId, Division = division };
            db.LeagueCohorts.Add(open);
            await db.SaveChangesAsync(); // get Id
            await CreateBots(db, open, LeagueLogic.CohortSize);
        }

        progress.CohortId = open.Id;

        // Keep cohort at CohortSize: a real player displaces one bot.
        var total = await db.UserProgress.CountAsync(p => p.CohortId == open.Id)
                  + await db.LeagueBotMembers.CountAsync(b => b.CohortId == open.Id);
        if (total > LeagueLogic.CohortSize)
        {
            var bot = await db.LeagueBotMembers.FirstOrDefaultAsync(b => b.CohortId == open.Id);
            if (bot != null) db.LeagueBotMembers.Remove(bot);
        }
        await db.SaveChangesAsync();
    }

    private static async Task CreateBots(WordPlayDb db, LeagueCohort cohort, int n)
    {
        for (int i = 0; i < n; i++)
        {
            var seed = cohort.Id * 100 + i;
            db.LeagueBotMembers.Add(new LeagueBotMember
            {
                CohortId = cohort.Id,
                Name = LeagueLogic.BotName(seed),
                AvatarData = LeagueLogic.BotAvatar(seed),
                WeeklyXp = LeagueLogic.BotWeeklyXp(cohort.Division, seed),
            });
        }
        await db.SaveChangesAsync();
    }

    // SettleCohort added in the next task.
    private static Task SettleCohort(WordPlayDb db, LeagueCohort cohort) => Task.CompletedTask;
}
