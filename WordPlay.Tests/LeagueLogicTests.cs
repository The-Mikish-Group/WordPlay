using WordPlay;

namespace WordPlay.Tests;

public class LeagueLogicTests
{
    [Fact]
    public void WeekId_HasIsoFormat_AndIsStableWithinAWeek()
    {
        var mon = new DateTime(2026, 6, 1, 9, 0, 0);   // Monday
        var sun = new DateTime(2026, 6, 7, 23, 0, 0);  // same ISO week
        var nextMon = new DateTime(2026, 6, 8, 0, 0, 0);
        Assert.Matches(@"^\d{4}-W\d{2}$", LeagueLogic.WeekId(mon));
        Assert.Equal(LeagueLogic.WeekId(mon), LeagueLogic.WeekId(sun));
        Assert.NotEqual(LeagueLogic.WeekId(mon), LeagueLogic.WeekId(nextMon));
    }

    [Fact]
    public void WeekStart_IsMondayMidnight()
    {
        var d = new DateTime(2026, 6, 4, 15, 30, 0); // a Thursday
        var start = LeagueLogic.WeekStart(d);
        Assert.Equal(DayOfWeek.Monday, start.DayOfWeek);
        Assert.Equal(new DateTime(2026, 6, 1, 0, 0, 0), start);
    }

    [Fact]
    public void WeekFraction_IsZeroAtStart_AndClimbs()
    {
        var start = new DateTime(2026, 6, 1, 0, 0, 0);
        var mid = new DateTime(2026, 6, 4, 12, 0, 0); // ~half
        Assert.Equal(0.0, LeagueLogic.WeekFraction(start), 3);
        Assert.InRange(LeagueLogic.WeekFraction(mid), 0.45, 0.55);
    }
}
