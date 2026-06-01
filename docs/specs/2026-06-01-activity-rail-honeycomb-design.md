# Engagement Slice 1 — Activity Rail + Honeycomb

**Date:** 2026-06-01
**Status:** Design approved, pending spec review
**Author:** Michael Vaughn (with Claude)

## Context

WordPlay already runs several simultaneous engagement loops: main level
progression, a Daily Puzzle (with 7-day streak), an occasional Bonus Puzzle
(star collection), multi-day Quests ("fill the hive with honey jars"), and 3
deterministic Daily Goals/day that feed the active Quest. These have landed
well.

The goal of this work is to add **more quest-like, simultaneous challenges**
to keep players engaged, specifically targeting all four engagement levers:
daily return, longer sessions, novelty/variety, and social/competition. The
agreed product direction (Approach A) is:

1. A reusable **Activity Rail** of round progress buttons on both screen edges
   (generalizing the existing Quest side button).
2. **Honeycomb** — a daily Spelling-Bee-style minigame (novelty + daily return
   + longer sessions). On-theme with the bee/hive motif.
3. **Bee Collection** — a cozy meta-collection hook (later slice).
4. **Weekly Leagues** — a Duolingo-style social/competition system (later slice,
   requires backend).

This spec covers **Slice 1 only: the Activity Rail framework + Honeycomb.**
Collection and Leagues are explicitly out of scope here and will each get their
own spec → plan → build cycle. The rails are designed to accept them without
rework.

### Why these decisions were made

- **Buttons, not a hub.** The home screen already uses a round
  button-with-progress-ring pattern for Quests (`.quest-side-btn` +
  `.quest-progress-ring`). The user wants to extend that pattern — more round
  buttons on both the left and right edges, each an entry point *and* an
  at-a-glance progress indicator — rather than collapse everything behind one
  hub button. Final layout: **Left rail** = Honeycomb + (later) Leagues;
  **Right rail** = Quest + (later) Collection.
- **Icon-only buttons.** No text captions under buttons (user decision). Each
  activity teaches its identity through its own full screen and a distinctive
  icon. Honeycomb mitigates the no-label risk with a hexagon icon containing the
  day's center letter.
- **Precomputed puzzle data.** There is no general-purpose dictionary loaded at
  runtime — bonus words are pre-baked per level (`app.js:282`,
  `bonusPool = [...(level.bonus || [])]`). Honeycomb follows the same
  architecture: puzzles (and their full valid-word sets) are precomputed by a
  build tool into a JSON data file, fetched on demand and cached. No backend
  required.
- **Accessibility / fair word lists.** Honeycomb answer sets are generated from
  `tools/casual-dict.txt` (27K common words), not `enable1.txt` (80K
  Scrabble-only), so required words stay fair for an older/casual audience and
  daily totals stay reasonable.
- **Additive, not punishing.** Rewards are purely additive (no streak-loss,
  no FOMO penalty), consistent with the ad-free, relaxed brand. Daily refresh
  supplies the return pull without anxiety.

## Existing patterns this builds on

- **Quest side button:** `renderQuestSideButton(q, qDef)` in `app.js` (~2939)
  and CSS `.quest-side-rail` / `.quest-side-btn` / `.quest-progress-ring` /
  `.quest-side-pct` in `app.css` (~2798–2895). SVG progress ring math:
  `r=30`, circumference `188.5`, `dashOffset = CIRCUM - CIRCUM * pct/100`.
- **Daily-resetting state:** `state.dailyPuzzle` resets when its `date` !==
  today (`app.js` ~1071). Honeycomb mirrors this reset pattern.
- **Deterministic daily selection:** date-hashed selection already used for the
  daily puzzle and for daily goals (`_hashStr` + `_seededRandom` in
  `quests.js`). Honeycomb picks today's puzzle from a pool the same way.
- **Precomputed data loading:** `level-loader.js` (`fetch("data/...")`,
  in-memory chunk cache, `DATA_CACHE` in `sw.js`). Honeycomb adds one data file
  on the same pattern.
- **Reward popups:** `_showRewardPopup` / `_renderPopupHtml` /
  `#reward-popup` element (`quests.js` ~306–356). Honeycomb reuses this.
- **Save/sync:** `saveProgress()` serializes explicit short keys (`dp`, `ls`,
  `ds`, …) and `sync.js` mirrors them. Honeycomb adds one key (`hc`).

## Component 1 — Activity Rail framework

### Purpose
A reusable round progress button and a left/right rail layout, so the home
screen can host multiple simultaneous activities consistently and without
clutter.

### Interface
- `renderActivityButton(opts)` returns the button HTML.
  - `opts.icon` — string (emoji) or HTML (e.g., the Honeycomb hex SVG).
  - `opts.ringPct` — 0–100, fills the SVG progress ring.
  - `opts.pill` — short status text shown in the pill (e.g., `"72%"`,
    `"Queen"`, `"💤"`). Optional.
  - `opts.glow` — boolean; when true the button runs the attention pulse.
    Default false (calm).
  - `opts.action` — `data-action` value used by the existing delegated click
    handler.
  - `opts.title` — tooltip / accessibility title.
- `renderQuestSideButton` is refactored to call `renderActivityButton` and
  must produce visually identical output (no behavior change).

### Layout
- Keep `.activity-rail-right` (rename of `.quest-side-rail`, or add an alias so
  existing references keep working) and add a mirrored `.activity-rail-left`
  (`left: 10px`).
- **Staggered vertical framing:** within each rail, the top button sits above
  the vertical midline and the bottom button below it, so the rails frame the
  center Level button rather than pinching it. Concretely, the rail is no longer
  strictly centered; top and bottom slots are offset (e.g., top slot ~38% from
  top, bottom slot ~62%). Exact offsets tuned during implementation against the
  360px-wide worst case.
- Both rails are `pointer-events: none` containers with `pointer-events: auto`
  buttons (as today), so they never block taps on the Level button between them.

### Glow policy
- The `questBtnGlow` animation (renamed `activityBtnGlow`, shared) runs **only**
  when a button is actionable: a reward is ready to claim, or today's activity
  has not yet been started. Non-actionable buttons sit still.
- Continues to honor `@media (prefers-reduced-motion: reduce)`.

### Slot assignment (this slice)
- Right rail: **Quest** (existing). Collection slot empty until Slice 2.
- Left rail: **Honeycomb** (new). Leagues slot empty until Slice 3.

## Component 2 — Honeycomb minigame

### Mechanic
- 7 letters, one **required center letter**. Player builds words from those 7
  letters (letters may be reused within a word).
- Validity rules: length ≥ 4; must contain the center letter; must be in the
  puzzle's precomputed valid-word set; not already found.
- **Scoring:**
  - 4-letter word = 1 point.
  - 5+ letter word = its length in points.
  - **Pangram** (uses all 7 distinct letters at least once) = length + 7 bonus.
- **Ranks:** score climbs a ladder, each rank defined as a percentage of the
  puzzle's `maxScore`. Working rank set (names final in implementation):

  | Rank      | % of maxScore |
  |-----------|---------------|
  | Worker    | 0%            |
  | Forager   | 10%           |
  | Builder   | 20%           |
  | Drone     | 35%           |
  | Keeper    | 50%           |
  | Royal     | 70%           |
  | Queen Bee | 90%           |

  Thresholds are computed as `ceil(maxScore * pct)`. The button ring fills as
  `min(100, score / queenBeeThreshold * 100)`.

### Daily selection
- Today's puzzle is chosen deterministically from the puzzle pool by date, using
  the same hash approach as the daily puzzle (`_hashStr(today) % poolLength`),
  so it is identical for all players and requires no server. Pool is large
  enough (365+) that repeats are far apart.

### Screen
A full-screen view rendered into `#app`, styled like the Quest screen and
inheriting the dark scrim (`.quest-screen::before` pattern) so it reads cleanly
over the game background. Elements:
- Hex letter cluster: 6 outer letters + 1 visually distinct center letter; tap
  to append to the current word.
- Current-word line (the letters being assembled).
- Controls: **Delete** (remove last letter), **Shuffle** (rearrange the outer 6
  only — center stays put), **Enter** (submit).
- Found-words list with a running count.
- Rank progress bar with labeled thresholds + live score.
- Close button (returns to home), matching `.quest-close`.

### Feedback
- Valid word: pop animation + "+N" points, word added to list.
- Pangram: a louder **Pangram!** celebration.
- Gentle nudges (non-blocking) for: too short, missing center letter, not a
  word, already found.
- Rank-up triggers a reward popup via the existing `_showRewardPopup` pattern.

### Input
- Primary input is tapping the hex letters. Physical-keyboard typing MAY be
  supported as a convenience (type letters, Enter to submit, Backspace to
  delete) but is not required for v1 and must never trap focus or interfere with
  the tap flow.

## Component 3 — Puzzle data + generator

### Generator: `tools/honeycomb-generator.js`
- Reads `tools/casual-dict.txt`.
- Enumerates candidate letter sets: pick 7 distinct letters that include at
  least one **pangram** word (a casual-dict word using exactly those 7 distinct
  letters). For each, choose the center letter and compute the full valid-word
  set (all casual-dict words of length ≥ 4 that contain the center letter and
  use only the 7 letters).
- **Quality filters:** word-set size within a sane band (target ~20–50;
  tunable), at least one pangram, exclude sets whose only words are obscure.
  Avoid letter sets dominated by a single trivial stem.
- Output: `WordPlay/wwwroot/data/honeycomb.json`:
  ```json
  {
    "version": 1,
    "puzzles": [
      {
        "letters": "AEGLNRT",
        "center": "G",
        "words": ["ANGLE", "GENERAL", "..."],
        "pangrams": ["TRIANGLE"],
        "maxScore": 213
      }
    ]
  }
  ```
- `letters` is the 7-letter set (center included); `words` is the full answer
  set (uppercase); `maxScore` is precomputed from the scoring rules so the
  client never has to sum the whole list.
- Pool size target: 365+ puzzles.

### Client loader
- A small loader (in `honeycomb.js`) fetches `data/honeycomb.json` once, caches
  it in memory, and exposes `getTodaysPuzzle()` (date-hashed pick) and helpers
  for validation/scoring. Mirrors `level-loader.js` style. Graceful no-op if the
  file is missing (button simply doesn't render).

## State, persistence, sync

- New state slice:
  ```js
  state.honeycomb = {
    date: "YYYY-MM-DD",   // the puzzle day this applies to
    found: [],            // words found today (uppercase)
    score: 0,             // today's score
    ranksClaimed: []      // indices of rank rewards already paid
  };
  ```
- **Daily reset:** in the same place `dailyPuzzle` is reset (`app.js` ~1071),
  if `state.honeycomb.date !== getTodayStr()` reset it to a fresh empty object
  for today.
- **Save:** add a short key `hc` to the object built in `saveProgress()`.
- **Load:** hydrate `state.honeycomb` from `d.hc` (with a safe default).
- **Sync:** add `hc` to the `sync.js` payload so progress follows the account.
  Conflict handling follows whatever merge strategy sync already uses for
  per-day state like `dp`; if last-write-wins is the norm, that is acceptable
  for a daily puzzle.

## Economy & synergy

- **Rank-up rewards** (additive; exact values finalized in implementation,
  starting point below):
  - Each rank from Forager upward pays a small **coin** reward.
  - Reaching the upper ranks (e.g., Royal, Queen Bee) also drops **🍯 jars**
    into the active Quest via the existing jar mechanism, so Honeycomb *feeds*
    the Quest loop.
  - Values tuned to be meaningful but not inflationary relative to per-level
    coin earnings.
- Rewards are paid once per rank per day (tracked by `ranksClaimed`),
  idempotently, so re-entering the screen never double-pays.
- **Optional (note, not committed):** Honeycomb word finds could emit a tick
  event to advance Quest daily goals. Deferred to avoid double-dipping; revisit
  after launch.

## Release / housekeeping checklist (per project rules)

- New file `WordPlay/wwwroot/js/honeycomb.js` wired into `index.html` (script
  tag with `?v=`) and `sw.js` ASSETS (matching `?v=`).
- New data file `WordPlay/wwwroot/data/honeycomb.json` added to `sw.js` ASSETS.
- Bump **`APP_VERSION`** (`app.js`), **`CACHE_NAME`** (`sw.js`), the **`?v=`**
  query strings in both `sw.js` and `index.html`, and **`DATA_CACHE`** (`sw.js`)
  because a data file was added.
- Update **`README.md`** (developer-facing) and the in-game **`GUIDE_SECTIONS`**
  array in `app.js` (player-facing) to document Honeycomb. Keep them in sync.

## Testing strategy (TDD)

Pure logic is written test-first:
- **Scoring:** 4-letter = 1; 5+ = length; pangram = length + 7. Edge cases:
  exactly 4 letters, long words, pangram detection (all 7 distinct letters
  present).
- **Validation:** rejects < 4 letters, words missing the center letter, words
  using letters outside the set, words not in the answer set, and duplicates.
- **Rank thresholds:** correct `ceil(maxScore * pct)` boundaries; ring percent
  caps at 100 at the Queen Bee threshold.
- **Daily selection:** deterministic for a given date; stable across reloads;
  distributes across the pool.
- **Reward idempotency:** re-running rank checks never double-pays
  `ranksClaimed`.

Generator output is validated by a script/test: every puzzle has ≥1 pangram, a
non-empty `words` set, all words satisfy the validity rules, and `maxScore`
equals the sum computed from `words`.

UI/screen behavior is verified manually in-app (run the app, play the day's
Honeycomb) since it is DOM/interaction heavy.

## Out of scope (future slices)

- **Bee Collection** (Slice 2) — meta-collection that rewards play across
  activities; fills the right-rail Collection slot.
- **Weekly Leagues** (Slice 3) — backend cohort/scoring/promotion system; fills
  the left-rail Leagues slot. Requires .NET server work and manual SQL
  migrations.

## Open questions / decisions deferred to implementation

- Final rank names and exact percentage thresholds (table above is the starting
  point).
- Exact coin/jar reward values per rank.
- Whether to support physical-keyboard typing in v1.
- Final Honeycomb button icon treatment (hexagon SVG with center letter is the
  proposed default).
