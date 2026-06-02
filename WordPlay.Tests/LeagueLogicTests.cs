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

    [Fact]
    public void RankEntrants_RanksDescending_StableTiebreakByIndex()
    {
        Assert.Equal(new[] { 3, 1, 2 }, LeagueLogic.RankEntrants(new long[] { 10, 30, 20 }));
        Assert.Equal(new[] { 1, 2 }, LeagueLogic.RankEntrants(new long[] { 10, 10 })); // tie -> lower index first
    }

    [Fact]
    public void OutcomeFor_PromotesTop_DemotesBottom_HoldsMiddle()
    {
        int count = 25, div = 2;
        Assert.Equal("promoted", LeagueLogic.OutcomeFor(1, count, div));
        Assert.Equal("promoted", LeagueLogic.OutcomeFor(7, count, div));
        Assert.Equal("held", LeagueLogic.OutcomeFor(8, count, div));
        Assert.Equal("held", LeagueLogic.OutcomeFor(20, count, div));
        Assert.Equal("demoted", LeagueLogic.OutcomeFor(21, count, div));
        Assert.Equal("demoted", LeagueLogic.OutcomeFor(25, count, div));
    }

    [Fact]
    public void OutcomeFor_NoDemotionInLowestDivision()
    {
        Assert.Equal("held", LeagueLogic.OutcomeFor(25, 25, 0));
        Assert.Equal("promoted", LeagueLogic.OutcomeFor(1, 25, 0));
    }

    [Fact]
    public void DivisionAfter_ClampsAndMovesByOutcome()
    {
        Assert.Equal(3, LeagueLogic.DivisionAfter(2, "promoted"));
        Assert.Equal(4, LeagueLogic.DivisionAfter(4, "promoted")); // capped at top
        Assert.Equal(1, LeagueLogic.DivisionAfter(2, "demoted"));
        Assert.Equal(0, LeagueLogic.DivisionAfter(0, "demoted"));  // floored
        Assert.Equal(2, LeagueLogic.DivisionAfter(2, "held"));
    }

    [Fact]
    public void DivisionName_CoversAllFive()
    {
        Assert.Equal("Clover", LeagueLogic.DivisionName(0));
        Assert.Equal("Queen's Court", LeagueLogic.DivisionName(4));
        Assert.Equal("Clover", LeagueLogic.DivisionName(99)); // out of range -> clamp to 0
    }

    [Fact]
    public void RewardFor_ScalesByRank_FirstGetsChampionBee()
    {
        var first = LeagueLogic.RewardFor(1, "held", 2);
        Assert.True(first.coins >= 200);
        Assert.Equal(30, first.honey);
        Assert.Equal("leaguechampion", first.beeId);

        var second = LeagueLogic.RewardFor(2, "held", 2);
        Assert.Null(second.beeId);
        Assert.True(second.coins < first.coins);

        var mid = LeagueLogic.RewardFor(10, "held", 2);
        var tail = LeagueLogic.RewardFor(20, "held", 2);
        Assert.True(mid.coins >= tail.coins);
    }

    [Fact]
    public void RewardFor_PromotionAddsBonus()
    {
        var held = LeagueLogic.RewardFor(15, "held", 1);
        var promoted = LeagueLogic.RewardFor(15, "promoted", 1);
        Assert.True(promoted.coins > held.coins);
        Assert.True(promoted.honey > held.honey);
    }
}
