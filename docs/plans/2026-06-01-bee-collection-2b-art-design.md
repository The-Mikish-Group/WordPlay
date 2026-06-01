# Engagement Slice 2B — Bee Collection Illustrated Art

**Date:** 2026-06-01
**Status:** Design approved, pending spec review
**Author:** Michael Vaughn (with Claude)
**Builds on:** Slice 2A (`docs/plans/2026-06-01-bee-collection-2a-system-plan.md`, shipped) and its design (`...-active-hive-design.md`).

## Context

Slice 2A shipped the full Bee Collection "Active Hive" gameplay system running on
tier-emoji placeholders, with an 8-bee starter registry. Slice 2B replaces the
placeholders with **illustrated bee art** and expands the registry to the agreed
**30-bee roster**. It clones the project's existing image pipeline
(`tools/generate-backgrounds.js`: prompts JSON → `fal-ai/flux-2-pro` → `sharp`
webp → manifest, idempotent).

Agreed decisions (from brainstorming):
- **Art style:** cute cartoon mascot bees, each in a small circular habitat scene.
- **Image treatment:** circular portrait + scene, square canvas.
- **Roster:** designed collaboratively (below), 30 bees across 5 tiers.
- **Generation:** the user runs `node tools/generate-bees.js` with their own
  `FAL_KEY` (in `tools/.env`). Claude builds the tool, prompts, registry,
  rendering, and tests; the gameplay is fully testable on placeholders before any
  image exists.

Brand constraints carried forward: cozy/relaxed, older/casual audience, ad-free,
client-side, generous/legible UI, keep README + in-game guide in sync, follow the
version-bump release checklist.

## The 30-bee roster (agreed)

Perk types (from 2A): `coinPerWord`, `honeyPerGoal`, `honeycombCoins`, `dailyHint`.
Values scale with tier; `dailyHint` is the strongest perk so it stays scarce
(uncommon/rare only). Discovery = common/uncommon/rare; milestone = epic/legendary.
`★` marks bees already in the 2A registry (unchanged).

### Common (8) — `source: discovery`, value 1
| id | name | perk |
|----|------|------|
| `worker` ★ | Worker Bee | coinPerWord 1 |
| `forager` ★ | Forager Bee | honeyPerGoal 1 |
| `gleaner` | Gleaner Bee | coinPerWord 1 |
| `clover` | Clover Bee | honeyPerGoal 1 |
| `dewdrop` | Dewdrop Bee | honeycombCoins 1 |
| `sprig` | Sprig Bee | honeycombCoins 1 |
| `pollen` | Pollen Bee | coinPerWord 1 |
| `blossom` | Blossom Bee | honeyPerGoal 1 |

### Uncommon (8) — `source: discovery`, value 2 (+ dailyHint)
| id | name | perk |
|----|------|------|
| `scout` ★ | Scout Bee | honeycombCoins 2 |
| `nurse` ★ | Nurse Bee | dailyHint 1 |
| `dancer` | Dancer Bee | coinPerWord 2 |
| `gardener` | Gardener Bee | honeyPerGoal 2 |
| `thistle` | Thistle Bee | honeycombCoins 2 |
| `lavender` | Lavender Bee | honeyPerGoal 2 |
| `sunflower` | Sunflower Bee | coinPerWord 2 |
| `bramble` | Bramble Bee | honeycombCoins 2 |

### Rare (7) — `source: discovery`, value 2–3
| id | name | perk |
|----|------|------|
| `drone` ★ | Drone Bee | coinPerWord 2 |
| `sentinel` ★ | Sentinel Bee | honeyPerGoal 2 |
| `amber` | Amber Bee | coinPerWord 3 |
| `nectarine` | Nectarine Bee | honeyPerGoal 3 |
| `honeydew` | Honeydew Bee | honeycombCoins 3 |
| `dusk` | Dusk Bee | dailyHint 1 |
| `marigold` | Marigold Bee | coinPerWord 3 |

### Epic (4) — `source: milestone`, strong single perk
| id | name | perk | milestone (`source`) |
|----|------|------|-----------|
| `regent` ★ | Regent Bee | honeycombCoins 5 | `milestone:honeycombQueen` |
| `warden` | Warden Bee | honeyPerGoal 4 | `milestone:dailyStreak7` |
| `artisan` | Artisan Bee | honeycombCoins 5 | `milestone:tierHard` |
| `luminary` | Luminary Bee | coinPerWord 4 | `milestone:reachLevel500` |

### Legendary (3) — `source: milestone`, crown jewels
| id | name | perk | milestone (`source`) |
|----|------|------|-----------|
| `monarch` ★ | Monarch Bee | coinPerWord 3 | `milestone:questComplete` |
| `empress` | Empress Bee | honeyPerGoal 5 | `milestone:allCommons` |
| `solstice` | Solstice Bee | honeycombCoins 8 | `milestone:tierMaster` |

Totals: 30 bees (8 common, 8 uncommon, 7 rare, 4 epic, 3 legendary); 23 discovery,
7 milestone. Each bee also gets a one-line `flavor` (authored in the registry) and
an art `desc`/`palette` (authored in `bee-prompts.json`) during implementation.

## Component 1 — registry expansion (`bee-core.js`)

- Grow `BEES` from 8 to the 30 above, preserving the 8 starters verbatim
  (id/name/tier/perk/source unchanged) and adding 22 new entries with `flavor`.
- Extend `MILESTONE_PREDICATES` with 5 new keys (the 2 existing stay):
  - `dailyStreak7`: `(ctx.dailyStreak || 0) >= 7`
  - `tierHard`: `(ctx.difficultyTier || 0) >= 2`
  - `tierMaster`: `(ctx.difficultyTier || 0) >= 4`
  - `reachLevel500`: `(ctx.highestLevel || 0) >= 500`
  - `allCommons`: every common-tier id is in `ctx.ownedIds`
- `MILESTONE_KEYS` updates automatically (`Object.keys`). The existing
  registry-validation test then guarantees every milestone `source` a bee
  references has a predicate.
- Add a tiny helper `commonIds()` (ids of `tier === "common"`) used by the
  `allCommons` predicate, exported on `api` for testing.

These are pure additions to the dual-export module — no structural change.

## Component 2 — milestone context (`bee-collection.js`)

`checkBeeMilestones` extends the `context` object it passes to
`HiveCore.evaluateMilestones` with the new facts (read from `state`):
```js
const ctx = {
    ownedIds: state.hive.bees,
    honeycombRankIndex: _honeycombRankIndexToday(),
    questsCompleted: (state.questHistory ? state.questHistory.length : 0),
    dailyStreak: state.dailyStreak || 0,
    difficultyTier: (typeof state.difficultyTier === "number") ? state.difficultyTier : -1,
    highestLevel: state.highestLevel || 0
};
```
`allCommons` is evaluated inside the predicate using `ownedIds` + `commonIds()`, so
no extra context field is needed. `checkBeeMilestones` should also be called from a
couple more activity points so milestone bees unlock promptly (e.g. on level
completion — already wired in 2A — covers tier/level/streak changes).

## Component 3 — art pipeline (`tools/generate-bees.js` + `tools/bee-prompts.json`)

### `tools/bee-prompts.json`
One entry per registry id:
```json
{
  "dewdrop": { "desc": "a tiny dew-flecked bee resting on a misty morning leaf", "palette": "soft mint, dewy silver, pale gold" }
}
```
The set of keys must exactly match the registry ids (enforced by a test).

### `tools/generate-bees.js`
Clone of `generate-backgrounds.js` with these differences:
- `PROMPTS_FILE = tools/bee-prompts.json`
- `OUTPUT_DIR = WordPlay/wwwroot/images/bees`
- `MANIFEST_FILE = WordPlay/wwwroot/images/bees/bees-manifest.json`
- Square images: `IMAGE_WIDTH = IMAGE_HEIGHT = 384`, `WEBP_QUALITY = 82`.
- Prompt template:
  ```js
  const PROMPT_TEMPLATE = (desc, palette) =>
    `A cute cartoon mascot bee character, ${desc}, big friendly eyes, soft rounded shapes, ` +
    `${palette} color palette, centered in a small circular vignette of its habitat, ` +
    `charming children's mobile-game collectible sticker illustration, soft clean lighting, no text`;
  ```
- Same CLI flags (`--dry-run`, `--only`, `--manifest`), same idempotent skip-if-exists,
  same `buildManifest()` (writes `bees-manifest.json` = array of ids that have a webp).
- Output filename = `<id>.webp` (ids are already filename-safe lowercase, so no
  `keyToFilename` transform is needed — use the id directly).

The user runs `node tools/generate-bees.js` (cost ≈ 30 × $0.03 ≈ $1). The webps and
`bees-manifest.json` are committed (like the background images / level data).

## Component 4 — album rendering swap (`bee-collection.js`)

- Add a lazily-loaded `_beeArtManifest` (Set of ids that have art), fetched once
  from `images/bees/bees-manifest.json` when the hive screen opens; null until then.
- Add `beeArt(bee, sizeClass)` → returns an `<img class="bee-art-img {sizeClass}"
  src="images/bees/{id}.webp" alt="{name}" onerror="...">` when
  `_beeArtManifest` has the id, otherwise the existing `beeTierEmoji(bee.tier)`.
  The `onerror` swaps the broken `<img>` for the emoji (covers a missing/corrupt
  file even if the manifest lists it).
- Replace the three placeholder art spots — collection card art, equip-slot emoji,
  and detail art — with `beeArt(...)`. Locked (undiscovered) cards keep the `❓`
  silhouette (no art revealed before discovery).
- `renderHive()` triggers the manifest fetch (if not loaded) and re-renders when it
  resolves, so art appears as soon as the manifest loads. `beeTierColor` borders
  remain for tier identity.

## Component 5 — lazy-loading, caching, CSS, versioning

- Bee art and `bees-manifest.json` are **NOT** added to the SW precache `ASSETS`
  (keeps PWA install lean). `<img>` requests load on album open via normal HTTP /
  SW runtime caching.
- **`DATA_CACHE` does NOT change** (no precached data file added). Bump
  `APP_VERSION`, `CACHE_NAME`, and `?v=` (both files) for the `bee-core.js` /
  `bee-collection.js` edits.
- CSS: add `.bee-art-img` sizing so images fill the card art slot / detail / equip
  slot (e.g. card ~46px, detail ~96px, slot ~30px), `border-radius:50%`
  (circular), `object-fit:cover`. The emoji fallback path reuses existing sizing.

## Testing strategy (TDD)

Pure logic in `bee-core.js`:
- The existing registry-validation test auto-covers all 30 (shape, valid tier/perk,
  every milestone `source` key has a predicate). Add `BEES.length === 30` and a
  per-tier count assertion (8/8/7/4/3).
- New predicate tests: `dailyStreak7`, `tierHard`, `tierMaster`, `reachLevel500`
  boundaries; `allCommons` true only when all 8 common ids are owned (and false if
  one is missing). `commonIds()` returns exactly the 8 common ids.
- `evaluateMilestones` returns the right epic/legendary ids for representative
  contexts (e.g. a maxed-out player gets all 7; a fresh player gets none).

Drift test (Node, no images needed):
- A test asserting `Object.keys(bee-prompts.json)` sorted equals the registry ids
  sorted — catches a bee added to the registry without a prompt (or vice versa).
  Lives in `test/bee-art.test.js` and `require`s both the core and the prompts JSON.

Manifest/image validation is visual (user runs the generator and reviews); the
album degrades gracefully to emoji for any missing image, so a partial generation
never breaks the screen.

## Release / housekeeping checklist

- New: `tools/generate-bees.js`, `tools/bee-prompts.json`, `test/bee-art.test.js`,
  and (after the user runs the tool) `WordPlay/wwwroot/images/bees/*.webp` +
  `bees-manifest.json`.
- Modified: `bee-core.js` (registry + predicates), `bee-collection.js` (manifest +
  `beeArt`), `app.css` (`.bee-art-img`), `index.html`/`sw.js`/`app.js` version
  markers, `README.md`.
- Bump `APP_VERSION`, `CACHE_NAME`, `?v=` (both files). **`DATA_CACHE` unchanged.**
- Update README's Hive section (remove the "emoji placeholders" caveat) and adjust
  the in-game guide only if wording references placeholders (it doesn't currently).

## Build sequencing

Keeps each step shippable/testable before any image exists:
1. Expand `bee-core.js` registry to 30 + new predicates + `commonIds` (TDD).
2. `bee-collection.js`: extend milestone context; add `_beeArtManifest`, `beeArt`,
   swap the three art spots; manifest fetch + re-render.
3. `.bee-art-img` CSS.
4. `tools/bee-prompts.json` (30 entries) + drift test.
5. `tools/generate-bees.js`.
6. Version-marker bumps + README.
7. **User runs `node tools/generate-bees.js`**, reviews images, commits the webps +
   manifest.
8. Verification (suite green; browser play-through shows real art with emoji
   fallback when art absent).

## Out of scope (future)

- Per-bee animations, shiny/variant arts, seasonal bees — not in v1 (YAGNI).
- **Slice 3 — Weekly Leagues** (left-rail slot; needs .NET backend) — its own spec.

## Open questions / decisions deferred to implementation

- Final `flavor` lines and per-bee `desc`/`palette` art prompts (authored with the
  roster; tunable).
- Exact `.bee-art-img` pixel sizes per slot.
- Whether to also call `checkBeeMilestones` from additional points (e.g. after a
  difficulty-tier promotion) for snappier unlocks, vs. relying on the
  level-completion hook from 2A.
