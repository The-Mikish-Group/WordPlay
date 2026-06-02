# Engagement Slice 3A — Weekly Leagues Engine (backend)

**Date:** 2026-06-01
**Status:** Design approved, pending spec review
**Author:** Michael Vaughn (with Claude)
**Part of:** the engagement roadmap (Slice 1 Honeycomb + Slice 2 Bee Collection shipped). This is the backend half of Slice 3 (Weekly Leagues). The client half is **Slice 3B**.

## Context

Weekly Leagues groups players into weekly cohorts, ranks them by a fresh
**League XP** earned across all activities, and promotes/demotes them across a
5-division bee-themed ladder, with ecosystem rewards (coins + honey + a chance at
a league-exclusive bee). Cohorts are filled with AI bots so leagues feel alive
even with a small concurrent playerbase.

Agreed product decisions (brainstorming):
- **Score = League XP** (a new weekly points pool from all activities), ingested
  through the existing progress sync (client sends `lxp`, like it already sends
  `tce`). The actual XP *earning* hooks in gameplay are Slice 3B.
- **Bots fill cohorts** — implemented as lightweight **virtual** competitors
  (not real `User` rows), distinct from the existing rabbit-bot users.
- **Moderate 5-division ladder**, gentle promotion/demotion.
- **Ecosystem rewards** — coins + honey + a chance at a league-exclusive bee.
- **Lazy settlement** — mirrors the codebase's lazy `RollOverStaleMonths`; no
  background worker.

This slice is **backend-only** and fully testable via the API + unit tests on the
pure logic. Slice 3B (the client Leagues screen, rail button, XP-earning hooks,
and celebrations) is out of scope here.

### Existing backend this builds on (from `WordPlay/Program.cs`, `Data/WordPlayDb.cs`, `Models/`)
- **ASP.NET minimal APIs + EF Core / SQL Server**, JWT auth with `uid` + `role`
  claims (`GetUserId`, `GetUserRole`).
- **`UserProgress`** holds denormalized leaderboard fields (`HighestLevel`,
  `TotalCoinsEarned`) plus monthly tracking (`MonthlyStart`, `MonthlyCoinsStart`,
  `CurrentMonth`) with a **Central-Time** rollover. `CentralMonth()` and the lazy
  `RollOverStaleMonths(db)` (bulk `ExecuteUpdateAsync`) are the patterns to mirror
  weekly.
- **`POST /api/progress`** ingests the save blob, extracts denormalized fields
  (`hl`, `lc`, `tce`), applies a **ratchet** (`tce` never decreases) and **sanity
  caps**, does the monthly rollover, writes snapshots, and runs inline rabbit
  pacing. League XP ingestion slots into this same handler.
- **`GET /api/leaderboard`** ranks by monthly gain / monthly coins gain.
- **Rabbit bots**: `User.Role == "bot"` + `RabbitAssignment` pace individual
  players. League bots are a **separate, virtual** concept (no `User` rows).
- **EF migrations** exist; per project rule they are generated but **applied
  manually via sqlcmd** (never auto-migrate on publish).

## Component 1 — data model

### New fields on `UserProgress` (mirror the monthly fields)
```csharp
public int LeagueDivision { get; set; }      // 0..4, current division, persists across weeks
public int LeagueXp { get; set; }            // lifetime monotonic XP (client sends "lxp")
public int WeeklyXpStart { get; set; }       // LeagueXp at start of CurrentWeek
public string CurrentWeek { get; set; } = ""; // e.g. "2026-W23" (Central time)
public int CohortId { get; set; }            // this week's cohort (0 = none)
```
Weekly score = `LeagueXp - WeeklyXpStart`.

### New table `LeagueCohort`
```csharp
public class LeagueCohort {
    public int Id { get; set; }
    public required string WeekId { get; set; }   // "2026-W23"
    public int Division { get; set; }             // 0..4
    public DateTime? SettledAt { get; set; }      // null = not yet settled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```
Index `(WeekId, Division)`. Members are the `UserProgress` rows with
`CohortId == LeagueCohort.Id` plus the cohort's `LeagueBotMember` rows.

### New table `LeagueBotMember` (virtual competitors, ephemeral per cohort)
```csharp
public class LeagueBotMember {
    public int Id { get; set; }
    public int CohortId { get; set; }             // FK -> LeagueCohort.Id
    public required string Name { get; set; }
    public string? AvatarData { get; set; }       // "emoji:<key>"
    public int WeeklyXp { get; set; }             // full-week target score
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```
Index `(CohortId)`. Not real users; never promote/demote; regenerated each week.

### New table `LeagueResult` (settled standing + pending reward)
```csharp
public class LeagueResult {
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string WeekId { get; set; }
    public int Division { get; set; }             // division competed in
    public int Rank { get; set; }                 // 1-based, among real+bots
    public required string Outcome { get; set; }  // "promoted" | "held" | "demoted"
    public int RewardCoins { get; set; }
    public int RewardHoney { get; set; }
    public string? RewardBeeId { get; set; }      // nullable; a Collection bee id
    public bool Claimed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```
Index `(UserId, Claimed)`.

`WordPlayDb` gets `DbSet`s for the three new entities and their index config in
`OnModelCreating`.

## Component 2 — League XP ingestion (in `POST /api/progress`)

Alongside the existing `tce` handling, extract `lxp`:
```csharp
int leagueXp = 0;
if (progressEl.TryGetProperty("lxp", out var lxpEl)) leagueXp = lxpEl.GetInt32();
```
Apply, in order:
- **Ratchet:** `if (leagueXp < progress.LeagueXp) leagueXp = progress.LeagueXp;` (monotonic).
- **Weekly sanity cap:** the weekly gain `leagueXp - progress.WeeklyXpStart` is
  capped at `MAX_WEEKLY_XP` (a constant, e.g. 50_000 — tuned later) to blunt
  cheating; if exceeded, clamp `leagueXp = progress.WeeklyXpStart + MAX_WEEKLY_XP`
  (but never below the ratchet floor).
- Store `progress.LeagueXp = leagueXp`.

Then call the shared `MaintainLeague` (Component 3). No new ingestion endpoint.

## Component 3 — week timing + lazy maintenance

`CentralWeek()` helper (parallel to `CentralMonth()`), weeks starting **Monday
00:00 Central**, formatted `"yyyy-'W'ww"` using ISO week-of-year computed in the
Central time zone. A small `WeekBounds(weekId)` helper returns the week's start/end
UTC instants (for the "seconds until reset" and the bot ramp fraction).

`async Task MaintainLeague(WordPlayDb db, int userId)`:
1. Load the player's `UserProgress`. Compute `nowWeek = CentralWeek()`.
2. If `progress.CurrentWeek == nowWeek` and `CohortId != 0` → nothing to do.
3. Otherwise the player needs a (re)assignment for `nowWeek`:
   a. If `CurrentWeek` is a real prior week and `CohortId != 0`, **settle that
      cohort** (`SettleCohort`, Component 5) — idempotent.
   b. **Assign** the player to a cohort for `nowWeek` in their (possibly updated)
      `LeagueDivision` (Component 4).
   c. Set `WeeklyXpStart = LeagueXp`, `CurrentWeek = nowWeek`, `CohortId =` new id.
4. `SaveChangesAsync`.

Called from both `POST /api/progress` (after XP ingest) and `GET /api/league/me`
(before building the response). Brand-new players (no `CurrentWeek`) get assigned
to a Clover (division 0) cohort on first call.

## Component 4 — cohort assignment + bots

Constants: `COHORT_SIZE = 25`, `PROMOTE_COUNT = 7`, `DEMOTE_COUNT = 5`,
`DIVISIONS = 5`.

`AssignToCohort(db, progress, weekId, division)`:
- Find an **open** cohort: a `LeagueCohort` with this `weekId` + `division`,
  `SettledAt == null`, whose member count (`real + bot`) `< COHORT_SIZE`.
- If none, **create** a `LeagueCohort` and fill it with `COHORT_SIZE` bots
  (`LeagueBotMember` rows) via `CreateBots` below.
- Joining as a real player: if the cohort is already full of bots, **delete one
  bot** so the real player replaces it (keeps total at `COHORT_SIZE`).
- Set `progress.CohortId = cohort.Id`.

`CreateBots(division, n)` (pure logic in `LeagueLogic` + DB write of the rows):
- Names from a curated pool (e.g. friendly first names); avatars from the existing
  allowed emoji set; each bot's `WeeklyXp` = a deterministic draw from a
  **division-scaled band** (higher divisions → higher XP), e.g.
  `band(division) = [BASE * (division+1), BASE * (division+1) * 1.8]`. The
  draw uses a seeded RNG (seed from cohortId + index) so it's reproducible.

**Bot XP ramp** (display only): `GET /api/league/me` shows each bot's current XP as
`round(WeeklyXp * weekFraction)`, where `weekFraction = clamp(elapsed/total, 0, 1)`
for the current week — so standings climb believably through the week. Settlement
uses the full `WeeklyXp`.

## Component 5 — settlement (idempotent)

`async Task SettleCohort(WordPlayDb db, LeagueCohort cohort)`:
1. If `cohort.SettledAt != null` → return.
2. Gather entrants:
   - real: `UserProgress` where `CohortId == cohort.Id`; score = `LeagueXp - WeeklyXpStart`.
   - bots: `LeagueBotMember` where `CohortId == cohort.Id`; score = `WeeklyXp`.
   (Valid because re-assignment is gated on settlement → no member has reset yet.)
3. Build the combined ranking (desc by score; deterministic tiebreak by a stable
   key) and find each **real** member's 1-based rank. **Pure** `LeagueLogic.Rank`
   + `LeagueLogic.OutcomeFor(rank, count, division)`:
   - rank `<= PROMOTE_COUNT` → `promoted` (`LeagueDivision = min(DIVISIONS-1, +1)`)
   - rank `> count - DEMOTE_COUNT` → `demoted` (`LeagueDivision = max(0, -1)`),
     **except** no demotion when `division == 0`.
   - else `held`.
4. Rewards: `LeagueLogic.RewardFor(rank, outcome, division)` → `{coins, honey, beeId?}`
   (Component 6). Write a `LeagueResult` per real member.
5. `cohort.SettledAt = DateTime.UtcNow`; `SaveChangesAsync`.

Division changes are written to all real members here; each member's own reset
(new cohort + `WeeklyXpStart`) happens lazily in `MaintainLeague` when they next
sync. Bots are not promoted (ephemeral).

## Component 6 — rewards (computed at settlement; claimed client-side)

`LeagueLogic.RewardFor(rank, outcome, division)` returns small, tunable values,
e.g.:
- 1st: coins 200, honey 30, `beeId` = `"leaguechampion"` with a probability
  (e.g. 25%); 2nd–3rd: coins 120/80, honey 20/15; top-10: coins 40, honey 10;
  participation (everyone who scored > 0): coins 15.
- `promoted` adds a small bonus (coins 50, honey 10).

Rewards are **not** applied to the account server-side (the save blob is
client-authoritative). They're stored on the `LeagueResult` row; the client reads
unclaimed results via `GET /api/league/me`, applies them locally (coins, honey to
the active Quest, and—if `RewardBeeId` set—grants the bee), then calls
`POST /api/league/claim`. The `"leaguechampion"` bee is a new Collection bee added
to the registry in Slice 3B (3A only emits the id string).

## Component 7 — API

- **`GET /api/league/me`** (`RequireAuthorization`): runs `MaintainLeague`, then
  returns:
  ```jsonc
  {
    "division": 2, "divisionName": "Sunflower",
    "weekId": "2026-W23", "secondsToReset": 432000,
    "you": { "userId": 42, "weeklyXp": 1850, "rank": 4 },
    "promoteRank": 7, "demoteRank": 21,   // cutoffs within this cohort (count - DEMOTE_COUNT)
    "standings": [ { "name": "...", "avatar": "emoji:fox", "weeklyXp": 2100, "isYou": false }, ... ],
    "pendingResults": [ { "weekId": "2026-W22", "division": 1, "rank": 3,
                          "outcome": "promoted", "rewardCoins": 80, "rewardHoney": 15,
                          "rewardBeeId": null } ]
  }
  ```
  Standings include real members (joined to `User` for name/avatar) + bots (with
  ramped XP), sorted desc, with `isYou` flagged. Respects nothing about
  `ShowOnLeaderboard` (leagues are their own opt-in space; see open questions).
- **`POST /api/league/claim`** (`RequireAuthorization`): marks all of the caller's
  unclaimed `LeagueResult`s `Claimed = true`; returns `{ claimed: <n> }`.

## Component 8 — divisions

`LeagueLogic.DivisionName(int d)` → `["Clover","Blossom","Sunflower","Amber","Queen's Court"]`.
New players start at `0` (Clover). Count/names tunable.

## Component 9 — testing

Pure logic in a new dependency-free static class **`WordPlay.LeagueLogic`**:
- `RankEntrants(scores)` → ordered ranks with stable tiebreak.
- `OutcomeFor(rank, count, division)` → promoted/held/demoted with the
  no-demotion-at-0 and boundary rules.
- `RewardFor(rank, outcome, division)` → reward record.
- `BotWeeklyXp(division, seed)` → deterministic XP draw within the division band.
- `WeekId(DateTime utc)` / `WeekBounds(weekId)` / `WeekFraction(weekId, utc)`.

A new **xUnit test project `WordPlay.Tests`** (the repo's first C# test project;
`Microsoft.NET.Test.Sdk` + `xunit` + `xunit.runner.visualstudio`, referencing
`WordPlay`) unit-tests these: promotion/demotion boundaries (rank 7 promotes, rank
8 holds, bottom-5 demote, no demotion at division 0), reward tiers, bot-XP band
scaling, deterministic bot draw, and week-id/bounds/fraction math. Run with
`dotnet test`. The thin EF orchestration (`MaintainLeague`, `SettleCohort`,
`AssignToCohort` DB I/O) is verified via the API during the verification pass
(a scripted sequence: seed two users + bots, advance the week, assert standings +
results + division moves).

## Component 10 — migration

One EF migration (`AddLeagues`) adds the five `UserProgress` columns (with
defaults `0`/`""`) and the three tables + indexes. Per project rule:
- Generate the migration and the idempotent SQL script
  (`dotnet ef migrations script`), include it in the plan, and **apply it
  manually via sqlcmd** — do not rely on auto-migration at publish.
- Defaults backfill existing `UserProgress` rows (everyone starts at Clover,
  XP 0, no cohort) so they're lazily assigned on their next sync.

## Build sequencing

1. `LeagueLogic` pure static class + `WordPlay.Tests` xUnit project (TDD: ranking,
   outcomes, rewards, bot XP, week math).
2. Models (`LeagueCohort`, `LeagueBotMember`, `LeagueResult`) + `UserProgress`
   fields + `WordPlayDb` DbSets/config.
3. EF migration `AddLeagues` + generated SQL script (for manual apply).
4. `CentralWeek`/`WeekBounds` + `AssignToCohort` + `CreateBots` + `MaintainLeague`.
5. `SettleCohort`.
6. `lxp` ingestion in `POST /api/progress`.
7. `GET /api/league/me` + `POST /api/league/claim`.
8. Verification: `dotnet test` green; build clean; scripted API run exercising a
   full week rollover (settlement, promotion, rewards, re-cohort, bot fill).

## Out of scope (→ Slice 3B)

- Client Leagues screen, left-rail Leagues button, the XP-earning hooks in
  gameplay (where `+leagueXp` is awarded across levels/Honeycomb/quests/goals and
  saved as `lxp`), reward/promotion celebrations, and adding the
  `"leaguechampion"` bee to the Collection registry + art.
- Until 3B ships the earning hooks, real players earn 0 weekly XP; 3A is exercised
  via direct `lxp` values in tests and the verification script.

## Open questions / decisions deferred to implementation

- Final tuning: `MAX_WEEKLY_XP`, bot XP bands per division, `PROMOTE_COUNT`/
  `DEMOTE_COUNT`, reward values, league-champion bee drop probability.
- Whether leagues respect the existing `ShowOnLeaderboard` opt-out or are a
  separate opt-in (proposed: leagues are their own space, independent of the
  global leaderboard toggle; revisit if you'd rather honor one switch).
- Bot name pool contents and whether bot avatars should broaden beyond the 16
  allowed emoji.
- Whether to also expose an admin endpoint to force-settle / inspect a cohort
  (deferred; lazy settlement suffices for v1).
