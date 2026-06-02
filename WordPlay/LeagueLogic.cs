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
}
