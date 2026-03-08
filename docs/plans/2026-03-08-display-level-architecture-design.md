# Display-Level Architecture + Progress Snapshots

**Date:** 2026-03-08
**Status:** Approved

## Problem

The difficulty tier system stores offset-inclusive ("raw") level numbers in all internal state. A Master-tier player at display level 5 has `state.currentLevel = 15005`. This creates a pervasive problem: every piece of code that touches level numbers must know whether it's dealing with raw or display values. Bugs arise when:

- Sync merges levels from one device with offsets from another
- Admin panel needs mental math to convert between display and raw
- Leaderboard inflates higher-tier players' numbers
- Monthly calculations mix raw and display units
- Multiple accounts on one device contaminate each other's offset state

These have been recurring issues across multiple sessions despite repeated fixes.

## Core Design Change

**Invert where the offset lives.** Instead of baking the offset into every internal level number and subtracting for display, store display levels everywhere and apply the offset only at the single point where level data is fetched.

### Before (current)

```
state.currentLevel = 15005    // raw, includes offset
state.highestLevel = 25800    // raw, includes offset
state.difficultyOffset = 15000
displayLevel(15005) = 5       // conversion needed everywhere
getLevel(15005)                // data lookup uses raw directly
```

### After (new)

```
state.currentLevel = 5        // display level, what the user sees
state.highestLevel = 10800    // display level, what the user sees
state.difficultyOffset = 15000 // only used at data lookup boundary
getLevel(5 + 15000)            // offset applied at ONE place
```

The offset touches exactly ONE code path: level data fetching. Everything else — sync, merge, leaderboard, admin, monthly tracking, map rendering — uses numbers directly as they appear to the user. `displayLevel()` and `actualLevel()` are deleted entirely.

## Changes by File

### app.js

- **Remove** `displayLevel()` and `actualLevel()` functions
- **`recompute()`** — change `getLevel(state.currentLevel)` to `getLevel(state.currentLevel + state.difficultyOffset)`; same for preload calls
- **Tier chooser** (new players) — `state.currentLevel = 1; state.highestLevel = 1` (not `offset + 1`)
- **Tier change in settings** — only changes `state.difficultyOffset`; `currentLevel` and `highestLevel` stay the same since they're already display values
- **`checkTierPromotion()`** — compare display `highestLevel` against tier thresholds (thresholds become display-level based, not raw-level based)
- **Every `displayLevel(x)` call** — replace with just `x`
- **Map rendering** — node `data-lv` stores display levels; `goToLevel()` takes display levels
- **v7→v8 migration** in `loadProgress()`:
  ```javascript
  if (d.v && d.v < 8) {
      d.cl = (d.cl || 1) - (d.doff || 0);
      d.hl = (d.hl || 1) - (d.doff || 0);
      // doff stays — still needed for data lookup
      d.v = 8;
      localStorage.setItem("wordplay-save", JSON.stringify(d));
  }
  ```
- **Save format** bumps to `v: 8`

### sync.js

- **`mergeProgress()`** — merges display levels. `doff` taken from primary save (higher `hl`). Since `hl` values are now display levels, merge is straightforward. Remove defensive offset-consistency checks (no longer needed).

### level-loader.js

- **`getLevel(n)`** — called with `displayLevel + offset`. No change to the loader itself; it just receives a different number.

### crossword.js / levels.js

- No changes — these don't reference level numbers directly.

### Program.cs (server)

- **`POST /api/progress`** — `HighestLevel` now receives display-level values (smaller numbers). The `highestLevel < progress.HighestLevel` guard still works correctly.
- **Leaderboard** — ranks by display levels natively. No conversion needed. All players compared fairly.
- **Admin API** — `difficultyOffset` still returned for reference, but admin panel no longer needs display↔raw conversion.
- **Monthly rollover** — `MonthlyStart` stores display levels. `monthlyGain = HighestLevel - MonthlyStart` is correct without any offset math.
- **"Large level change" guard** (line 481) — no longer triggers on tier changes since level numbers don't jump by the offset amount.
- **One-time migration** after deploy: for each UserProgress row, parse `doff` from ProgressJson, subtract from HighestLevel/LevelsCompleted/MonthlyStart, update ProgressJson blob fields, set v=8.

### sw.js / index.html

- Cache and asset version bumps as usual.

## Progress Snapshots

### New table: `ProgressSnapshot`

```
Id              int, PK, auto-increment
UserId          int, FK → Users.Id
HighestLevel    int         // display level at time of snapshot
TotalCoinsEarned int
DifficultyTier  int
DifficultyOffset int
CreatedAt       DateTime
```

### Trigger

Every level-completion sync: when `POST /api/progress` receives `highestLevel > progress.HighestLevel` (i.e., a real level completion, not a replay).

### Retention

After inserting a snapshot, delete any rows for that user beyond the newest 10:

```sql
DELETE FROM ProgressSnapshots
WHERE UserId = @userId
  AND Id NOT IN (
    SELECT Id FROM ProgressSnapshots
    WHERE UserId = @userId
    ORDER BY CreatedAt DESC
    LIMIT 10
  )
```

### Admin usage

Add a "History" section to the admin user detail view showing the last 10 snapshots with timestamps. When scores are corrupted, admin can see the last-known-good values and manually restore.

## Migration Path

1. **Client v7→v8 migration** runs on app load in `loadProgress()`. Subtracts `doff` from `cl` and `hl`, sets `v = 8`, writes immediately to localStorage.
2. **Server one-time script** after deploy: iterates all UserProgress rows, parses `doff` from ProgressJson, updates denormalized fields and JSON blob.
3. **Sync guard**: server rejects saves with `v < 8` after migration window (forces client to update). During the migration window, server accepts both v7 (raw) and v8 (display) by checking the version field and converting if needed.

## Tier Promotion Thresholds

With display levels, promotion thresholds change from raw offsets to display-level counts:

| Tier | Current threshold (raw) | New threshold (display levels completed) |
|------|------------------------|------------------------------------------|
| Easy → Medium | hl >= 251 | hl >= 251 |
| Medium → Hard | hl >= 2001 | hl >= 1751 (2001 - 250) |
| Hard → Expert | hl >= 5001 | hl >= 3001 (5001 - 2000) |
| Expert → Master | hl >= 15001 | hl >= 10001 (15001 - 5000) |

Wait — this isn't right either. Organic players (offset=0) who started from Easy and played through 15000 levels should still promote at the same display level they do today. Since organic players have offset=0, their display level = raw level. So thresholds stay the same in display terms.

For tier-skip players (e.g., started at Medium offset=250), promotion to Hard happens when they reach display level 2001. With offset=250, that means they're fetching level data from position 2251, which is in the Hard range. This is correct.

**Thresholds stay the same numeric values** — they're just interpreted as display levels now instead of raw levels.

## What This Eliminates

- `displayLevel()` / `actualLevel()` functions — deleted
- All display↔raw conversion in admin panel — unnecessary
- Offset corruption during sync merge — impossible (offset is not entangled with level numbers)
- Leaderboard inflation for higher tiers — display levels are fair
- Monthly baseline confusion on tier changes — level numbers don't jump
- "Large level change" false positives on tier switch — no jump to detect
