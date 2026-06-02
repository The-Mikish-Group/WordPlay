# Weekly Leagues 3A — Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the backend Weekly Leagues engine — weekly League-XP cohorts across a 5-division ladder, filled with virtual bots, with lazy settlement (promote/demote + rewards) and a `/api/league/me` + `/api/league/claim` API.

**Architecture:** Pure ranking/reward/week-math logic lives in a dependency-free `WordPlay.LeagueLogic` static class, unit-tested with a new `WordPlay.Tests` xUnit project. EF orchestration (cohort assignment, bot fill, lazy settlement, weekly rollover) lives in `WordPlay.Services.LeagueEngine` static methods, wired into the existing `POST /api/progress` (XP ingest) and two new league endpoints. Mirrors the codebase's existing lazy `RollOverStaleMonths` / Central-time patterns.

**Tech Stack:** ASP.NET minimal APIs (net10), EF Core 10 / SQL Server, xUnit. `dotnet ef` is available. JWT auth via `uid`/`role` claims.

**Spec:** `docs/plans/2026-06-01-weekly-leagues-3a-engine-design.md`

**Scope:** Backend only. The client Leagues screen, rail button, XP-earning hooks, and the `leaguechampion` Collection bee are Slice 3B. Until 3B ships earning hooks, real weekly XP is 0; 3A is exercised by direct `lxp` values + the verification script.

---

## File Structure

**Create:**
- `WordPlay/LeagueLogic.cs` — pure static logic (week math, ranking, outcomes, rewards, bot XP/identity). No EF, no DI.
- `WordPlay/Models/LeagueCohort.cs`, `WordPlay/Models/LeagueBotMember.cs`, `WordPlay/Models/LeagueResult.cs` — entities.
- `WordPlay/Services/LeagueEngine.cs` — EF orchestration (`MaintainLeague`, `AssignToCohort`, `CreateBots`, `SettleCohort`).
- `WordPlay.Tests/WordPlay.Tests.csproj` + `WordPlay.Tests/LeagueLogicTests.cs` — xUnit unit tests (repo's first C# test project).
- `WordPlay/Migrations/<stamp>_AddLeagues.cs` (+ `.Designer.cs`) — EF-generated.
- `docs/sql/AddLeagues.sql` — generated idempotent script for manual sqlcmd apply.

**Modify:**
- `WordPlay/Models/UserProgress.cs` — 5 new fields.
- `WordPlay/Data/WordPlayDb.cs` — 3 DbSets + index config.
- `WordPlay/Program.cs` — `lxp` ingest in `POST /api/progress`; call `LeagueEngine.MaintainLeague`; add `GET /api/league/me` + `POST /api/league/claim`.

**Conventions:** no `Co-Authored-By`; run from repo root `D:\Projects\Repos\WordPlay`. Build: `dotnet build WordPlay/WordPlay.csproj`. Tests: `dotnet test WordPlay.Tests/WordPlay.Tests.csproj`. Migrations are generated but the SQL is applied **manually via sqlcmd** (do not auto-migrate).

---

## Task 1: Scaffold the xUnit test project

**Files:**
- Create: `WordPlay.Tests/` (via template)

- [ ] **Step 1: Create the project and reference the app**

Run:
```bash
dotnet new xunit -o WordPlay.Tests
dotnet add WordPlay.Tests/WordPlay.Tests.csproj reference WordPlay/WordPlay.csproj
```

- [ ] **Step 2: Pin the TFM to net10.0**

Ensure `WordPlay.Tests/WordPlay.Tests.csproj` has `<TargetFramework>net10.0</TargetFramework>` (edit if the template chose another). Leave `<Nullable>enable</Nullable>` as the template sets it.

- [ ] **Step 3: Replace the template test** with a trivial sanity test — overwrite `WordPlay.Tests/UnitTest1.cs`:

```csharp
namespace WordPlay.Tests;

public class SanityTests
{
    [Fact]
    public void Harness_Works() => Assert.Equal(4, 2 + 2);
}
```

- [ ] **Step 4: Run to verify the harness**

Run: `dotnet test WordPlay.Tests/WordPlay.Tests.csproj`
Expected: build succeeds, 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add WordPlay.Tests/
git commit -m "test: scaffold WordPlay.Tests xUnit project"
```

---

## Task 2: `LeagueLogic` — week math (TDD)

**Files:**
- Create: `WordPlay/LeagueLogic.cs`
- Modify: `WordPlay.Tests/LeagueLogicTests.cs` (create)

- [ ] **Step 1: Write the failing tests** — create `WordPlay.Tests/LeagueLogicTests.cs`:

```csharp
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
```

- [ ] **Step 2: Run to verify failure**

Run: `dotnet test WordPlay.Tests/WordPlay.Tests.csproj`
Expected: build FAILS — `LeagueLogic` does not exist.

- [ ] **Step 3: Create `WordPlay/LeagueLogic.cs`:**

```csharp
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
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test WordPlay.Tests/WordPlay.Tests.csproj`
Expected: PASS (week-math tests + sanity).

- [ ] **Step 5: Commit**

```bash
git add WordPlay/LeagueLogic.cs WordPlay.Tests/LeagueLogicTests.cs
git commit -m "feat: league week-math logic"
```

---

## Task 3: `LeagueLogic` — ranking, outcomes, division moves (TDD)

**Files:**
- Modify: `WordPlay/LeagueLogic.cs`, `WordPlay.Tests/LeagueLogicTests.cs`

- [ ] **Step 1: Add failing tests** — append to `LeagueLogicTests.cs`:

```csharp
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
```

- [ ] **Step 2: Run to verify failure**

Run: `dotnet test WordPlay.Tests/WordPlay.Tests.csproj`
Expected: build FAILS — those methods don't exist.

- [ ] **Step 3: Implement** — add to `LeagueLogic.cs` (inside the class):

```csharp
    private static readonly string[] DivisionNames =
        { "Clover", "Blossom", "Sunflower", "Amber", "Queen's Court" };

    public static string DivisionName(int division) =>
        DivisionNames[Math.Clamp(division, 0, Divisions - 1)];

    /// <summary>1-based ranks, highest score = rank 1, stable tiebreak by original index.</summary>
    public static int[] RankEntrants(IReadOnlyList<long> scores)
    {
        var order = Enumerable.Range(0, scores.Count)
            .OrderByDescending(i => scores[i]).ThenBy(i => i).ToArray();
        var ranks = new int[scores.Count];
        for (int r = 0; r < order.Length; r++) ranks[order[r]] = r + 1;
        return ranks;
    }

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
```

- [ ] **Step 4: Run to verify pass**

Run: `dotnet test WordPlay.Tests/WordPlay.Tests.csproj`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/LeagueLogic.cs WordPlay.Tests/LeagueLogicTests.cs
git commit -m "feat: league ranking, outcomes, division moves"
```

---

## Task 4: `LeagueLogic` — rewards (TDD)

**Files:**
- Modify: `WordPlay/LeagueLogic.cs`, `WordPlay.Tests/LeagueLogicTests.cs`

> Design note: the spec said the champion bee is a "chance" (e.g. 25%). For determinism + testability this plan awards the `leaguechampion` bee to **1st place, guaranteed** (a clear, predictable prize). Probability can be re-introduced later by seeding. Flagged in the spec's open questions.

- [ ] **Step 1: Add failing tests** — append:

```csharp
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
```

- [ ] **Step 2: Run to verify failure** — `dotnet test ...` → build FAILS (`RewardFor` missing).

- [ ] **Step 3: Implement** — add to `LeagueLogic.cs`:

```csharp
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
```

- [ ] **Step 4: Run to verify pass** — `dotnet test ...` → PASS.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/LeagueLogic.cs WordPlay.Tests/LeagueLogicTests.cs
git commit -m "feat: league reward tiers"
```

---

## Task 5: `LeagueLogic` — bot XP + identity (TDD)

**Files:**
- Modify: `WordPlay/LeagueLogic.cs`, `WordPlay.Tests/LeagueLogicTests.cs`

- [ ] **Step 1: Add failing tests** — append:

```csharp
    [Fact]
    public void BotWeeklyXp_IsDeterministic_AndScalesWithDivision()
    {
        Assert.Equal(LeagueLogic.BotWeeklyXp(2, 123), LeagueLogic.BotWeeklyXp(2, 123)); // deterministic
        // Same seed -> higher division yields strictly higher XP (monotonic).
        Assert.True(LeagueLogic.BotWeeklyXp(0, 55) < LeagueLogic.BotWeeklyXp(1, 55));
        Assert.True(LeagueLogic.BotWeeklyXp(1, 55) < LeagueLogic.BotWeeklyXp(4, 55));
    }

    [Fact]
    public void BotRamped_ScalesByFraction_Clamped()
    {
        Assert.Equal(0, LeagueLogic.BotRamped(1000, 0.0));
        Assert.Equal(500, LeagueLogic.BotRamped(1000, 0.5));
        Assert.Equal(1000, LeagueLogic.BotRamped(1000, 1.5)); // clamped
    }

    [Fact]
    public void BotName_AndAvatar_AreDeterministicAndWellFormed()
    {
        Assert.Equal(LeagueLogic.BotName(7), LeagueLogic.BotName(7));
        Assert.False(string.IsNullOrEmpty(LeagueLogic.BotName(7)));
        Assert.StartsWith("emoji:", LeagueLogic.BotAvatar(7));
    }
```

- [ ] **Step 2: Run to verify failure** — `dotnet test ...` → build FAILS.

- [ ] **Step 3: Implement** — add to `LeagueLogic.cs`:

```csharp
    private static readonly string[] BotNames =
    {
        "Bramble","Pippin","Hazel","Maple","Tansy","Rowan","Sorrel","Dahlia",
        "Fennel","Juniper","Marlow","Wren","Bracken","Posy","Linden","Cricket",
        "Bromley","Saffron","Thatch","Nettle","Quill","Burrow","Comfrey","Sage"
    };
    private static readonly string[] BotAvatars =
        { "dog","cat","fox","bear","panda","owl","frog","lion","monkey","octopus","butterfly","dragon" };

    private static int Mod(int a, int m) => ((a % m) + m) % m;

    public static int BotWeeklyXp(int division, int seed)
    {
        var rng = new Random(seed);
        double lo = BotXpBase * (division + 1);
        double hi = lo * 1.8;
        return (int)Math.Round(lo + rng.NextDouble() * (hi - lo));
    }

    public static int BotRamped(int weeklyXp, double fraction) =>
        (int)Math.Round(weeklyXp * Math.Clamp(fraction, 0.0, 1.0));

    public static string BotName(int seed) => BotNames[Mod(seed, BotNames.Length)];
    public static string BotAvatar(int seed) => "emoji:" + BotAvatars[Mod(seed * 7, BotAvatars.Length)];
```

- [ ] **Step 4: Run to verify pass** — `dotnet test ...` → PASS (all LeagueLogic tests).

- [ ] **Step 5: Commit**

```bash
git add WordPlay/LeagueLogic.cs WordPlay.Tests/LeagueLogicTests.cs
git commit -m "feat: league bot xp and identity"
```

---

## Task 6: Entities + UserProgress fields + DbContext

**Files:**
- Create: `WordPlay/Models/LeagueCohort.cs`, `WordPlay/Models/LeagueBotMember.cs`, `WordPlay/Models/LeagueResult.cs`
- Modify: `WordPlay/Models/UserProgress.cs`, `WordPlay/Data/WordPlayDb.cs`

- [ ] **Step 1: Create `WordPlay/Models/LeagueCohort.cs`:**

```csharp
namespace WordPlay.Models;

public class LeagueCohort
{
    public int Id { get; set; }
    public required string WeekId { get; set; }   // "2026-W23"
    public int Division { get; set; }             // 0..4
    public DateTime? SettledAt { get; set; }      // null = not settled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

- [ ] **Step 2: Create `WordPlay/Models/LeagueBotMember.cs`:**

```csharp
namespace WordPlay.Models;

public class LeagueBotMember
{
    public int Id { get; set; }
    public int CohortId { get; set; }
    public required string Name { get; set; }
    public string? AvatarData { get; set; }       // "emoji:<key>"
    public int WeeklyXp { get; set; }             // full-week target
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

- [ ] **Step 3: Create `WordPlay/Models/LeagueResult.cs`:**

```csharp
namespace WordPlay.Models;

public class LeagueResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string WeekId { get; set; }
    public int Division { get; set; }
    public int Rank { get; set; }
    public required string Outcome { get; set; }  // promoted | held | demoted
    public int RewardCoins { get; set; }
    public int RewardHoney { get; set; }
    public string? RewardBeeId { get; set; }
    public bool Claimed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

- [ ] **Step 4: Add fields to `WordPlay/Models/UserProgress.cs`** — insert before `UpdatedAt`:

```csharp
    public int LeagueDivision { get; set; }       // 0..4, persists across weeks
    public int LeagueXp { get; set; }             // lifetime monotonic (client "lxp")
    public int WeeklyXpStart { get; set; }        // LeagueXp at start of CurrentWeek
    public string CurrentWeek { get; set; } = ""; // "2026-W23"
    public int CohortId { get; set; }             // this week's cohort (0 = none)
```

- [ ] **Step 5: Register in `WordPlay/Data/WordPlayDb.cs`** — add DbSets after the existing ones:

```csharp
    public DbSet<LeagueCohort> LeagueCohorts => Set<LeagueCohort>();
    public DbSet<LeagueBotMember> LeagueBotMembers => Set<LeagueBotMember>();
    public DbSet<LeagueResult> LeagueResults => Set<LeagueResult>();
```

And add config inside `OnModelCreating` (after the `WordAuditLog` block):

```csharp
        modelBuilder.Entity<LeagueCohort>(e =>
        {
            e.Property(c => c.WeekId).HasMaxLength(10);
            e.HasIndex(c => new { c.WeekId, c.Division });
        });

        modelBuilder.Entity<LeagueBotMember>(e =>
        {
            e.Property(b => b.Name).HasMaxLength(40);
            e.Property(b => b.AvatarData).HasMaxLength(64);
            e.HasIndex(b => b.CohortId);
        });

        modelBuilder.Entity<LeagueResult>(e =>
        {
            e.Property(r => r.WeekId).HasMaxLength(10);
            e.Property(r => r.Outcome).HasMaxLength(10);
            e.Property(r => r.RewardBeeId).HasMaxLength(40);
            e.HasIndex(r => new { r.UserId, r.Claimed });
        });
```

- [ ] **Step 6: Verify it builds**

Run: `dotnet build WordPlay/WordPlay.csproj`
Expected: build succeeds (0 errors). `dotnet test WordPlay.Tests/WordPlay.Tests.csproj` still green.

- [ ] **Step 7: Commit**

```bash
git add WordPlay/Models/ WordPlay/Data/WordPlayDb.cs
git commit -m "feat: league entities and userprogress fields"
```

---

## Task 7: EF migration + SQL script

**Files:**
- Create: `WordPlay/Migrations/<stamp>_AddLeagues.cs` (+ Designer), `docs/sql/AddLeagues.sql`

- [ ] **Step 1: Generate the migration**

Run: `dotnet ef migrations add AddLeagues -p WordPlay/WordPlay.csproj -s WordPlay/WordPlay.csproj`
Expected: creates `WordPlay/Migrations/<timestamp>_AddLeagues.cs` + `.Designer.cs` and updates `WordPlayDbModelSnapshot.cs`.

- [ ] **Step 2: Sanity-check the migration** — open the generated `_AddLeagues.cs` and confirm its `Up()` adds: 5 columns to `UserProgress` (LeagueDivision, LeagueXp, WeeklyXpStart, CurrentWeek, CohortId — non-null with defaults 0 / ""), and creates `LeagueCohorts`, `LeagueBotMembers`, `LeagueResults` tables with the indexes. If `CurrentWeek` is generated nullable, that's fine (the model default `""` applies for new rows; existing rows get NULL→treated as stale and re-assigned). Do NOT hand-edit unless a column is missing.

- [ ] **Step 3: Generate the idempotent SQL script for manual apply**

Run:
```bash
mkdir -p docs/sql
dotnet ef migrations script AddWordAuditLog AddLeagues -p WordPlay/WordPlay.csproj -s WordPlay/WordPlay.csproj -i -o docs/sql/AddLeagues.sql
```
(`AddWordAuditLog` is the previous migration; `-i` makes it idempotent.) Expected: `docs/sql/AddLeagues.sql` written.

- [ ] **Step 4: Verify build still succeeds**

Run: `dotnet build WordPlay/WordPlay.csproj`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/Migrations/ docs/sql/AddLeagues.sql
git commit -m "feat: AddLeagues migration and manual-apply SQL"
```

> NOTE for deploy (not a code step): the user applies `docs/sql/AddLeagues.sql` to the database via sqlcmd before the new build serves traffic.

---

## Task 8: `LeagueEngine` — assignment, bots, maintain (no settlement yet)

**Files:**
- Create: `WordPlay/Services/LeagueEngine.cs`

- [ ] **Step 1: Create `WordPlay/Services/LeagueEngine.cs`:**

```csharp
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
```

- [ ] **Step 2: Verify build**

Run: `dotnet build WordPlay/WordPlay.csproj`
Expected: 0 errors (the placeholder `SettleCohort` compiles).

- [ ] **Step 3: Commit**

```bash
git add WordPlay/Services/LeagueEngine.cs
git commit -m "feat: league cohort assignment and bot fill"
```

---

## Task 9: `LeagueEngine.SettleCohort`

**Files:**
- Modify: `WordPlay/Services/LeagueEngine.cs`

- [ ] **Step 1: Replace the placeholder `SettleCohort`** with the real implementation:

```csharp
    /// <summary>Rank real members + bots, apply promote/demote + rewards. Idempotent via SettledAt.</summary>
    private static async Task SettleCohort(WordPlayDb db, LeagueCohort cohort)
    {
        if (cohort.SettledAt != null) return;

        var reals = await db.UserProgress.Where(p => p.CohortId == cohort.Id).ToListAsync();
        var bots = await db.LeagueBotMembers.Where(b => b.CohortId == cohort.Id).ToListAsync();

        // Combined score list: reals first, then bots (track how many reals lead).
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
```

Remove the old placeholder line `private static Task SettleCohort(...) => Task.CompletedTask;`.

- [ ] **Step 2: Verify build**

Run: `dotnet build WordPlay/WordPlay.csproj`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add WordPlay/Services/LeagueEngine.cs
git commit -m "feat: league cohort settlement"
```

---

## Task 10: `lxp` ingestion in `POST /api/progress`

**Files:**
- Modify: `WordPlay/Program.cs` (the `POST /api/progress` handler)

- [ ] **Step 1: Extract `lxp` alongside the other denormalized fields.** In `POST /api/progress`, find:
```csharp
    if (progressEl.TryGetProperty("tce", out var tceEl)) totalCoinsEarned = tceEl.GetInt32();
```
Add right after it:
```csharp
    int leagueXp = 0;
    if (progressEl.TryGetProperty("lxp", out var lxpEl)) leagueXp = lxpEl.GetInt32();
```
(Declare `leagueXp` near `highestLevel`/`levelsCompleted`/`totalCoinsEarned` if the compiler prefers — placing it here is fine since those are also locals.)

- [ ] **Step 2: Ratchet + weekly cap + store, just before `progress.UpdatedAt = DateTime.UtcNow;`.** Find:
```csharp
    progress.ProgressJson = progressJson;
    progress.HighestLevel = highestLevel;
    progress.LevelsCompleted = levelsCompleted;
    progress.TotalCoinsEarned = totalCoinsEarned;
    progress.UpdatedAt = DateTime.UtcNow;
```
Insert BEFORE `progress.UpdatedAt = DateTime.UtcNow;`:
```csharp
    // League XP: monotonic ratchet + weekly sanity cap.
    if (leagueXp < progress.LeagueXp) leagueXp = progress.LeagueXp;
    var weeklyCapCeiling = progress.WeeklyXpStart + WordPlay.LeagueLogic.MaxWeeklyXp;
    if (leagueXp > weeklyCapCeiling && weeklyCapCeiling >= progress.LeagueXp)
        leagueXp = weeklyCapCeiling;
    progress.LeagueXp = leagueXp;
```

- [ ] **Step 3: Run league maintenance after the main save.** Find the rabbit-pacing block's end:
```csharp
    if (rabbitAssignments.Count > 0)
        await db.SaveChangesAsync();

    return Results.Ok(new { updatedAt = progress.UpdatedAt });
```
Insert BEFORE the `return`:
```csharp
    await WordPlay.Services.LeagueEngine.MaintainLeague(db, userId.Value);
```

- [ ] **Step 4: Verify build**

Run: `dotnet build WordPlay/WordPlay.csproj`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: ingest league xp and maintain league on progress sync"
```

---

## Task 11: League API endpoints

**Files:**
- Modify: `WordPlay/Program.cs`

- [ ] **Step 1: Add the two endpoints.** Insert after the existing `GET /api/leaderboard` block (after its closing `});`):

```csharp
// ============================================================
// Weekly Leagues
// ============================================================

app.MapGet("/api/league/me", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    await WordPlay.Services.LeagueEngine.MaintainLeague(db, userId.Value);

    var progress = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == userId);
    if (progress == null || progress.CohortId == 0)
        return Results.Ok(new { ready = false });

    var cohort = await db.LeagueCohorts.FirstOrDefaultAsync(c => c.Id == progress.CohortId);
    if (cohort == null) return Results.Ok(new { ready = false });

    var nowCentral = WordPlay.Services.LeagueEngine.NowCentral();
    var fraction = WordPlay.LeagueLogic.WeekFraction(nowCentral);
    var weekEnd = WordPlay.LeagueLogic.WeekStart(nowCentral).AddDays(7);
    var secondsToReset = (int)Math.Max(0, (weekEnd - nowCentral).TotalSeconds);

    var reals = await db.UserProgress
        .Where(p => p.CohortId == cohort.Id)
        .Join(db.Users, p => p.UserId, u => u.Id, (p, u) => new
        {
            userId = p.UserId,
            name = u.DisplayName,
            avatar = u.AvatarData,
            weeklyXp = p.LeagueXp - p.WeeklyXpStart,
        })
        .ToListAsync();

    var bots = await db.LeagueBotMembers
        .Where(b => b.CohortId == cohort.Id)
        .Select(b => new { b.Name, b.AvatarData, b.WeeklyXp })
        .ToListAsync();

    var standings = reals
        .Select(r => new { name = r.name ?? "Player", avatar = r.avatar, weeklyXp = Math.Max(0, r.weeklyXp), isYou = r.userId == userId, userId = (int?)r.userId })
        .Concat(bots.Select(b => new { name = b.Name, avatar = b.AvatarData, weeklyXp = WordPlay.LeagueLogic.BotRamped(b.WeeklyXp, fraction), isYou = false, userId = (int?)null }))
        .OrderByDescending(s => s.weeklyXp)
        .ToList();

    int yourRank = 0, yourXp = 0;
    for (int i = 0; i < standings.Count; i++)
        if (standings[i].isYou) { yourRank = i + 1; yourXp = standings[i].weeklyXp; }

    var pending = await db.LeagueResults
        .Where(r => r.UserId == userId && !r.Claimed)
        .Select(r => new { r.WeekId, r.Division, r.Rank, r.Outcome, r.RewardCoins, r.RewardHoney, r.RewardBeeId })
        .ToListAsync();

    return Results.Ok(new
    {
        ready = true,
        division = cohort.Division,
        divisionName = WordPlay.LeagueLogic.DivisionName(cohort.Division),
        weekId = cohort.WeekId,
        secondsToReset,
        you = new { weeklyXp = yourXp, rank = yourRank },
        promoteRank = WordPlay.LeagueLogic.PromoteCount,
        demoteRank = standings.Count - WordPlay.LeagueLogic.DemoteCount + 1,
        standings = standings.Select(s => new { s.name, s.avatar, s.weeklyXp, s.isYou }).ToList(),
        pendingResults = pending,
    });
}).RequireAuthorization();

app.MapPost("/api/league/claim", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var unclaimed = await db.LeagueResults.Where(r => r.UserId == userId && !r.Claimed).ToListAsync();
    foreach (var r in unclaimed) r.Claimed = true;
    await db.SaveChangesAsync();
    return Results.Ok(new { claimed = unclaimed.Count });
}).RequireAuthorization();
```

- [ ] **Step 2: Verify build**

Run: `dotnet build WordPlay/WordPlay.csproj`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: league me and claim endpoints"
```

---

## Task 12: Verification pass

- [ ] **Step 1: Unit tests + build**

Run: `dotnet test WordPlay.Tests/WordPlay.Tests.csproj` → all green.
Run: `dotnet build WordPlay/WordPlay.csproj` → 0 errors, 0 warnings introduced by this work.

- [ ] **Step 2: Confirm full logic coverage.** The xUnit suite from Step 1 is the authoritative check of the ranking → outcome → division → reward → bot-XP → week-math chain. Confirm the suite includes a test for every public `LeagueLogic` member (week math, `RankEntrants`, `OutcomeFor`, `DivisionAfter`, `DivisionName`, `RewardFor`, `BotWeeklyXp`, `BotRamped`, `BotName`, `BotAvatar`). If any is untested, add a test before proceeding.

- [ ] **Step 3: API verification (requires a running server + DB).** This is the integration check the user runs (or the agent, if a dev DB + `docs/sql/AddLeagues.sql` is applied). Document the sequence; do not block the plan on a live DB:
  1. Apply `docs/sql/AddLeagues.sql` to the dev DB via sqlcmd.
  2. `dotnet run --project WordPlay` (dev), obtain two JWTs (sign in two test accounts; or mint via `AuthService.IssueJwt` in a scratch endpoint).
  3. `POST /api/progress` for user A with `{"progress":{"v":8,"hl":...,"tce":...,"lxp":1200}}`; for user B with `lxp:800`. Confirm 200.
  4. `GET /api/league/me` for A: expect `ready:true`, division 0 (Clover), a 25-entry `standings` list (A, B, and 23 bots), A's `weeklyXp` ≈ 1200, a `rank`, `secondsToReset` > 0.
  5. Simulate a week rollover (advance the server clock, or temporarily hard-code `NowWeek()` to the next week in a scratch build): `GET /api/league/me` again → the prior cohort settles, A & B get `pendingResults` with rank/outcome/rewards, and A is re-assigned to a fresh cohort with `weeklyXp` reset to 0.
  6. `POST /api/league/claim` for A → `{claimed: N}`; a second `GET /api/league/me` shows empty `pendingResults`.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: league engine verification adjustments"
```

---

## Notes / deferred to Slice 3B

- Client Leagues screen, left-rail Leagues button, the XP-earning hooks that accumulate `state.leagueXp` and send it as `lxp`, the reward/promotion celebration, and adding the `leaguechampion` bee (id already emitted by 3A) to the Collection registry + art.
- Tuning: `MaxWeeklyXp`, `BotXpBase` + bands, `PromoteCount`/`DemoteCount`, reward values, and whether the champion bee should be probabilistic rather than guaranteed-for-1st.
- The user applies `docs/sql/AddLeagues.sql` via sqlcmd at deploy (never auto-migrate).
- No `APP_VERSION`/`CACHE_NAME` bump in 3A (no client asset changes); those bump in 3B.
