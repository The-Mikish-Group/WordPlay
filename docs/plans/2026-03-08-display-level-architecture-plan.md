# Display-Level Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Invert the offset system so all internal state stores display levels, applying the offset only at the data-lookup boundary. Add a 10-row progress snapshot table for audit history.

**Architecture:** Currently `state.currentLevel` stores raw (offset-inclusive) level numbers, requiring `displayLevel()` conversion at every UI point and causing offset corruption during sync/merge. After this refactor, `state.currentLevel` IS the display level. The offset is added only in `recompute()` when calling `getLevel()`. This eliminates the entire category of offset bugs.

**Tech Stack:** Vanilla JS (client), ASP.NET Core minimal APIs + EF Core + SQLite (server)

**Key invariant:** After this refactor, `state.currentLevel` and `state.highestLevel` always equal what the user sees on screen. The offset exists only to map display levels to data-file positions.

---

## Task 1: ProgressSnapshot Model + EF Migration

**Files:**
- Create: `WordPlay/Models/ProgressSnapshot.cs`
- Modify: `WordPlay/Data/WordPlayDb.cs`
- Generated: `WordPlay/Migrations/...AddProgressSnapshot.cs`

**Step 1: Create model**

```csharp
// WordPlay/Models/ProgressSnapshot.cs
namespace WordPlay.Models;

public class ProgressSnapshot
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int HighestLevel { get; set; }
    public int TotalCoinsEarned { get; set; }
    public int DifficultyTier { get; set; }
    public int DifficultyOffset { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

**Step 2: Add DbSet to WordPlayDb.cs**

Add to `WordPlayDb` class:
```csharp
public DbSet<ProgressSnapshot> ProgressSnapshots => Set<ProgressSnapshot>();
```

**Step 3: Generate and apply migration**

```bash
cd WordPlay
dotnet ef migrations add AddProgressSnapshot
dotnet ef database update
```

**Step 4: Commit**

```bash
git add WordPlay/Models/ProgressSnapshot.cs WordPlay/Data/WordPlayDb.cs WordPlay/Migrations/
git commit -m "feat: add ProgressSnapshot table for audit history"
```

---

## Task 2: Client Save Migration v7 to v8

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `loadProgress()` (~line 506), `saveProgress()` (~line 545)

**Step 1: Add v7→v8 migration block in loadProgress()**

Insert after the existing v6→v7 migration block (after line 516) and before the corruption guard (line 517):

```javascript
// v7→v8 migration: convert raw level numbers to display levels.
// In v7, cl/hl included the tier offset. In v8, they store display
// levels and the offset is applied only at data lookup time.
if (d.v && d.v < 8) {
    const doff = d.doff || 0;
    if (doff > 0) {
        d.cl = Math.max(1, (d.cl || 1) - doff);
        d.hl = Math.max(1, (d.hl || 1) - doff);
        // Convert inProgress keys from raw to display levels
        if (d.ip && typeof d.ip === "object") {
            const newIp = {};
            for (const [key, val] of Object.entries(d.ip)) {
                const displayKey = Number(key) - doff;
                if (displayKey >= 1) newIp[displayKey] = val;
            }
            d.ip = newIp;
        }
    }
    d.v = 8;
    localStorage.setItem("wordplay-save", JSON.stringify(d));
}
```

**Step 2: Update saveProgress() format version**

Change `v: 7` to `v: 8` on the save format version line (~line 545):

```javascript
localStorage.setItem("wordplay-save", JSON.stringify({
    v: 8,  // format version
    cl: state.currentLevel,
    // ... rest unchanged
```

**Step 3: Remove the v7 corruption guard**

The guard at ~line 517 that checks `difficultyOffset > highestLevel` is no longer needed because display levels are always small:

```javascript
// DELETE this block (it was a v7 band-aid):
// if (state.difficultyOffset > 0 && state.highestLevel < state.difficultyOffset + 1) {
//     state.difficultyOffset = 0;
//     ...
// }
```

**Step 4: Update auto-detect tier thresholds**

The auto-detect block (~line 524) uses raw thresholds. Convert to display-level thresholds. Since auto-detect is for organic players (offset=0), the values are the same:

```javascript
if (state.difficultyTier < 0) {
    const hl = state.highestLevel;
    if (hl >= 15001) state.difficultyTier = 4;
    else if (hl >= 5001) state.difficultyTier = 3;
    else if (hl >= 2001) state.difficultyTier = 2;
    else if (hl >= 251) state.difficultyTier = 1;
    else state.difficultyTier = 0;
    state.difficultyOffset = 0; // organic players have no offset
}
```

These thresholds are unchanged because auto-detect only fires for players with `dt < 0` (never chose a tier), who are always organic (offset=0).

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: v7→v8 save migration — convert to display levels"
```

---

## Task 3: Core Data Lookup — Apply Offset at Boundary

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `recompute()` (~line 369)

This is the key architectural change. The offset is applied in exactly one place.

**Step 1: Update recompute() to add offset at data lookup**

In `recompute()`, find where `getLevel()` is called (~line 374) and add the offset:

```javascript
// Compute the data-file level number (display + offset)
const dataLevel = (state.isDailyMode || state.isBonusMode)
    ? state.currentLevel    // daily/bonus levels are raw data positions
    : state.currentLevel + state.difficultyOffset;

if (typeof getLevel === "function") {
    lvData = await getLevel(dataLevel);
}
if (!lvData && typeof ALL_LEVELS !== "undefined") {
    const idx = dataLevel - 1;
    if (idx >= 0 && idx < ALL_LEVELS.length) {
        lvData = ALL_LEVELS[idx];
    }
}
```

**Step 2: Update preloadAround() call**

Find the `preloadAround()` call (~line 431) and apply the same offset:

```javascript
if (typeof preloadAround === "function") {
    const preloadLevel = (state.isDailyMode || state.isBonusMode)
        ? state.currentLevel
        : state.currentLevel + state.difficultyOffset;
    preloadAround(preloadLevel);
}
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: apply offset only at data-lookup boundary"
```

---

## Task 4: Remove displayLevel/actualLevel, Update All Display Sites

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js`

**Step 1: Delete the displayLevel and actualLevel functions**

Remove (~lines 1084-1090):
```javascript
// DELETE these functions entirely:
// function displayLevel(actualLevel) { ... }
// function actualLevel(displayLv) { ... }
```

**Step 2: Replace every displayLevel() call with its argument**

All these calls become just the value itself, since state now stores display levels:

| Line | Before | After |
|------|--------|-------|
| ~2174 (x3) | `displayLevel(state.currentLevel)` | `state.currentLevel` |
| ~2366 | `displayLevel(state.currentLevel)` | `state.currentLevel` |
| ~4137 | `displayLevel(state.currentLevel)` | `state.currentLevel` |
| ~4248 | `displayLevel(state.highestLevel)` | `state.highestLevel` |
| ~4254 | `displayLevel(state.currentLevel)` | `state.currentLevel` |

Map rendering calls are handled in Task 6.

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "refactor: remove displayLevel/actualLevel — state stores display levels"
```

---

## Task 5: Simplify Tier Chooser, Tier Change, and Promotion

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js`

**Step 1: Simplify tier chooser for new players (~line 2488)**

```javascript
btn.onclick = () => {
    const idx = parseInt(btn.getAttribute("data-tier"));
    const tier = DIFFICULTY_TIERS[idx];
    state.difficultyTier = idx;
    state.difficultyOffset = tier.offset;
    state.currentLevel = 1;   // always start at display level 1
    state.highestLevel = 1;
    saveProgress();
    overlay.style.display = "none";
    renderHome();
};
```

**Step 2: Simplify tier change in settings (~line 4669)**

The complexity of two code paths (already-past vs. relocate) disappears. Changing tier just changes the offset — display levels stay the same:

```javascript
tierSelect.onchange = () => {
    const newIdx = parseInt(tierSelect.value);
    if (newIdx === state.difficultyTier) return;
    // Block downgrade after 10+ levels (unless admin)
    if (newIdx < state.difficultyTier && state.highestLevel >= 10 && !state.showAdmin) return;
    const newTier = DIFFICULTY_TIERS[newIdx];
    state.difficultyTier = newIdx;
    state.difficultyOffset = newTier.offset;
    // Display levels stay the same — only the data range changes
    state.inProgress = {};
    state.foundWords = [];
    state.bonusFound = [];
    state.revealedCells = [];
    state.standaloneFound = false;
    saveProgress();
    state.showMenu = false;
    renderMenu();
    showToast(`Difficulty set to ${newTier.label}!`, theme.accent);
    recompute().then(() => { restoreLevelState(); renderHome(); });
};
```

**Step 3: Update checkTierPromotion() (~line 2508)**

The threshold must account for the current offset:

```javascript
function checkTierPromotion() {
    if (state.difficultyTier < 0 || state.difficultyTier >= DIFFICULTY_TIERS.length - 1) return;
    const nextTier = DIFFICULTY_TIERS[state.difficultyTier + 1];
    // Threshold in display terms: how many levels until the next tier's data range
    const threshold = nextTier.offset - state.difficultyOffset + 1;
    if (state.highestLevel >= threshold) {
        state.difficultyTier++;
        // Do NOT change offset — organic promotion is just a label change
        saveProgress();
        setTimeout(() => renderTierPromotion(nextTier), 600);
    }
}
```

**Step 4: Update settings tier display (~line 4279)**

The `levelsPlayed` calculation simplifies:

```javascript
// Before: const levelsPlayed = (state.highestLevel || 1) - state.difficultyOffset;
// After:  state.highestLevel IS the display level
const levelsPlayed = state.highestLevel || 1;
```

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: simplify tier chooser, change, and promotion for display levels"
```

---

## Task 6: Map Rendering

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — map rendering functions (~lines 5998, 6107, 6124, 6167, 6197)

The level manifest uses raw data-file level numbers. The map needs to convert these to display levels for display and for `data-lv` attributes.

**Step 1: Update map node rendering (~line 5998)**

```javascript
// In the per-node loop:
const lvNum = pack.start + i;  // raw data-file level
const displayLv = lvNum - state.difficultyOffset;  // convert to display
const isCurrent = displayLv === state.currentLevel;
const isAvailable = displayLv <= state.highestLevel;
// ... SVG text uses displayLv
// ... data-lv="${displayLv}"  (was lvNum)
```

Replace `displayLevel(lvNum)` with `displayLv` (the local variable).

**Step 2: Update group/pack range displays**

At ~line 6124 (group view):
```javascript
// Before: displayLevel(g.start).toLocaleString() – displayLevel(g.end).toLocaleString()
// After:  (g.start - state.difficultyOffset).toLocaleString() – (g.end - state.difficultyOffset).toLocaleString()
```

At ~line 6197 (pack view): same pattern.

**Step 3: Map filter stays the same**

The filter at ~line 6107 still works correctly:
```javascript
if (g.end < state.difficultyOffset + 1) continue; // skip groups below tier — unchanged
```

**Step 4: goToLevel already works**

`goToLevel()` receives display levels from `data-lv` attributes. It sets `state.currentLevel = num`. Then `recompute()` adds the offset for data lookup. No changes needed.

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "refactor: map rendering uses display levels in data-lv attributes"
```

---

## Task 7: Sync Merge Cleanup

**Files:**
- Modify: `WordPlay/wwwroot/js/sync.js`

**Step 1: Update merge comments**

The merge logic is already correct (takes dt and doff from primary save). Just update the comment:

```javascript
// Difficulty tier & offset: take from primary save (higher hl) so that
// cl, hl, dt, and doff all stay consistent.  hl and cl are now display
// levels; doff maps them to data-file positions at lookup time.
merged.dt = primary.dt !== undefined ? primary.dt : -1;
merged.doff = primary.doff || 0;
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/sync.js
git commit -m "docs: update sync merge comments for display-level architecture"
```

---

## Task 8: Admin Panel Cleanup

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — admin panel rendering (~lines 5480, 5560, 5655)

Since `highestLevel` from the API will now be a display level (after server migration), the admin panel no longer needs offset conversion.

**Step 1: User list row — remove offset subtraction**

At ~line 5480:
```javascript
// Before: (u.highestLevel - (u.difficultyOffset || 0)).toLocaleString()
// After:  u.highestLevel.toLocaleString()
```

**Step 2: Detail view — remove offset conversion**

At ~line 5560:
```javascript
// Before: value="${u.highestLevel - (u.difficultyOffset || 0)}"
// After:  value="${u.highestLevel}"
```

**Step 3: Save handler — remove offset addition**

At ~line 5655:
```javascript
// Before:
// const displayHl = parseInt(document.getElementById("admin-hl").value);
// const doff = u.difficultyOffset || 0;
// const rawHl = displayHl + doff;
// After:
const hl = parseInt(document.getElementById("admin-hl").value);
// ... send hl directly, no conversion needed
```

The tier indicator label can stay as contextual info.

**Step 4: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "refactor: simplify admin panel — no offset conversion needed"
```

---

## Task 9: Server Data Migration

**Files:**
- Modify: `WordPlay/Program.cs` — add a one-time migration endpoint or startup task

**Step 1: Add a one-time admin migration endpoint**

Add after the existing admin endpoints:

```csharp
app.MapPost("/api/admin/migrate-v8", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();

    var allProgress = await db.UserProgress.ToListAsync();
    int migrated = 0;

    foreach (var p in allProgress)
    {
        if (string.IsNullOrEmpty(p.ProgressJson)) continue;

        try
        {
            var node = JsonNode.Parse(p.ProgressJson)?.AsObject();
            if (node == null) continue;

            var version = node["v"]?.GetValue<int>() ?? 0;
            if (version >= 8) continue;  // already migrated

            var doff = node["doff"]?.GetValue<int>() ?? 0;
            if (doff > 0)
            {
                var cl = node["cl"]?.GetValue<int>() ?? 1;
                var hl = node["hl"]?.GetValue<int>() ?? 1;
                node["cl"] = Math.Max(1, cl - doff);
                node["hl"] = Math.Max(1, hl - doff);

                // Convert inProgress keys
                if (node["ip"] is JsonObject ip)
                {
                    var newIp = new JsonObject();
                    foreach (var kvp in ip.ToList())
                    {
                        if (int.TryParse(kvp.Key, out var rawKey))
                        {
                            var displayKey = rawKey - doff;
                            if (displayKey >= 1)
                                newIp[displayKey.ToString()] = kvp.Value?.DeepClone();
                        }
                    }
                    node["ip"] = newIp;
                }

                // Update denormalized fields
                p.HighestLevel = Math.Max(1, p.HighestLevel - doff);
                p.LevelsCompleted = Math.Max(0, p.LevelsCompleted - doff);
                if (p.MonthlyStart > doff)
                    p.MonthlyStart = p.MonthlyStart - doff;
                else
                    p.MonthlyStart = p.HighestLevel;  // reset monthly if nonsensical
            }

            node["v"] = 8;
            p.ProgressJson = node.ToJsonString();
            p.UpdatedAt = DateTime.UtcNow;
            migrated++;
        }
        catch { /* skip malformed entries */ }
    }

    await db.SaveChangesAsync();
    return Results.Ok(new { migrated, total = allProgress.Count });
}).RequireAuthorization();
```

**Step 2: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: add admin v8 migration endpoint for server-side data conversion"
```

---

## Task 10: Server POST /api/progress Updates

**Files:**
- Modify: `WordPlay/Program.cs` — POST /api/progress (~line 425)

**Step 1: Add snapshot creation on level completion**

After the `progress.HighestLevel = highestLevel;` assignment (~line 506), and before `db.SaveChangesAsync()`, add snapshot logic:

```csharp
// Snapshot on level completion (new high-water mark)
if (highestLevel > previousHighest)
{
    int snapDoff = 0, snapDt = -1;
    try
    {
        if (progressEl.TryGetProperty("doff", out var doffSnap))
            snapDoff = doffSnap.GetInt32();
        if (progressEl.TryGetProperty("dt", out var dtSnap))
            snapDt = dtSnap.GetInt32();
    }
    catch { }

    db.ProgressSnapshots.Add(new ProgressSnapshot
    {
        UserId = userId.Value,
        HighestLevel = highestLevel,
        TotalCoinsEarned = totalCoinsEarned,
        DifficultyTier = snapDt,
        DifficultyOffset = snapDoff,
        CreatedAt = DateTime.UtcNow,
    });

    // Retain only the newest 10 snapshots per user
    var oldSnapshots = await db.ProgressSnapshots
        .Where(s => s.UserId == userId.Value)
        .OrderByDescending(s => s.CreatedAt)
        .Skip(10)
        .ToListAsync();
    if (oldSnapshots.Count > 0)
        db.ProgressSnapshots.RemoveRange(oldSnapshots);
}
```

Note: capture `var previousHighest = progress.HighestLevel;` BEFORE the guard check at line 453.

**Step 2: Remove the "large level change" monthly reset**

The "large level change" guard (~line 481) was needed because tier changes caused 15000+ level jumps. With display levels, tier changes don't alter level numbers, so this guard is unnecessary. Remove:

```csharp
// DELETE this block:
// var levelDelta = highestLevel - progress.HighestLevel;
// if (levelDelta > 50 || levelDelta < -10)
// {
//     progress.MonthlyStart = highestLevel;
//     progress.MonthlyCoinsStart = totalCoinsEarned;
// }
```

**Step 3: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: snapshot on level completion, remove large-delta guard"
```

---

## Task 11: Server Admin + Leaderboard Cleanup

**Files:**
- Modify: `WordPlay/Program.cs`

**Step 1: Admin users endpoint — simplify**

The `difficultyOffset` extraction from ProgressJson (~line 870) can stay for the tier label display, but the admin panel no longer needs it for level math. No code changes needed here — the admin JS changes in Task 8 handle the simplification.

**Step 2: Admin PUT progress — sync correct v8 fields**

In the admin PUT endpoint (~line 960), the JSON field sync should set v=8:

```csharp
pNode["hl"] = progress.HighestLevel;
pNode["lc"] = progress.HighestLevel;
pNode["tce"] = progress.TotalCoinsEarned;
pNode["cl"] = progress.HighestLevel;
pNode["v"] = 8;  // ensure v8 format
```

**Step 3: Add admin snapshot viewing endpoint**

```csharp
app.MapGet("/api/admin/users/{id}/snapshots", async (int id, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var snapshots = await db.ProgressSnapshots
        .Where(s => s.UserId == id)
        .OrderByDescending(s => s.CreatedAt)
        .Take(10)
        .Select(s => new
        {
            s.HighestLevel,
            s.TotalCoinsEarned,
            s.DifficultyTier,
            s.DifficultyOffset,
            s.CreatedAt,
        })
        .ToListAsync();
    return Results.Ok(snapshots);
}).RequireAuthorization();
```

**Step 4: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: admin snapshot endpoint, ensure v8 format on admin edits"
```

---

## Task 12: Admin Snapshot UI

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `renderAdminUserDetail()` (~line 5575)

**Step 1: Add snapshot section to admin detail view**

After the "Danger Zone" section, add:

```javascript
<div class="menu-setting">
    <label class="menu-setting-label">Recent History</label>
    <div id="admin-snapshot-section" style="padding:4px 12px;font-size:13px;opacity:0.5">Loading...</div>
</div>
```

**Step 2: Fetch and render snapshots**

After the admin detail event wiring, add:

```javascript
fetch("/api/admin/users/" + u.id + "/snapshots", { headers: getAuthHeaders() })
    .then(r => r.json())
    .then(snapshots => {
        const section = document.getElementById("admin-snapshot-section");
        if (!section) return;
        if (!snapshots || snapshots.length === 0) {
            section.innerHTML = '<div style="opacity:0.5">No history yet</div>';
            return;
        }
        const tierNames = ["Easy","Medium","Hard","Expert","Master"];
        section.innerHTML = snapshots.map(s => {
            const d = new Date(s.createdAt);
            const dateStr = d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
            const tier = tierNames[s.difficultyTier] || "—";
            return `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span>Lv ${s.highestLevel.toLocaleString()} · ${s.totalCoinsEarned.toLocaleString()} pts · ${tier}</span>
                <span style="opacity:0.4">${dateStr}</span>
            </div>`;
        }).join("");
    })
    .catch(() => {
        const section = document.getElementById("admin-snapshot-section");
        if (section) section.innerHTML = '<div style="opacity:0.5">Failed to load</div>';
    });
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: admin snapshot history UI"
```

---

## Task 13: Version Bumps, Cleanup, and Verification

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — APP_VERSION
- Modify: `WordPlay/wwwroot/sw.js` — CACHE_NAME, asset versions
- Modify: `WordPlay/wwwroot/index.html` — asset versions

**Step 1: Bump versions**

- `APP_VERSION` → `"1.2.0"` (minor bump for architectural change)
- `CACHE_NAME` → `'wordplay-v95'`
- All `?v=` → `46`

**Step 2: Remove the v6→v7 migration block**

The v6→v7 migration in `loadProgress()` (~line 508) is now superseded by v7→v8. Remove:

```javascript
// DELETE: v6→v7 migration block (lines 508-516)
```

**Step 3: Manual verification checklist**

After deploying, verify:
- [ ] New Easy player: sees "Level 1", plays level data from position 1
- [ ] New Master player: sees "Level 1", plays level data from position 15001
- [ ] Existing organic player (offset=0): levels unchanged after v8 migration
- [ ] Existing tier player (offset>0): display level unchanged, data levels unchanged
- [ ] Tier change in settings: display level stays same, puzzle difficulty changes
- [ ] Sync between two devices: levels stay consistent
- [ ] Leaderboard: shows display levels, fair ranking across tiers
- [ ] Admin panel: shows display levels directly, no offset math
- [ ] Admin snapshot history: shows last 10 level completions
- [ ] Map: correct level numbers, clicking navigates correctly
- [ ] Flow levels: every 5th display level is a flow level
- [ ] Daily/bonus puzzles: load correct level data (no offset applied)

**Step 4: Run server migration**

After deploying, trigger the one-time server migration:
```bash
curl -X POST https://your-domain/api/admin/migrate-v8 -H "Authorization: Bearer <admin-token>"
```

Verify response shows migrated count.

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html
git commit -m "feat: version bumps and cleanup for v8 display-level architecture"
```

---

## Deployment Order

1. Deploy all code changes (client + server)
2. First user to open the app gets client-side v7→v8 migration automatically
3. Admin triggers `/api/admin/migrate-v8` to convert all server-side data
4. Verify leaderboard, admin panel, and sync behavior
5. Remove the `/api/admin/migrate-v8` endpoint in a follow-up deploy (optional cleanup)
