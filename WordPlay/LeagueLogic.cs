using System.Globalization;

namespace WordPlay;

/// <summary>Pure, dependency-free Weekly Leagues logic (no EF, no DI). Unit-tested.</summary>
public static class LeagueLogic
{
    public const int CohortSize = 25;
    public const int PromoteCount = 7;
    public const int DemoteCount = 5;
    public const int Divisions = 5;
    public const int MaxWeeklyXp = 50_000;
    public const int BotXpBase = 400;

    // ---- Week math (operates on Central-local DateTimes; caller converts UTC->Central) ----
    public static string WeekId(DateTime central) =>
        $"{ISOWeek.GetYear(central):D4}-W{ISOWeek.GetWeekOfYear(central):D2}";

    public static DateTime WeekStart(DateTime central) =>
        ISOWeek.ToDateTime(ISOWeek.GetYear(central), ISOWeek.GetWeekOfYear(central), DayOfWeek.Monday);

    public static double WeekFraction(DateTime central)
    {
        var elapsed = (central - WeekStart(central)).TotalSeconds;
        var total = TimeSpan.FromDays(7).TotalSeconds;
        return Math.Clamp(elapsed / total, 0.0, 1.0);
    }

    // ---- Division names ----
    private static readonly string[] DivisionNames =
        { "Clover", "Blossom", "Sunflower", "Amber", "Queen's Court" };

    public static string DivisionName(int division) =>
        division >= 0 && division < Divisions ? DivisionNames[division] : DivisionNames[0];

    // ---- Ranking ----

    /// <summary>1-based ranks, highest score = rank 1, stable tiebreak by original index.</summary>
    public static int[] RankEntrants(IReadOnlyList<long> scores)
    {
        var order = Enumerable.Range(0, scores.Count)
            .OrderByDescending(i => scores[i]).ThenBy(i => i).ToArray();
        var ranks = new int[scores.Count];
        for (int r = 0; r < order.Length; r++) ranks[order[r]] = r + 1;
        return ranks;
    }

    // ---- Outcomes and division moves ----

    public static string OutcomeFor(int rank, int count, int division)
    {
        if (rank <= PromoteCount) return "promoted";
        if (division > 0 && rank > count - DemoteCount) return "demoted";
        return "held";
    }

    public static int DivisionAfter(int division, string outcome) => outcome switch
    {
        "promoted" => Math.Min(Divisions - 1, division + 1),
        "demoted" => Math.Max(0, division - 1),
        _ => division
    };

    // ---- Rewards ----

    public static (int coins, int honey, string? beeId) RewardFor(int rank, string outcome, int division)
    {
        int coins, honey; string? bee = null;
        if (rank == 1) { coins = 200; honey = 30; bee = "leaguechampion"; }
        else if (rank == 2) { coins = 120; honey = 20; }
        else if (rank == 3) { coins = 80; honey = 15; }
        else if (rank <= 10) { coins = 40; honey = 10; }
        else { coins = 15; honey = 0; } // participation
        if (outcome == "promoted") { coins += 50; honey += 10; }
        return (coins, honey, bee);
    }
}
