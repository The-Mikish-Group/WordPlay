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
        // Assumes one in-flight maintain per user (sync is serialized per user) and a single
        // DbContext per request; cross-user contention on the same cohort is rare at this scale.
        // The unique LeagueResult(UserId, WeekId) index is the DB backstop against double settle.
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
            // No reload needed: `progress` is the same EF-tracked instance SettleCohort
            // updated (identity map), so its LeagueDivision is already current.
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
            // Openness is by REAL members only; bots are fillers a joining player displaces
            // (below) to keep the cohort at CohortSize.
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

    /// <summary>Rank real members + bots, apply promote/demote + rewards. Idempotent via SettledAt.</summary>
    private static async Task SettleCohort(WordPlayDb db, LeagueCohort cohort)
    {
        if (cohort.SettledAt != null) return;

        var reals = await db.UserProgress.Where(p => p.CohortId == cohort.Id).ToListAsync();
        var bots = await db.LeagueBotMembers.Where(b => b.CohortId == cohort.Id).ToListAsync();

        // Combined score list: reals first, then bots (reals occupy indices 0..reals.Count-1).
        var scores = new List<long>(reals.Count + bots.Count);
        foreach (var p in reals) scores.Add(Math.Max(0, p.LeagueXp - p.WeeklyXpStart));
        foreach (var b in bots) scores.Add(b.WeeklyXp);

        var ranks = LeagueLogic.RankEntrants(scores);
        var count = scores.Count;

        for (int i = 0; i < reals.Count; i++)
        {
            var p = reals[i];
            var rank = ranks[i];
            var outcome = LeagueLogic.OutcomeFor(rank, count, cohort.Division);
            p.LeagueDivision = LeagueLogic.DivisionAfter(cohort.Division, outcome);

            var (coins, honey, beeId) = LeagueLogic.RewardFor(rank, outcome, cohort.Division);
            db.LeagueResults.Add(new LeagueResult
            {
                UserId = p.UserId,
                WeekId = cohort.WeekId,
                Division = cohort.Division,
                Rank = rank,
                Outcome = outcome,
                RewardCoins = coins,
                RewardHoney = honey,
                RewardBeeId = beeId,
                Claimed = false,
            });
        }

        cohort.SettledAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
}
