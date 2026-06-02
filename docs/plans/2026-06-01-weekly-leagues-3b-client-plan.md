# Weekly Leagues 3B — Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface Weekly Leagues to players — a left-rail Leagues button, a standings screen, per-word League-XP earning, the reward/promotion claim flow, a sign-in invite, and the `leaguechampion` reward bee.

**Architecture:** A new browser-global `league.js` holds the client logic (fetch/cache `/api/league/me`, claim flow, rail button, standings screen), mirroring `sync.js`'s auth pattern. League XP accumulates in `state.leagueXp` (saved as `lxp`, already ingested by the 3A backend). The champion bee is added to the existing `bee-core.js` registry + art pipeline. Verified locally via `dotnet run` (the 3A endpoints are in the build) against the already-migrated DB.

**Tech Stack:** Vanilla browser JS (global-script style), Node 22 (`node --test` for `bee-core`), the existing fal.ai art tool for one image.

**Spec:** `docs/plans/2026-06-01-weekly-leagues-3b-client-design.md`

**Scope:** Client only. The 3A backend (engine + endpoints + migration) is already built and the migration is applied to the live DB.

---

## File Structure

**Create:**
- `WordPlay/wwwroot/js/league.js` — client logic: `addLeagueXp`, `loadLeague`, `claimLeague`, `claimAndCelebrate`, `renderLeagueRailButton`, `renderLeague` (screen), sign-in invite, `LEAGUE_XP`/`LEAGUE_DIVISIONS` constants.

**Modify:**
- `WordPlay/wwwroot/js/bee-core.js` + `test/bee-core.test.js` — add `leaguechampion` bee (registry → 31), allow `source: "league"`.
- `WordPlay/wwwroot/js/bee-collection.js` — locked-card hint for `source: "league"`.
- `tools/bee-prompts.json` — `leaguechampion` art prompt (keeps the drift test green).
- `WordPlay/wwwroot/js/app.js` — `state.leagueXp`/`state.leagueClaimedWeeks`; `lxp`/`lcw` save+hydrate+reset; the XP hooks; left-rail Leagues button + dispatch + click wiring + init `loadLeague`; `GUIDE_SECTIONS`; `APP_VERSION`.
- `WordPlay/wwwroot/js/honeycomb.js`, `WordPlay/wwwroot/js/quests.js` — their XP hooks.
- `WordPlay/wwwroot/js/sync.js` — merge `lxp` (max) + `lcw` (union).
- `WordPlay/wwwroot/css/app.css` — `.league-*` screen styles + left-rail stagger.
- `WordPlay/wwwroot/index.html`, `WordPlay/wwwroot/sw.js` — register `league.js`, bump markers.
- `README.md` — Leagues section.
- (Generated) `WordPlay/wwwroot/images/bees/leaguechampion.webp` + manifest.

**Conventions:** no `Co-Authored-By`; run from repo root. `bee-core` tests: `node --test test/bee-core.test.js`. JS parse: `node --check <file>`. CSS braces: the balance one-liner used in prior slices.

---

## Task 1: Champion bee — registry, source, prompt, hint, tests

**Files:** `WordPlay/wwwroot/js/bee-core.js`, `test/bee-core.test.js`, `tools/bee-prompts.json`, `WordPlay/wwwroot/js/bee-collection.js`

- [ ] **Step 1: Update the bee-core tests.** In `test/bee-core.test.js`:
  - Change the registry-count test `assert.strictEqual(core.BEES.length, 30);` to `31`.
  - Change the tier-count test expectation from `{ common: 8, uncommon: 8, rare: 7, epic: 4, legendary: 3 }` to `{ common: 8, uncommon: 8, rare: 7, epic: 4, legendary: 4 }`.
  - Append a new test:
```js
test("leaguechampion is a league-source legendary, excluded from discovery and milestones", () => {
  const bee = core.getBee("leaguechampion");
  assert.strictEqual(bee.tier, "legendary");
  assert.strictEqual(bee.source, "league");
  assert.ok(!core.discoveryPool().includes("leaguechampion"));
  assert.ok(!core.evaluateMilestones({ ownedIds: [], honeycombRankIndex: 6, questsCompleted: 9, dailyStreak: 7, difficultyTier: 4, highestLevel: 9999 }).includes("leaguechampion"));
});
```
  - The existing "every milestone key referenced by a bee has a predicate" test must still pass — it only checks `source.startsWith("milestone:")` bees, so a `"league"` source is ignored by it. Confirm.

- [ ] **Step 2: Run to verify failure** — `node --test test/bee-core.test.js` → FAIL (length 30≠31; `getBee("leaguechampion")` null).

- [ ] **Step 3: Add the bee to `bee-core.js`.** Append to the `BEES` array (after `solstice`):
```js
    { id: "leaguechampion", name: "Champion Bee", tier: "legendary", perk: { type: "coinPerWord", value: 4 }, flavor: "Crowned victor of a weekly league.", source: "league" }
```

- [ ] **Step 4: Add the art prompt to `tools/bee-prompts.json`** (so the registry↔prompts drift test stays green). Add this entry:
```json
  "leaguechampion": { "desc": "a triumphant champion bee wearing a golden crown and holding a tiny trophy, confetti drifting around", "palette": "champion gold, royal purple, trophy silver" }
```
(Insert it as a valid JSON member — mind the trailing comma on the previous entry.)

- [ ] **Step 5: Locked-card hint in `bee-collection.js`.** In `renderHive`, the locked-card branch currently computes `const hint = b.source === "discovery" ? "Found by playing" : "Special achievement";`. Replace that line with:
```js
            const hint = b.source === "discovery" ? "Found by playing"
                : b.source === "league" ? "Win a weekly league"
                : "Special achievement";
```

- [ ] **Step 6: Run to verify pass** — `node --test test/bee-core.test.js` → PASS; `node --test test/bee-art.test.js` → PASS (drift: 31 ids == 31 prompts); `npm test` → all green; `node --check WordPlay/wwwroot/js/bee-collection.js` → clean.

- [ ] **Step 7: Commit**
```bash
git add WordPlay/wwwroot/js/bee-core.js test/bee-core.test.js tools/bee-prompts.json WordPlay/wwwroot/js/bee-collection.js
git commit -m "feat: add leaguechampion bee (league-source legendary)"
```

---

## Task 2: League state — fields, save, load, reset (app.js)

**Files:** `WordPlay/wwwroot/js/app.js`

- [ ] **Step 1: Add state fields.** In the state object, after the Bee Collection fields (`hive: null,` / `showHive: false,`), add:
```js
    // Weekly Leagues
    leagueXp: 0,                 // lifetime monotonic League XP (sent as "lxp")
    leagueClaimedWeeks: [],      // weekIds whose league reward was applied locally (sent as "lcw")
    showLeague: false,           // transient: Leagues screen shown
```

- [ ] **Step 2: Persist.** In the `saveProgress` payload object, after `hv: state.hive,`, add:
```js
            lxp: state.leagueXp,
            lcw: state.leagueClaimedWeeks,
```

- [ ] **Step 3: Hydrate on load.** Where engagement fields are read from `d` (after `state.hive = normalizeHive(d.hv);`), add:
```js
            state.leagueXp = d.lxp || 0;
            state.leagueClaimedWeeks = Array.isArray(d.lcw) ? d.lcw : [];
```

- [ ] **Step 4: Reset on account switch.** In `resetStateToDefaults`, alongside `state.hive = null;`, add:
```js
    state.leagueXp = 0;
    state.leagueClaimedWeeks = [];
```

- [ ] **Step 5: Verify** — `node --check WordPlay/wwwroot/js/app.js` → clean.

- [ ] **Step 6: Commit**
```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: league xp client state, persistence, reset"
```

---

## Task 3: Sync merge for lxp/lcw (sync.js)

**Files:** `WordPlay/wwwroot/js/sync.js`

- [ ] **Step 1: Add the merge.** Find the hive (`hv`) merge block (it builds `merged.hv`). Immediately AFTER that block, add:
```js
    // League XP: monotonic — take the max. Claimed weeks: union (never lose a marker).
    merged.lxp = Math.max(local.lxp || 0, server.lxp || 0);
    merged.lcw = Array.from(new Set([].concat(local.lcw || [], server.lcw || [])));
```

- [ ] **Step 2: Verify** — `node --check WordPlay/wwwroot/js/sync.js` → clean.

- [ ] **Step 3: Commit**
```bash
git add WordPlay/wwwroot/js/sync.js
git commit -m "feat: sync-merge league xp and claimed weeks"
```

---

## Task 4: `league.js` — XP, fetch/cache/claim, rail button

**Files:** Create `WordPlay/wwwroot/js/league.js`

- [ ] **Step 1: Create the file:**
```js
// ============================================================
// WordPlay — Weekly Leagues (client). Talks to the 3A backend
// (/api/league/me, /api/league/claim). Mirrors sync.js auth.
// Globals: state, saveProgress, isSignedIn, getAuthHeaders,
// _handleAuthExpired, renderActivityButton, renderHome, grantBee,
// renderAvatar, showToast, window.quests._showRewardPopup.
// ============================================================

const LEAGUE_TTL = 3 * 60000; // ms; refetch cadence for the rail button cache
let _leagueCache = null;
let _leagueFetchedAt = 0;

const LEAGUE_DIVISIONS = ["Clover", "Blossom", "Sunflower", "Amber", "Queen's Court"];
function leagueDivisionName(d) {
    return LEAGUE_DIVISIONS[Math.max(0, Math.min(LEAGUE_DIVISIONS.length - 1, d || 0))];
}

// XP award amounts (tunable). Server ratchets + caps weekly.
const LEAGUE_XP = {
    word: 2, longWordBonus: 1, bonusWord: 3, standalone: 10,
    level: 10, honeycombRank: 15, dailyGoal: 10, dailyPuzzle: 20, bonusPuzzle: 15,
};

function addLeagueXp(n) {
    if (!n) return;
    state.leagueXp = (state.leagueXp || 0) + n; // persisted by the normal saveProgress
}

async function loadLeague(force) {
    if (typeof isSignedIn !== "function" || !isSignedIn()) return null;
    const now = Date.now();
    if (!force && _leagueCache && (now - _leagueFetchedAt) < LEAGUE_TTL) return _leagueCache;
    try {
        const res = await fetch("/api/league/me", { headers: getAuthHeaders() });
        if (res.status === 401) { if (typeof _handleAuthExpired === "function") _handleAuthExpired(); return null; }
        if (!res.ok) return _leagueCache;
        const data = await res.json();
        _leagueCache = data;
        _leagueFetchedAt = now;
        if (data && data.pendingResults && data.pendingResults.length) {
            await claimAndCelebrate(data.pendingResults);
        }
        return data;
    } catch (e) {
        return _leagueCache;
    }
}

async function claimLeague() {
    try {
        const res = await fetch("/api/league/claim", { method: "POST", headers: getAuthHeaders() });
        if (res.status === 401 && typeof _handleAuthExpired === "function") _handleAuthExpired();
    } catch (e) { /* offline — rewards already applied locally; retried next load */ }
}

// Apply prior-week rewards locally (idempotent via state.leagueClaimedWeeks), then ack the server.
async function claimAndCelebrate(results) {
    if (!Array.isArray(results) || !results.length) return;
    if (!Array.isArray(state.leagueClaimedWeeks)) state.leagueClaimedWeeks = [];
    let applied = false;
    for (const r of results) {
        if (state.leagueClaimedWeeks.indexOf(r.weekId) !== -1) continue; // already applied locally
        const coins = r.rewardCoins || 0, honey = r.rewardHoney || 0, beeId = r.rewardBeeId || null;
        if (coins) { state.coins = (state.coins || 0) + coins; state.totalCoinsEarned = (state.totalCoinsEarned || 0) + coins; }
        if (honey && state.quest) { state.quest.jars = (state.quest.jars || 0) + honey; }
        if (beeId && typeof grantBee === "function") { grantBee(beeId, "League prize!"); }
        state.leagueClaimedWeeks.push(r.weekId);
        applied = true;
        _leagueCelebrate(r, coins, honey);
    }
    if (applied) {
        if (typeof saveProgress === "function") saveProgress();
        await claimLeague();
    }
}

function _outcomeLabel(o) {
    return o === "promoted" ? "Promoted!" : o === "demoted" ? "Moved down a tier" : "Held your spot";
}

function _leagueCelebrate(r, coins, honey) {
    if (window.quests && typeof window.quests._showRewardPopup === "function") {
        const title = "#" + r.rank + " in " + leagueDivisionName(r.division) + " — " + _outcomeLabel(r.outcome);
        window.quests._showRewardPopup({ title, reward: { coins: coins, jars: honey } });
    }
}

// Left-rail Leagues button (uses Slice 1's renderActivityButton).
function renderLeagueRailButton() {
    if (typeof renderActivityButton !== "function") return "";
    const signedIn = typeof isSignedIn === "function" && isSignedIn();
    if (!signedIn) {
        return renderActivityButton({ action: "open-league", icon: "🏆", pill: "Join", waiting: false, glow: false, title: "Leagues — sign in to join" });
    }
    const c = _leagueCache;
    if (!c || !c.ready) {
        return renderActivityButton({ action: "open-league", icon: "🏆", pill: "—", waiting: false, glow: false, title: "Leagues" });
    }
    const count = (c.standings && c.standings.length) || 1;
    const rank = (c.you && c.you.rank) || count;
    const ring = Math.round((count - rank) / Math.max(1, count - 1) * 100);
    const hasReward = !!(c.pendingResults && c.pendingResults.length);
    return renderActivityButton({
        action: "open-league",
        icon: "🏆",
        ringPct: ring,
        pill: "#" + rank,
        badge: hasReward ? "!" : null,
        waiting: false,
        glow: hasReward,
        title: "Leagues — " + (c.divisionName || leagueDivisionName(c.division)) + ", #" + rank + " of " + count,
    });
}
```

- [ ] **Step 2: Verify it parses** — `node --check WordPlay/wwwroot/js/league.js` → clean.

- [ ] **Step 3: Commit**
```bash
git add WordPlay/wwwroot/js/league.js
git commit -m "feat: league client core — xp, fetch, claim, rail button"
```

---

## Task 5: `league.js` — standings screen + sign-in invite

**Files:** `WordPlay/wwwroot/js/league.js` (append)

- [ ] **Step 1: Append the screen + invite:**
```js
// ---------- Leagues screen ----------
function renderLeague() {
    const root = document.getElementById("app");
    if (!root) return;

    // Signed-out players can't have a league — invite them to sign in.
    if (typeof isSignedIn !== "function" || !isSignedIn()) {
        renderLeagueSignInInvite();
        return;
    }

    const c = _leagueCache;
    if (!c) {
        root.innerHTML = _leagueShell('<div class="quest-screen-empty">Loading league…</div>');
        _leagueWireClose();
        loadLeague(true).then(() => { if (state.showLeague) renderLeague(); });
        return;
    }
    if (!c.ready) {
        root.innerHTML = _leagueShell('<div class="quest-screen-empty">Your league starts after your next sync — keep playing!</div>');
        _leagueWireClose();
        return;
    }

    const count = c.standings.length;
    const rows = c.standings.map((s, i) => {
        const pos = i + 1;
        const zone = pos <= c.promoteRank ? " league-promote" : (pos >= c.demoteRank ? " league-demote" : "");
        const you = s.isYou ? " league-you" : "";
        const av = (typeof renderAvatar === "function") ? renderAvatar(s.avatar, s.name, 28) : "";
        return `<div class="league-row${zone}${you}">
            <span class="league-pos">${pos}</span>
            <span class="league-av">${av}</span>
            <span class="league-name">${_esc(s.name)}</span>
            <span class="league-xp">${s.weeklyXp}</span>
        </div>`;
    }).join("");

    const days = Math.floor(c.secondsToReset / 86400);
    const hrs = Math.floor((c.secondsToReset % 86400) / 3600);
    const countdown = (days > 0 ? days + "d " : "") + hrs + "h left";

    const body = `
        <div class="quest-header">
            <div class="quest-header-icon">🏆</div>
            <div class="quest-header-name">${_esc(c.divisionName || leagueDivisionName(c.division))} League</div>
            <div class="quest-header-time">${countdown}</div>
        </div>
        <div class="league-banner">You're <b>#${c.you.rank}</b> of ${count} · top ${c.promoteRank} promote</div>
        <div class="league-list">${rows}</div>
        <div class="league-legend"><span class="league-promote-key">promotion</span><span class="league-demote-key">demotion</span></div>`;
    root.innerHTML = _leagueShell(body);
    _leagueWireClose();
    const refresh = root.querySelector("#league-refresh");
    if (refresh) refresh.addEventListener("click", () => loadLeague(true).then(() => { if (state.showLeague) renderLeague(); }));
}

function _leagueShell(inner) {
    return `<div class="quest-screen league-screen">
        <button class="quest-close" data-action="close-league">✕</button>
        <button class="league-refresh-btn" id="league-refresh" title="Refresh">⟳</button>
        ${inner}
    </div>`;
}

function _leagueWireClose() {
    const root = document.getElementById("app");
    const c = root.querySelector("[data-action='close-league']");
    if (c) c.addEventListener("click", () => { state.showLeague = false; if (typeof renderHome === "function") renderHome(); });
}

function renderLeagueSignInInvite() {
    const root = document.getElementById("app");
    root.innerHTML = `<div class="quest-screen league-screen">
        <button class="quest-close" data-action="close-league">✕</button>
        <div class="quest-header"><div class="quest-header-icon">🏆</div>
            <div class="quest-header-name">Weekly Leagues</div></div>
        <div class="league-invite">
            <p>Sign in to join this week's league and climb the divisions — Clover all the way to the Queen's Court!</p>
            <button class="hc-btn hc-enter" id="league-signin-btn">Sign in</button>
        </div>
    </div>`;
    _leagueWireClose();
    const btn = root.querySelector("#league-signin-btn");
    if (btn) btn.addEventListener("click", () => {
        state.showLeague = false;
        state.showMenu = true;                 // Settings holds the sign-in buttons
        if (typeof renderMenu === "function") renderMenu();
    });
}

function _esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, ch =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
```

- [ ] **Step 2: Verify it parses** — `node --check WordPlay/wwwroot/js/league.js` → clean.

- [ ] **Step 3: Commit**
```bash
git add WordPlay/wwwroot/js/league.js
git commit -m "feat: league standings screen and sign-in invite"
```

---

## Task 6: League CSS

**Files:** `WordPlay/wwwroot/css/app.css` (append)

- [ ] **Step 1: Append:**
```css
/* ============================================================
   Weekly Leagues screen
   ============================================================ */
.league-refresh-btn {
    position: absolute; top: calc(max(14px, env(safe-area-inset-top)) + 4px);
    right: max(14px, env(safe-area-inset-right)); background: rgba(0,0,0,0.4); border: none;
    color: #fff; width: 44px; height: 44px; border-radius: 50%; font-size: 20px; cursor: pointer; z-index: 5;
}
.league-banner { text-align: center; font-size: 16px; color: #fff; margin: 4px 0 12px; }
.league-list { display: flex; flex-direction: column; gap: 4px; }
.league-row {
    display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px;
    background: rgba(255,255,255,0.06); color: #fff; border-left: 4px solid transparent;
}
.league-row.league-promote { border-left-color: #5ec26a; }
.league-row.league-demote { border-left-color: #e0707a; }
.league-row.league-you { background: rgba(244,165,53,0.22); font-weight: 700; }
.league-pos { width: 26px; text-align: right; font-weight: 700; opacity: 0.85; }
.league-av { width: 28px; height: 28px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
.league-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; }
.league-xp { font-weight: 800; color: #ffe08a; }
.league-legend { display: flex; gap: 16px; justify-content: center; margin-top: 12px; font-size: 13px; opacity: 0.85; }
.league-promote-key::before { content: "▌"; color: #5ec26a; }
.league-demote-key::before { content: "▌"; color: #e0707a; }
.league-invite { text-align: center; padding: 20px; color: #fff; font-size: 16px; line-height: 1.5; }
.league-invite .hc-btn { margin-top: 14px; }
/* Two-button left rail: stagger to frame the Level button (mirrors the right rail). */
.activity-rail-left { top: 44%; }
.activity-rail-left .activity-btn:nth-child(2) { margin-top: 6px; }
```

- [ ] **Step 2: Verify braces balance** (the one-liner used in prior slices) → "balanced N".

- [ ] **Step 3: Commit**
```bash
git add WordPlay/wwwroot/css/app.css
git commit -m "feat: league screen styles and left-rail stagger"
```

---

## Task 7: League XP earning hooks

**Files:** `WordPlay/wwwroot/js/app.js`, `WordPlay/wwwroot/js/honeycomb.js`, `WordPlay/wwwroot/js/quests.js`

All calls guard `typeof addLeagueXp === "function"` (league.js loads before app.js; calls run at gameplay time).

- [ ] **Step 1: Per-word grid award (app.js, `handleWord`).** Find the swiped-word coin block (the one with `let wordReward = ...` then `state.coins += wordReward;` in `handleWord`, ~line 2034). Immediately after `state.totalCoinsEarned += wordReward;` there, add:
```js
        if (!state.isDailyMode && !state.isBonusMode && typeof addLeagueXp === "function")
            addLeagueXp(LEAGUE_XP.word + (w.length >= 5 ? LEAGUE_XP.longWordBonus : 0));
```
(`w` is the found word in scope at that site.)

- [ ] **Step 2: Standalone coin word (app.js, `handleWord` standalone branch).** Find the `coinWordReward` block (the standalone-word reward, ~line 2009, with `state.coins += coinWordReward;`). After its `state.totalCoinsEarned += coinWordReward;` (and the hive-perk block added in 2A), add:
```js
        if (!state.isDailyMode && !state.isBonusMode && typeof addLeagueXp === "function")
            addLeagueXp(LEAGUE_XP.standalone);
```

- [ ] **Step 3: Bonus word (app.js).** Run `grep -n "bonusFound.push\|bonusReward" WordPlay/wwwroot/js/app.js` to find the bonus-word handler (where a found bonus word is recorded / `state.coins += bonusReward`). At that site, in normal play, add:
```js
        if (typeof addLeagueXp === "function") addLeagueXp(LEAGUE_XP.bonusWord);
```
If the site is shared with daily/bonus modes, guard with `!state.isDailyMode && !state.isBonusMode`. If you cannot find a single clear bonus-word award site, STOP and report NEEDS_CONTEXT with the grep output.

- [ ] **Step 4: Level complete (app.js).** In the same normal-completion spot where the bee discovery hook was added (the `if (!state.isDailyMode && !state.isBonusMode) { ... recordActivityForDiscovery() ... }` block inside `advanceToNextLevel` AND `handleNextLevel`), add inside that block:
```js
            if (typeof addLeagueXp === "function") addLeagueXp(LEAGUE_XP.level);
```

- [ ] **Step 5: Honeycomb rank-up (honeycomb.js).** In `honeycombSubmit`'s `for (const ri of newRanks)` loop, after the `honeycombCoins` hive-perk coin block, add:
```js
        if (typeof addLeagueXp === "function") addLeagueXp(LEAGUE_XP.honeycombRank);
```

- [ ] **Step 6: Daily goal (quests.js).** In `tickProgress`, in the goal-claim block where `honeyPerGoal` and `recordActivityForDiscovery()` were added, add:
```js
            if (typeof addLeagueXp === "function") addLeagueXp(LEAGUE_XP.dailyGoal);
```

- [ ] **Step 7: Daily + bonus puzzle complete (app.js).** Run `grep -n "dailyPuzzle.completed = true\|dailyStreak\|exitBonusMode\|bonusPuzzle.completed" WordPlay/wwwroot/js/app.js` to find where a daily puzzle and a bonus puzzle are marked complete. At the daily-complete site add `if (typeof addLeagueXp === "function") addLeagueXp(LEAGUE_XP.dailyPuzzle);` and at the bonus-complete site add `addLeagueXp(LEAGUE_XP.bonusPuzzle);` (guarded). If a site is ambiguous, STOP and report NEEDS_CONTEXT.

- [ ] **Step 8: Verify** — `node --check` on `app.js`, `honeycomb.js`, `quests.js` (all clean). `npm test` still green.

- [ ] **Step 9: Commit**
```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/js/honeycomb.js WordPlay/wwwroot/js/quests.js
git commit -m "feat: award league xp across activities"
```

---

## Task 8: Wire Leagues into home

**Files:** `WordPlay/wwwroot/js/app.js`

- [ ] **Step 1: Screen dispatch.** In `renderCurrentScreen`, add a branch before the Honeycomb branch:
```js
    if (state.showLeague) { renderLeague(); return; }
```
And in `renderHome` near the top, beside the other early-return guards:
```js
    if (state.showLeague) { renderLeague(); return; }
```

- [ ] **Step 2: Add the Leagues button to the LEFT rail.** Find the left-rail block in `renderHome` (the `${(function(){ ... return '<div class="activity-rail activity-rail-left">' + renderActivityButton({ action: "open-honeycomb", ... }) + '</div>'; })()}` IIFE, ~line 3150). Replace its `return` so the rail holds Honeycomb (when a puzzle is ready) **and** Leagues (always):
```js
                const honeycombBtn = puzzle ? renderActivityButton({
                        action: "open-honeycomb",
                        icon: honeycombIcon(puzzle.center),
                        ringPct: ring,
                        pill: ring + "%",
                        badge: rankIdx === 6 ? "👑" : null,
                        waiting: false,
                        glow: untouched,
                        title: "Honeycomb — " + HoneycombCore.RANKS[rankIdx].name + " · " + state.honeycomb.score + " pts"
                    }) : "";
                const leagueBtn = (typeof renderLeagueRailButton === "function") ? renderLeagueRailButton() : "";
                if (!honeycombBtn && !leagueBtn) return "";
                return '<div class="activity-rail activity-rail-left">' + honeycombBtn + leagueBtn + '</div>';
```
NOTE: the lines that compute `puzzle`, `ring`, `rankIdx`, `untouched` at the top of that IIFE currently early-return `""` when `!puzzle`. Adjust so they no longer early-return on a null puzzle: guard those computations with `if (puzzle) { ... }` (compute `ring`/`rankIdx`/`untouched` only when `puzzle` exists; default them otherwise), and call `ensureHoneycombToday()` only when `puzzle`. The Leagues button must render even when the honeycomb puzzle pool hasn't loaded.

- [ ] **Step 2b: Re-read and confirm** the edited IIFE: when `puzzle` is null it still returns the Leagues-only rail; when both exist it returns both buttons; when neither, "".

- [ ] **Step 3: Click wiring.** In `renderHome`'s wiring section, after the `open-hive` block, add:
```js
    document.querySelectorAll("[data-action='open-league']").forEach(el => {
        el.addEventListener("click", () => {
            // renderLeague() handles both states: standings when signed in, sign-in invite when not.
            state.showLeague = true;
            renderLeague();
        });
    });
```

- [ ] **Step 4: Preload at startup.** Find where Slice 1 added `loadHoneycombData()` in the init path. After that block, add:
```js
        if (typeof loadLeague === "function") {
            loadLeague(false).then(() => { if (state.showHome && typeof renderHome === "function") renderHome(); });
        }
```

- [ ] **Step 5: Verify** — `node --check WordPlay/wwwroot/js/app.js` → clean. CSS brace balance still OK.

- [ ] **Step 6: Commit**
```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: leagues rail button, dispatch, wiring, startup preload"
```

---

## Task 9: Assets + service worker + version bumps

**Files:** `WordPlay/wwwroot/index.html`, `WordPlay/wwwroot/sw.js`, `WordPlay/wwwroot/js/app.js`

> Current markers: `APP_VERSION="2.0.6"`, `CACHE_NAME='wordplay-v143'`, `?v=93`, `DATA_CACHE='wordplay-data-v11'`. Bump to `2.0.7` / `wordplay-v144` / `?v=94`. `DATA_CACHE` unchanged (champion art lazy-loaded). If live markers differ, increment from actual.

- [ ] **Step 1: index.html.** Add `<script src="/js/league.js?v=94"></script>` AFTER `bee-collection.js` and BEFORE `app.js`; bump every `?v=93` → `?v=94`.
- [ ] **Step 2: sw.js.** `CACHE_NAME` → `'wordplay-v144'`; add `'/js/league.js?v=94'` to ASSETS adjacent to the other JS; bump every `?v=93` → `?v=94`; leave `DATA_CACHE`.
- [ ] **Step 3: app.js.** `APP_VERSION` → `"2.0.7"`.
- [ ] **Step 4: Verify** — `grep -rn "?v=93" WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html` → empty; `?v=94` counts equal in both; `node --check` on sw.js + app.js clean; script order `bee-collection.js` → `league.js` → `app.js`.
- [ ] **Step 5: Commit**
```bash
git add WordPlay/wwwroot/index.html WordPlay/wwwroot/sw.js WordPlay/wwwroot/js/app.js
git commit -m "chore: wire league.js asset, bump cache and version markers"
```

---

## Task 10: Docs

**Files:** `README.md`, `WordPlay/wwwroot/js/app.js` (`GUIDE_SECTIONS`)

- [ ] **Step 1: In-game guide.** Add to `GUIDE_SECTIONS` (near the Hive entry):
```js
    { icon: "🏆", title: "Weekly Leagues", body: "Tap the <b>trophy button</b> to join a weekly <b>League</b>! You earn <b>League XP</b> for everything you do — finding words, completing levels, climbing Honeycomb ranks, and finishing daily goals. Each week you're grouped with ~25 players; the <b>top finishers move up a division</b> (Clover → Blossom → Sunflower → Amber → Queen's Court) and earn coins, honey, and a shot at the exclusive <b>Champion Bee</b>. You'll need to be <b>signed in</b> to compete. A fresh league starts every week!" },
```
- [ ] **Step 2: README.** Add a "### Weekly Leagues" subsection summarizing: weekly League-XP cohorts, 5 divisions, bot-filled, ecosystem rewards + champion bee; backend in `LeagueEngine`/`LeagueLogic` (Slice 3A), client in `league.js`. Note the `leaguechampion` bee is `source: "league"`.
- [ ] **Step 3: Verify** — `node --check WordPlay/wwwroot/js/app.js`; `npm test` green.
- [ ] **Step 4: Commit**
```bash
git add README.md WordPlay/wwwroot/js/app.js
git commit -m "docs: document weekly leagues"
```

---

## Task 11: Champion bee art (run the generator)

**Files:** (generated) `WordPlay/wwwroot/images/bees/leaguechampion.webp` + `bees-manifest.json`

> Needs `FAL_KEY` in `tools/.env` (present). One image, ~$0.03. The controller (or user) runs this; the album already degrades to the tier emoji until it exists.

- [ ] **Step 1: Generate just the new image**

Run: `node tools/generate-bees.js --only "leaguechampion"`
Expected: `[1/1] leaguechampion ... ok`, then "Manifest written: 31 bees".

- [ ] **Step 2: Verify** — `node -e "const m=new Set(require('./WordPlay/wwwroot/images/bees/bees-manifest.json')); console.log(m.has('leaguechampion') ? 'present' : 'MISSING', m.size)"` → "present 31". Open `WordPlay/wwwroot/images/bees/leaguechampion.webp` and confirm it's a crowned champion bee.

- [ ] **Step 3: Commit**
```bash
git add WordPlay/wwwroot/images/bees/leaguechampion.webp WordPlay/wwwroot/images/bees/bees-manifest.json
git commit -m "feat: generate champion bee art"
```

---

## Task 12: Verification

- [ ] **Step 1: Unit + parse** — `npm test` (bee-core 31-registry + drift green); `node --check` on `league.js`, `app.js`, `honeycomb.js`, `quests.js`, `sync.js`, `sw.js`; CSS brace balance.

- [ ] **Step 2: Local end-to-end (server + browser).** The 3A endpoints are in the build; run against the migrated DB:
  1. `dotnet run --project WordPlay` (dev). Serve the app.
  2. In a browser: signed-OUT → the trophy button shows `Join`; tapping opens the sign-in invite.
  3. Sign in a test account, play a few words/levels (League XP accrues; a `POST /api/progress` carries `lxp`), then open Leagues → the standings screen lists you + ~24 bots with promotion/demotion zones, your `#rank`, and a countdown.
  4. Simulate a settlement (temporarily advance the week in a scratch build or seed a prior cohort) → reopening surfaces a celebration, applies coins/honey/champion bee, and a second open shows no repeat (idempotent via `lcw` + server `Claimed`).
  5. Confirm the rail button ring/pill reflect standing after refresh.

- [ ] **Step 3: Final commit (if fixes needed)**
```bash
git add -A
git commit -m "fix: league client verification adjustments"
```

---

## Notes / deferred

- Tuning: `LEAGUE_XP` amounts, champion bee perk, rail ring meaning (standing vs time-left), bot XP bands (3A constant).
- **Deploy:** the migration is already applied to the live DB; publishing this build makes the endpoints + client go live together. After deploy, smoke-check `/api/league/me` in production.
- No friend graph / chat / spectating (YAGNI).
