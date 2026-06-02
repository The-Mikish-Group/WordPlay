# Engagement Slice 3B — Weekly Leagues Client

**Date:** 2026-06-01
**Status:** Design approved, pending spec review
**Author:** Michael Vaughn (with Claude)
**Builds on:** Slice 3A (`docs/plans/2026-06-01-weekly-leagues-3a-engine-design.md`, engine shipped + migration applied to the live DB). This is the client half — what finally surfaces Leagues to players.

## Context

Slice 3A shipped the backend League engine: per-week cohorts across a 5-division
bee-themed ladder, filled with virtual bots, lazy settlement, and the API
(`GET /api/league/me`, `POST /api/league/claim`). It ingests a `lxp` (League XP)
value from the progress sync but **no client earns or shows it yet**. Slice 3B
adds: the XP-earning hooks, the rail button, the standings screen, the
reward/promotion claim flow, the sign-in invite for signed-out players, and the
`leaguechampion` reward bee (registry + art).

Agreed product decisions (brainstorming):
- **Show + invite sign-in:** the Leagues button is always visible; tapping it
  while signed out opens a friendly "sign in to join" prompt.
- **Per-word granular XP:** award League XP at the moments already rewarded
  (per word found + length/bonus bumps, plus level/Honeycomb/goal/puzzle).
- **Generate real art** for the `leaguechampion` bee via the existing tool.

Brand constraints carried forward: ad-free, older/casual audience, additive,
generous/legible UI, keep README + in-game guide in sync, follow the version-bump
release checklist.

### Existing client this builds on
- **Auth + sync** (`WordPlay/wwwroot/js/sync.js`): `isSignedIn()`, `getAuthHeaders()`
  (Bearer token), `_handleAuthExpired()` on 401, `getUser()`. League calls mirror
  `syncPush`/`syncPull` exactly: `fetch("/api/league/me", { headers: getAuthHeaders() })`.
- **Save blob**: `localStorage["wordplay-save"]` is the `saveProgress()` payload
  (abbreviated keys: `co`, `tce`, `hc`, `hv`, …). Adding `lxp` to that payload is
  all that's needed for the server to receive League XP (the existing blob push
  carries it; 3A already ingests `lxp`).
- **Activity Rail** (Slice 1): `renderActivityButton(opts)` + `.activity-*` CSS;
  the left rail currently holds the Honeycomb button; the right rail holds Quest +
  Collection (staggered). This slice adds Leagues to the left rail and staggers it.
- **Reward plumbing**: `quests.js` `_showRewardPopup` (exposed), and
  `bee-collection.js` `grantBee(id, label)` (used to grant the champion bee).
- **Bee Collection** (Slice 2A/2B): `bee-core.js` registry + `evaluateMilestones`
  + the album rendering (`beeArt`, locked-card hints); `tools/generate-bees.js` +
  `tools/bee-prompts.json` + `wwwroot/images/bees/` for art.
- **XP hook sites** (already touched by bees/perks): per-word coin awards in
  `app.js` (`handleWord` ~2034, `checkAutoCompleteWords` ~2214), `honeycombSubmit`
  rank-up loop (`honeycomb.js`), `quests.js` goal-claim, the level-complete paths
  (`advanceToNextLevel`/`handleNextLevel`), daily/bonus completion.

## Component 1 — `league.js` (new browser-global module)

Loads after `bee-collection.js` and before `app.js`. Uses globals: `state`,
`saveProgress`, `isSignedIn`, `getAuthHeaders`, `getUser`, `_handleAuthExpired`,
`renderActivityButton`, `renderHome`, `grantBee`, and `window.quests._showRewardPopup`.

State + cache:
```js
let _leagueCache = null;       // last /api/league/me response
let _leagueFetchedAt = 0;      // ms timestamp of last successful fetch
const LEAGUE_TTL = 3 * 60_000; // refetch if older than 3 min
```

Functions:
- `addLeagueXp(n)` — `state.leagueXp = (state.leagueXp || 0) + n;` (persisted by the
  normal `saveProgress`). Pure increment; no network.
- `loadLeague(force)` — if signed out, returns null. Else `fetch("/api/league/me")`
  with auth; on 401 `_handleAuthExpired()`; on ok, cache the JSON + timestamp; if it
  has `pendingResults`, run `claimAndCelebrate(...)`. Skips the fetch if cache is
  fresh (< TTL) unless `force`.
- `claimLeague()` — `POST /api/league/claim` with auth; returns `{claimed}`.
- `claimAndCelebrate(results)` — for each pending result: apply rewards locally
  (`state.coins`/`state.totalCoinsEarned += RewardCoins`; honey → `state.quest.jars`
  if a quest is active; if `rewardBeeId` → `grantBee(rewardBeeId, "League prize!")`),
  show a celebration via the reward popup, then `saveProgress()` + `claimLeague()`.
  Guard so it runs once per result set.
- `renderLeagueRailButton()` — Component 3.
- `renderLeague()` + interaction — Component 4.

## Component 2 — League XP earning hooks

`addLeagueXp(n)` calls are added (guarded `typeof addLeagueXp === "function"`,
since `league.js` loads before `app.js` but the calls run at gameplay time) at:
- `app.js` per-word award sites: `+2` per grid word, `+1` extra for length ≥ 5;
  standalone coin word `+10`. (Normal play only — not daily/bonus, consistent with
  the per-word coin perk guard.)
- Bonus word found: `+3` (where `state.bonusFound` grows / the bonus-word reward
  fires).
- `honeycomb.js` `honeycombSubmit` rank-up loop: `+15` per newly reached rank.
- `quests.js` goal-claim: `+10` per claimed daily goal.
- level complete (`advanceToNextLevel`/`handleNextLevel`, the same `!isReplay`,
  non-daily/bonus spot as the bee discovery hook): `+10`.
- daily puzzle complete `+20`; bonus puzzle complete `+15` (at their completion
  sites).

`state.leagueXp` is added to `app.js` state init (`leagueXp: 0`) and to the
`saveProgress` payload as `lxp: state.leagueXp`. It's monotonic (only ever
incremented); the server applies the ratchet + 50k/week cap. No load-time hydration
beyond the standard `state.leagueXp = d.lxp || 0`.

All amounts are tunable constants (a small `LEAGUE_XP` map in `league.js`).

## Component 3 — Leagues rail button (left rail + staggering)

`renderLeagueRailButton()` returns a `renderActivityButton`:
- **Signed out:** `icon: "🏆"`, `pill: "Join"`, no glow, `action: "open-league"`,
  title "Leagues — sign in to join".
- **Signed in, cache ready:** `icon: "🏆"` (optionally tinted by division),
  `ringPct` = standing = `round((count - rank) / max(1, count - 1) * 100)` (rank 1 →
  100, last → 0), `pill: "#<rank>"`, `glow` + `badge:"!"` when the cache has unclaimed
  `pendingResults`, title "Leagues — <divisionName>, #<rank> of <count>".
- **Signed in, not ready** (no cache yet / `ready:false`): `pill: "—"`, no glow.

In `renderHome`, the left rail now renders **Honeycomb + Leagues**; switch the left
rail to the staggered offsets (mirroring the right rail's Slice-2A stagger) so the
two buttons frame the Level button. Wire `data-action="open-league"`:
- signed out → open the sign-in invite (Component 7);
- signed in → `state.showLeague = true; renderLeague();`.

## Component 4 — Leagues standings screen

Full-screen (reuses `.quest-screen` shell + dark scrim), `renderLeague()` into `#app`:
- On open, call `loadLeague(true)`; show a light "Loading league…" state until the
  cache resolves, then render.
- Header: division name + 🏆, a **countdown** to reset (format `secondsToReset` →
  "Nd Nh left").
- Your-standing banner: "You're **#<rank>** of <count> in **<divisionName>**".
- Standings list from `standings[]`: each row = position, avatar (`renderAvatar`
  for the emoji/image), name, weekly XP; **you** highlighted. The **top `promoteRank`**
  rows get a green "promotion zone" treatment; rows at/below `demoteRank` get a red
  "demotion zone" treatment. Bots and real players render identically.
- A close button (returns home) + a manual refresh affordance (re-`loadLeague(true)`).
- If `ready:false` (player not yet placed — e.g. brand new, hasn't synced), show a
  friendly "Your league starts after your next sync — keep playing!" message.

## Component 5 — reward claim + celebration (detail)

`loadLeague` triggers `claimAndCelebrate(pendingResults)` whenever results are
present (on app init and on screen open). For each result:
1. Apply locally: coins (`state.coins`, `state.totalCoinsEarned`), honey
   (`state.quest.jars` if `state.quest`), bee (`grantBee(rewardBeeId, ...)` if set).
2. Queue a celebration popup ("Finished **#<rank>** in <divisionName> — **<Outcome>**!
   +<coins> 🪙 +<honey> 🍯" and "New bee!" if a bee dropped) via the existing reward
   popup.
3. After applying all, `saveProgress()` then `POST /api/league/claim`. If the claim
   POST fails (offline), the rewards are already applied locally; the next
   `loadLeague` will see the results still unclaimed server-side and could re-apply —
   so guard `claimAndCelebrate` to no-op for results whose `weekId` is already in a
   small client-side `state.leagueClaimedWeeks` set (added to the save blob as `lcw`),
   making local application idempotent even if the server claim didn't land.

This double-guard (server `Claimed` flag + client `lcw` set) prevents double-credit
across the client-authoritative boundary.

## Component 6 — `leaguechampion` bee

- `bee-core.js`: add to `BEES`:
  `{ id:"leaguechampion", name:"Champion Bee", tier:"legendary", perk:{type:"coinPerWord", value:4}, flavor:"Crowned victor of a weekly league.", source:"league" }`.
  Registry length → 31 (legendary 3 → 4). Allow `"league"` as a valid `source` in the
  registry-validation test and ensure it is **excluded** from `discoveryPool()` (only
  `source === "discovery"` is included — already true) and never returned by
  `evaluateMilestones` (only `milestone:` sources — already true). No new predicate.
- `bee-collection.js`: the locked-card hint for `source === "league"` reads "Win a
  weekly league". Granting happens via `grantBee("leaguechampion", …)` in the reward
  flow (Component 5).
- Art: add a `leaguechampion` entry to `tools/bee-prompts.json` (cartoon mascot, a
  crowned champion bee holding a tiny trophy) and run `node tools/generate-bees.js`
  (generates the one missing image + updates `bees-manifest.json`). Lazy-loaded like
  the other 30. Champion bee perk value is tunable.

## Component 7 — sign-in invite (signed-out)

Tapping Leagues while signed out shows a small modal/prompt: "Sign in to join this
week's league and climb the divisions!" with the existing sign-in entry point (open
Settings sign-in, or the inline Google/Microsoft buttons used elsewhere — reuse the
current sign-in flow; no new auth code). Dismissable.

## Component 8 — persistence, fetch cadence, caching

- `state.leagueXp` saved as `lxp`; `state.leagueClaimedWeeks` saved as `lcw` (array);
  hydrated on load with safe defaults. Both ride the existing blob sync.
- `loadLeague()` called once on app init (if signed in; non-blocking, like the
  honeycomb preload) so the rail button can render a standing, and on screen open
  (`force`). In-memory cache + 3-min TTL avoids a network hit on every home visit.
- All league fetches gated on `isSignedIn()`; 401 → `_handleAuthExpired()`.
- Sync merge: `lxp` takes the max (monotonic); `lcw` unions (never lose a claimed
  marker). Added to `sync.js` alongside the other merges.

## Release / housekeeping

- New `league.js` → `<script>` in `index.html` (after `bee-collection.js`, before
  `app.js`) + `sw.js` ASSETS, with the bumped `?v=`. Bump `APP_VERSION`,
  `CACHE_NAME`, `?v=`. `DATA_CACHE` unchanged (champion art lazy-loaded; no precached
  data file added).
- README + in-game `GUIDE_SECTIONS` get a Leagues entry.

## Testing

- `bee-core.js`: unit tests updated — registry length 31, tier counts 8/8/7/4/4,
  `"league"` source accepted by validation, `leaguechampion` excluded from the
  discovery pool and from milestone evaluation, drift test includes the new prompt.
- `addLeagueXp` and the reward-apply mapping (a small pure helper that turns a
  pending result into the coin/honey/bee deltas) get light unit coverage where they
  can be made dependency-free.
- The screen, rail button, fetch cadence, and claim flow are verified manually /
  via a browser-driven run (Component "Verification" below).

## Verification

The new endpoints aren't on production yet, but a local `dotnet run` build has them.
Verify the full client→API loop locally against the already-migrated production DB
(or a dev DB): run the server, sign in a test account, and confirm the rail button
shows a division/rank, the standings screen lists you + bots with zones, a simulated
settlement surfaces a `pendingResults` celebration that applies rewards + grants the
champion bee at rank 1, and `claim` clears it (no double-credit on a second open).

## Out of scope / future

- No friend/social graph, no cross-division spectating, no league chat (YAGNI).
- Tuning: the `LEAGUE_XP` amounts, the champion bee perk, the rail ring meaning
  (currently standing; could switch to time-left), and bot XP bands (a 3A constant).
- After 3B, the full deploy is: ensure `docs/sql/AddLeagues.sql` is applied (done),
  then publish the new build so the endpoints + client go live together.

## Open questions / decisions deferred to implementation

- Final `LEAGUE_XP` award amounts and the champion bee perk value.
- Whether the sign-in invite opens Settings or shows inline provider buttons (pick
  whichever matches the existing sign-in entry with least new code).
- Exact countdown formatting and the standings row layout density for older eyes.
