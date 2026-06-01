# Engagement Slice 2 — Bee Collection ("The Active Hive")

**Date:** 2026-06-01
**Status:** Design approved, pending spec review
**Author:** Michael Vaughn (with Claude)
**Prior slice:** `docs/plans/2026-06-01-activity-rail-honeycomb-design.md` (Slice 1, shipped)

## Context

This is **Slice 2** of the engagement roadmap (Approach A: an Activity Rail of
home-screen progress buttons, populated by minigames/meta-systems). Slice 1
shipped the reusable Activity Rail + the Honeycomb daily minigame. Slice 2 adds
the **Bee Collection**, a cozy meta-progression that rewards playing across all
activities and fills the right-rail Collection slot.

Agreed product decisions (from brainstorming):

- **Light passive perks**, not purely cosmetic — collected bees grant small
  gameplay bonuses.
- **Mix acquisition** — most bees via discovery from play, special ones via
  milestone achievements.
- **Illustrated art**, generated at build time via the existing fal-ai pipeline.
- **Medium size with rarity tiers** — ~30 bees across Common → Legendary.
- **The "Active Hive" balance mechanism** — you collect dozens of bees but only
  **3 are equipped ("active") at a time**, and only equipped bees' perks apply.
  This bounds the total bonus regardless of collection size (keeping perks fair,
  no power creep / pay-to-win), and turns the collection into a low-pressure
  loadout choice. Rarity then means *better single perks*, not *more stacked
  perks*.

Brand constraints carried from Slice 1: ad-free, older/casual audience,
additive (no punishment / loss-aversion), generous/high-contrast UI, client-side
(no backend), keep README + in-game guide in sync, follow the version-bump
release checklist.

### Existing systems this builds on

- **Activity Rail** (Slice 1): `renderActivityButton(opts)` in `app.js` and the
  `.activity-*` CSS (left/right rails). The right rail currently holds the Quest
  button; this slice adds the Collection button to it.
- **Bees already exist as a gameplay mechanic** (NOT characters): `_beesOnGrid`
  in `app.js` holds helper bees that spawn on grid cells and reveal letters when
  their word is solved (`{row, col, type:"spawned"|"queued", triggered}`). The
  Collection's "bees" are a *separate, new* concept (collectible characters with
  perks). To avoid confusion, the collectible system is named **"Hive /
  Collection"** in code and never mutates `_beesOnGrid`.
- **Per-word coin awards**: `state.coins += wordReward` at multiple sites
  (e.g. `app.js:2034` swiped words, `app.js:2214` auto-completed words). These
  are the hook points for the `coinPerWord` perk.
- **Daily goal rewards**: `quests.js` `tickProgress` pays goal rewards — hook
  point for the `honeyPerGoal` perk.
- **Honeycomb rank-ups** (Slice 1): `honeycombSubmit` in `honeycomb.js` pays
  coins on rank-up — hook point for `honeycombCoins` perk.
- **Reward popups**: `quests.js` `_showRewardPopup` / `#reward-popup` element —
  reused for the bee-discovery celebration.
- **Save/sync**: `saveProgress()` serializes abbreviated keys; `sync.js` merges
  per-field. This slice adds one key (`hv`).
- **Art pipeline**: `tools/generate-backgrounds.js` (fal-ai Flux → `sharp` →
  webp + a JSON manifest, reading prompts from a JSON file). `tools/generate-bees.js`
  clones this pattern.

## Component 1 — `bee-core.js` (pure logic, dual export, unit-tested)

Mirrors `honeycomb-core.js`: an IIFE exposing `window.HiveCore` in the browser
and `module.exports` for Node tests. No DOM references. Contains:

### The registry
`BEES` — an array of ~30 bee definitions. Each:
```js
{
  id: "worker",            // unique, also the art filename stem
  name: "Worker Bee",
  tier: "common",          // common | uncommon | rare | epic | legendary
  perk: { type: "coinPerWord", value: 1 },
  flavor: "The backbone of the hive.",
  source: "discovery"      // "discovery" | "milestone:<key>"
}
```
- `tier` controls discovery rarity weighting and perk magnitude scaling.
- `source: "discovery"` → in the discovery draw pool. `source: "milestone:<key>"`
  → unlocked only when that milestone fires (epics/legendaries lean here so each
  "tells a story"). A small number of rares may also be discovery.

### Perk types (exactly 4 in v1)
| `perk.type` | Effect | Applied at |
|---|---|---|
| `coinPerWord` | +value coins per grid word found | per-word coin award sites in `app.js` |
| `honeyPerGoal` | +value 🍯 jars per daily goal completed | `quests.js` goal-claim |
| `honeycombCoins` | +value coins per Honeycomb rank-up | `honeycombSubmit` reward loop |
| `dailyHint` | +value free hints, once per day | daily activation path |

Tier → magnitude is encoded directly in each bee's `perk.value` (no separate
scaling table needed); higher tiers carry larger single values. Values are
deliberately small (see Balance).

### Pure functions (all unit-tested)
- `getBee(id)` → registry entry or null.
- `discoveryPool()` → ids with `source === "discovery"`.
- `tierWeight(tier)` → numeric draw weight (common highest … legendary lowest).
- `pickDiscovery(ownedIds, rng)` → next bee id to discover: from
  `discoveryPool()` minus `ownedIds`, weighted by `tierWeight`; returns null when
  the pool is exhausted. `rng` is an injected `() => [0,1)` for deterministic
  tests.
- `activePerks(activeIds)` → aggregated perk totals from the equipped (≤3) bees,
  e.g. `{ coinPerWord: 2, honeyPerGoal: 0, honeycombCoins: 5, dailyHint: 0 }`.
  Ignores ids beyond the first 3 (defensive cap).
- `canEquip(hive, id)` → boolean (owned, not already active, fewer than 3 active).
- `evaluateMilestones(context)` → array of milestone bee ids whose condition is
  now satisfied and not yet owned. `context` is a plain object of facts
  (`{ honeycombRank, questsCompleted, dailyStreak, ownedCount, commonsComplete, ... }`)
  so the function stays pure and testable; the DOM layer supplies the context.
- `MAX_ACTIVE = 3` exported constant.

## Component 2 — collection state

```js
state.hive = {
  bees: [],     // discovered bee ids (monotonic — never shrinks)
  active: [],   // equipped ids, length 0..3
  seen: [],     // discovered ids the player has viewed (drives NEW badge)
  progress: 0,  // discovery counter toward next discovery
  lastHintGrant: null // "YYYY-MM-DD" the dailyHint perk last paid out (once/day guard)
};
```
- Saved under short key `hv` in `saveProgress`.
- Hydrated on load (`state.hive = d.hv || <fresh>`), with a normalizer that
  guarantees the four fields exist and `active` is capped at 3 and contains only
  owned ids.
- **Sync merge** (`sync.js`): `bees` and `seen` merge as a **union**
  (collection never lost across devices); `active` takes the local device's list
  (filtered to owned); `progress` takes the max.
- Cleared in `resetStateToDefaults()` (sign-in/account-switch), like other
  per-player state.

## Component 3 — acquisition

### Discovery (the majority)
- A single helper `recordActivityForDiscovery()` is called from existing
  completion events: level complete, Honeycomb rank-up, daily puzzle complete,
  bonus puzzle complete, and daily-goal claim.
- It increments `state.hive.progress`. When `progress >= DISCOVERY_INTERVAL`
  (e.g. 4) AND `pickDiscovery` returns a bee, it resets `progress` to 0, adds the
  bee to `state.hive.bees`, fires the discovery celebration, and persists.
- Pity/exhaustion: if `pickDiscovery` returns null (pool exhausted), `progress`
  is capped (not reset) so it doesn't spin, and no discovery fires.
- Weighting makes commons frequent and rares scarce; the player meets the bulk
  of the collection through normal play within a reasonable time.

### Milestones (the special bees)
- After events that change milestone-relevant facts, the DOM layer builds a
  `context` object and calls `evaluateMilestones(context)`; any returned ids are
  added to `state.hive.bees` with a discovery celebration tagged "milestone".
- v1 milestone conditions (each maps to existing state/events), final list tuned
  in implementation: reach Queen Bee in Honeycomb; complete a Quest (all
  milestone tiers); 7-day daily streak; reach a difficulty tier; collect all
  commons.

### Celebration
Reuses the `_showRewardPopup` pattern (or a dedicated bee-reveal modal in the
collection screen if open). Shows the bee's art, name, tier, and perk, with a
"NEW" treatment. Purely additive and delightful — never blocks play.

## Component 4 — perk application (hook points)

A single DOM-layer helper `hivePerks()` returns `activePerks(state.hive.active)`.
Applied at:
- **`coinPerWord`** — at the per-word coin award sites (`app.js:2034`, `:2214`,
  and any sibling grid-word award): add `hivePerks().coinPerWord` to the reward.
- **`honeyPerGoal`** — in `quests.js` goal-claim, add `hivePerks().honeyPerGoal`
  jars to the quest when a goal is claimed.
- **`honeycombCoins`** — in `honeycombSubmit`'s rank-up loop, add
  `hivePerks().honeycombCoins` coins per rank-up.
- **`dailyHint`** — in the daily activation path (where daily resets happen),
  grant `hivePerks().dailyHint` free hints once per calendar day (guard with a
  stored "last granted" date so it pays once/day).

All perk additions go through the existing currency/hint mutation paths so
`totalCoinsEarned`, caps, etc. stay consistent. Perks read from the live
`state.hive.active`, so equipping/unequipping takes effect immediately.

## Component 5 — album / hive screen

Full-screen view rendered into `#app`, reusing the `.quest-screen` shell + dark
scrim, opened from the right-rail Collection button.

- **Header:** "Hive" title; progress "N / TOTAL discovered" + small per-tier
  counts.
- **Active Hive row:** 3 slots showing equipped bees (or empty "+" slots).
  Tapping a slot opens a picker of owned, unequipped bees; selecting equips it;
  tapping an equipped bee offers Unequip.
- **Collection grid:** one card per registry bee, tier-colored border.
  - Owned: art thumbnail + name; a **NEW** badge until the id is in `seen`.
  - Unowned: silhouette + "?" and a short hint derived from `source`
    ("Found by playing" / the milestone description).
- **Detail view** (tap a card): large art, name, tier, perk description, flavor,
  how-obtained, and an Equip/Unequip button (disabled with a reason when the
  hive is full).
- Viewing the screen marks all currently-owned ids as `seen` (clears NEW badges
  and the rail "!" indicator).

Art is **lazy-loaded**: thumbnails/detail images are fetched on demand
(cache-first via the browser/SW runtime cache), NOT precached in the SW install,
to keep the PWA install lean. Owned-but-art-missing falls back to a
tier-colored bee emoji placeholder so the screen is always functional offline.

## Component 6 — right-rail Collection button + staggering

- Add the Collection button to the right rail (below Quest), built with
  `renderActivityButton`:
  - `action: "open-hive"`, icon = a bee/honeycomb glyph (distinct from Quest's
    bee and Honeycomb's hexagon — e.g. a framed honeycomb-cell motif),
  - `ringPct` = % of the registry discovered,
  - `pill` = `"N/TOTAL"`,
  - `glow` + a "!" badge when there is an owned-but-unviewed bee (an unviewed id
    not in `seen`),
  - `title` = "Hive — N of TOTAL bees".
- **Staggering (deferred from Slice 1):** with two buttons now on the right rail,
  implement the staggered offsets Slice 1 noted — the rail's top button sits
  above the vertical midline and the bottom below it, framing the Level button
  rather than pinching it on narrow (≤360px) screens. The left rail (Honeycomb,
  single button) is unchanged until Leagues lands.
- Dispatch: add `if (state.showHive) { renderHive(); return; }` to
  `renderCurrentScreen` and the `renderHome` early-return guard (alongside the
  existing Honeycomb/Quest checks). Wire `data-action="open-hive"` clicks to set
  `state.showHive = true` and render.

## Component 7 — art generator `tools/generate-bees.js`

Clone of `tools/generate-backgrounds.js`:
- Reads `tools/bee-prompts.json` (`{ id: { desc, palette } }` keyed by registry
  id; the set of ids must match `bee-core.js`'s registry).
- Generates each via fal-ai Flux, `sharp` → small square webp (e.g. 384×384,
  quality ~80), writes `WordPlay/wwwroot/images/bees/<id>.webp` and a
  `bees-manifest.json` listing available art.
- Supports `--dry-run`, `--only "<id>,<id>"`, `--manifest` like the background
  tool. Skips ids whose webp already exists (idempotent, incremental).
- **Sequenced last:** the gameplay is built and tested against emoji placeholders
  first; real art is generated as the final implementation step. Missing art is
  always handled gracefully (placeholder fallback).

## State, persistence, sync (summary)

- New: `state.hive` (key `hv`) + `state.showHive` (transient).
- New: a per-day "last daily-hint grant" marker for the `dailyHint` perk
  (e.g. `state.hive.lastHintGrant = "YYYY-MM-DD"`, inside the hive object so it
  rides the same save/sync).
- Sync: union-merge `bees`/`seen`, max `progress`, local `active`.

## Release / housekeeping checklist

- New files: `WordPlay/wwwroot/js/bee-core.js`, `WordPlay/wwwroot/js/bee-collection.js`
  → `<script>` in `index.html` (bee-core before bee-collection, both before
  `app.js`) and in `sw.js` ASSETS, all with the bumped `?v=`.
- Bee art webps + `bees-manifest.json` are NOT added to the SW precache ASSETS
  (lazy-loaded); they live in `wwwroot/images/bees/`.
- Bump `APP_VERSION`, `CACHE_NAME`, `?v=` (both files). Bump `DATA_CACHE` only if
  a precached data file changes (the bee registry lives in JS, art is
  lazy-loaded, so `DATA_CACHE` likely does NOT change — confirm during
  implementation).
- Update `README.md` and the in-game `GUIDE_SECTIONS` (keep in sync).

## Testing strategy (TDD)

Pure `bee-core.js` logic is written test-first:
- **Perk aggregation:** `activePerks` sums equipped perks correctly; ignores a
  4th+ id; empty hive → all-zero.
- **Equip rules:** `canEquip` enforces owned + not-active + <3-active.
- **Discovery selection:** `pickDiscovery` excludes owned, respects the discovery
  pool, is weighted (statistical check with a seeded rng), returns null on
  exhaustion.
- **Milestones:** `evaluateMilestones` returns exactly the satisfied,
  not-yet-owned ids for representative contexts; never returns discovery-only
  bees.
- **Registry validation test:** every bee has a unique id, a valid tier, a perk
  whose `type` is one of the 4 supported, a non-empty name/flavor, and a `source`
  that is `discovery` or `milestone:<known-key>`; milestone keys referenced by
  bees are all handled by `evaluateMilestones`.

DOM/screen behavior (album, equip, discovery celebration, rail button) is
verified manually in the running app, plus a browser-driven smoke check like the
Slice 1 verification (open hive, equip a bee, confirm a perk applies).

## Scope & sequencing note

This slice is larger than Slice 1 (registry + perks + acquisition hooks + album
UI + equip + art pipeline + rail staggering). It remains one cohesive feature and
one spec, but the implementation plan will be long. Recommended build order keeps
each step shippable/testable:
1. `bee-core.js` registry + pure logic (TDD) with a small starter registry.
2. Collection state + save/load/sync + normalizer.
3. Perk application hook points (with tests on the pure aggregation; manual on
   the hooks).
4. Acquisition (discovery counter + milestone evaluation) wired to events.
5. Album/hive screen + equip UI (emoji placeholder art).
6. Right-rail Collection button + staggering + dispatch/wiring.
7. Expand the registry to the full ~30 and add `tools/generate-bees.js`; generate
   art last.
8. Docs + release-checklist bumps + verification.

## Out of scope (future)

- **Weekly Leagues** (Slice 3) — the left-rail Leagues slot; needs the .NET
  backend; its own spec.
- Trading/gifting bees, seasonal/event bees, bee leveling/XP — explicitly not in
  v1 (YAGNI). The registry/tier structure leaves room to add them later.

## Open questions / decisions deferred to implementation

- Final perk `value`s per tier and `DISCOVERY_INTERVAL` (balance tuning).
- Final milestone condition list and which bees are discovery vs milestone.
- Exact Collection button icon/glyph.
- Art dimensions/quality and the visual style prompt for `generate-bees.js`.
- Whether the daily-hint grant should also nudge the player (a small toast) or
  apply silently.
