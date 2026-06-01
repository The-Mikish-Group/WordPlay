# Bee Collection 2A — Gameplay System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Bee Collection "Active Hive" gameplay system — collect bees across activities, equip up to 3 for small passive perks, browse them in an album — running entirely on emoji placeholder art.

**Architecture:** Pure logic (registry, perks, equip rules, discovery, milestones) lives in `bee-core.js` (dual browser/Node export, unit-tested with `node --test`). The DOM/state layer (`bee-collection.js`) holds the album screen, equip interaction, perk aggregation, and acquisition wiring. Collection state persists in `state.hive` (saved + union-synced). The right-rail Collection button reuses Slice 1's `renderActivityButton`. No backend. Real illustrated art is a separate follow-on plan (2B); this plan uses tier-colored emoji placeholders and is fully functional without any image files.

**Tech Stack:** Vanilla browser JS (global-script style), Node 22 (`node --test`).

**Spec:** `docs/plans/2026-06-01-bee-collection-active-hive-design.md`

**Scope boundary:** This plan = the gameplay system with a **starter registry of 8 bees** (covering all 5 tiers, all 4 perk types, both acquisition sources). Plan 2B expands the registry to ~30 and adds the illustrated-art pipeline. The 8 starter bees are real, shippable content.

---

## File Structure

**Create:**
- `WordPlay/wwwroot/js/bee-core.js` — pure logic: `BEES` registry, perk aggregation, equip rules, weighted discovery, milestone evaluation. Dual export (`window.HiveCore` + `module.exports`). No DOM.
- `WordPlay/wwwroot/js/bee-collection.js` — browser layer: `hivePerks()`, state normalizer, acquisition (`recordActivityForDiscovery`, milestone check), discovery celebration, album/hive screen render + equip interaction, the Collection rail button helper.
- `test/bee-core.test.js` — unit tests for the core.

**Modify:**
- `WordPlay/wwwroot/js/app.js` — `state.hive` + `state.showHive`; save/load/normalize/reset; per-word `coinPerWord` perk at the two coin sites; daily `dailyHint` grant; `renderCurrentScreen` + `renderHome` dispatch; left/right rail (add Collection button + staggering); click wiring; acquisition calls on level complete; `GUIDE_SECTIONS`; `APP_VERSION`.
- `WordPlay/wwwroot/js/quests.js` — `honeyPerGoal` perk at goal-claim; `recordActivityForDiscovery` on goal-claim.
- `WordPlay/wwwroot/js/honeycomb.js` — `honeycombCoins` perk on rank-up; `recordActivityForDiscovery` + milestone check on rank-up.
- `WordPlay/wwwroot/js/sync.js` — union-merge the `hv` key.
- `WordPlay/wwwroot/css/app.css` — `.hive-*` album styles + right-rail stagger offsets.
- `WordPlay/wwwroot/index.html` + `WordPlay/wwwroot/sw.js` — register the two new JS files; bump `?v=` / `CACHE_NAME` / `APP_VERSION`.
- `README.md` — document the Bee Collection.

**Conventions:** no `Co-Authored-By` in commits; run from repo root `D:\Projects\Repos\WordPlay`; run a single test file with `node --test test/bee-core.test.js`; full suite `npm test`.

---

## Task 1: Bee registry + basic lookups

**Files:**
- Create: `WordPlay/wwwroot/js/bee-core.js`
- Test: `test/bee-core.test.js`

- [ ] **Step 1: Write the failing test** — create `test/bee-core.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert");
const core = require("../WordPlay/wwwroot/js/bee-core.js");

test("BEES registry has the 8 starter bees with required fields", () => {
  assert.strictEqual(core.BEES.length, 8);
  for (const b of core.BEES) {
    assert.ok(b.id && typeof b.id === "string");
    assert.ok(b.name && typeof b.name === "string");
    assert.ok(["common","uncommon","rare","epic","legendary"].includes(b.tier));
    assert.ok(["coinPerWord","honeyPerGoal","honeycombCoins","dailyHint"].includes(b.perk.type));
    assert.ok(Number.isFinite(b.perk.value));
    assert.ok(typeof b.flavor === "string" && b.flavor.length > 0);
    assert.ok(b.source === "discovery" || b.source.startsWith("milestone:"));
  }
});

test("getBee returns a bee by id, or null", () => {
  assert.strictEqual(core.getBee("worker").name, "Worker Bee");
  assert.strictEqual(core.getBee("nope"), null);
});

test("MAX_ACTIVE is 3", () => {
  assert.strictEqual(core.MAX_ACTIVE, 3);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test test/bee-core.test.js`
Expected: FAIL — cannot find module `bee-core.js`.

- [ ] **Step 3: Create `WordPlay/wwwroot/js/bee-core.js`:**

```js
// ============================================================
// WordPlay — Bee Collection ("Active Hive") pure logic. No DOM.
// Dual export: window.HiveCore (browser) + module.exports (Node tests).
// ============================================================
(function (global) {
  "use strict";

  var MAX_ACTIVE = 3;

  // Starter registry (Plan 2A). Expanded to ~30 in Plan 2B.
  // perk.type ∈ coinPerWord | honeyPerGoal | honeycombCoins | dailyHint
  // source: "discovery" | "milestone:<key>"
  var BEES = [
    { id: "worker",   name: "Worker Bee",   tier: "common",    perk: { type: "coinPerWord",    value: 1 }, flavor: "The tireless backbone of the hive.",        source: "discovery" },
    { id: "forager",  name: "Forager Bee",  tier: "common",    perk: { type: "honeyPerGoal",    value: 1 }, flavor: "Always returns with a little extra honey.",   source: "discovery" },
    { id: "scout",    name: "Scout Bee",    tier: "uncommon",  perk: { type: "honeycombCoins",  value: 2 }, flavor: "First to find the sweetest words.",           source: "discovery" },
    { id: "nurse",    name: "Nurse Bee",    tier: "uncommon",  perk: { type: "dailyHint",       value: 1 }, flavor: "Tends the brood and lends a daily hand.",     source: "discovery" },
    { id: "drone",    name: "Drone Bee",    tier: "rare",      perk: { type: "coinPerWord",     value: 2 }, flavor: "Lazy, but lucky with coin.",                  source: "discovery" },
    { id: "sentinel", name: "Sentinel Bee", tier: "rare",      perk: { type: "honeyPerGoal",    value: 2 }, flavor: "Guards the hive and hoards the honey.",       source: "discovery" },
    { id: "regent",   name: "Regent Bee",   tier: "epic",      perk: { type: "honeycombCoins",  value: 5 }, flavor: "Rewards a true Honeycomb champion.",          source: "milestone:honeycombQueen" },
    { id: "monarch",  name: "Monarch Bee",  tier: "legendary", perk: { type: "coinPerWord",     value: 3 }, flavor: "Crowned for completing a whole Quest.",       source: "milestone:questComplete" }
  ];

  var _byId = {};
  for (var i = 0; i < BEES.length; i++) _byId[BEES[i].id] = BEES[i];

  function getBee(id) { return _byId[id] || null; }

  var api = {
    MAX_ACTIVE: MAX_ACTIVE,
    BEES: BEES,
    getBee: getBee
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HiveCore = api;
})(typeof window !== "undefined" ? window : globalThis);
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test test/bee-core.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/bee-core.js test/bee-core.test.js
git commit -m "feat: bee collection registry and lookup"
```

---

## Task 2: Perk aggregation + equip rules

**Files:**
- Modify: `WordPlay/wwwroot/js/bee-core.js`
- Test: `test/bee-core.test.js`

- [ ] **Step 1: Add failing tests** — append to `test/bee-core.test.js`:

```js
test("activePerks sums equipped bees' perks, all types default 0", () => {
  assert.deepStrictEqual(core.activePerks([]), {
    coinPerWord: 0, honeyPerGoal: 0, honeycombCoins: 0, dailyHint: 0
  });
  // worker = coinPerWord 1, drone = coinPerWord 2, scout = honeycombCoins 2
  assert.deepStrictEqual(core.activePerks(["worker", "drone", "scout"]), {
    coinPerWord: 3, honeyPerGoal: 0, honeycombCoins: 2, dailyHint: 0
  });
});

test("activePerks ignores ids beyond the first 3 (defensive cap)", () => {
  const p = core.activePerks(["worker", "drone", "monarch", "scout"]);
  // worker1 + drone2 + monarch3 = 6 coinPerWord; scout (4th) ignored
  assert.strictEqual(p.coinPerWord, 6);
  assert.strictEqual(p.honeycombCoins, 0);
});

test("activePerks ignores unknown ids", () => {
  assert.deepStrictEqual(core.activePerks(["worker", "ghost"]), {
    coinPerWord: 1, honeyPerGoal: 0, honeycombCoins: 0, dailyHint: 0
  });
});

test("canEquip: must be owned, not already active, fewer than 3 active", () => {
  const owned = ["worker", "drone", "scout", "nurse"];
  assert.strictEqual(core.canEquip({ bees: owned, active: [] }, "worker"), true);
  assert.strictEqual(core.canEquip({ bees: owned, active: ["worker"] }, "worker"), false); // already active
  assert.strictEqual(core.canEquip({ bees: owned, active: [] }, "regent"), false); // not owned
  assert.strictEqual(core.canEquip({ bees: owned, active: ["worker","drone","scout"] }, "nurse"), false); // full
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/bee-core.test.js`
Expected: FAIL — `core.activePerks is not a function`.

- [ ] **Step 3: Implement** — in `bee-core.js`, add above `var api`:

```js
  var PERK_TYPES = ["coinPerWord", "honeyPerGoal", "honeycombCoins", "dailyHint"];

  function activePerks(activeIds) {
    var out = {};
    for (var t = 0; t < PERK_TYPES.length; t++) out[PERK_TYPES[t]] = 0;
    if (!activeIds) return out;
    var limit = Math.min(activeIds.length, MAX_ACTIVE);
    for (var i = 0; i < limit; i++) {
      var bee = getBee(activeIds[i]);
      if (!bee) continue;
      out[bee.perk.type] = (out[bee.perk.type] || 0) + bee.perk.value;
    }
    return out;
  }

  function canEquip(hive, id) {
    if (!hive) return false;
    var bees = hive.bees || [];
    var active = hive.active || [];
    if (bees.indexOf(id) === -1) return false;       // must own it
    if (active.indexOf(id) !== -1) return false;      // not already active
    if (active.length >= MAX_ACTIVE) return false;    // hive full
    return true;
  }
```

Extend `api` to include: `activePerks: activePerks, canEquip: canEquip, PERK_TYPES: PERK_TYPES`.

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/bee-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/bee-core.js test/bee-core.test.js
git commit -m "feat: bee perk aggregation and equip rules"
```

---

## Task 3: Weighted discovery selection

**Files:**
- Modify: `WordPlay/wwwroot/js/bee-core.js`
- Test: `test/bee-core.test.js`

- [ ] **Step 1: Add failing tests** — append:

```js
test("discoveryPool is only discovery-source bees", () => {
  const pool = core.discoveryPool();
  assert.ok(pool.includes("worker"));
  assert.ok(!pool.includes("regent"));   // milestone
  assert.ok(!pool.includes("monarch"));  // milestone
});

test("pickDiscovery excludes owned and returns from the pool", () => {
  // rng returns 0 -> first candidate after weighting expansion
  const id = core.pickDiscovery(["worker", "forager"], () => 0);
  assert.ok(core.discoveryPool().includes(id));
  assert.ok(id !== "worker" && id !== "forager");
});

test("pickDiscovery returns null when the discovery pool is exhausted", () => {
  const allDiscovery = core.discoveryPool();
  assert.strictEqual(core.pickDiscovery(allDiscovery, () => 0), null);
});

test("pickDiscovery is weighted toward commons (statistical)", () => {
  // Seeded-ish rng: cycle through fixed fractions; commons should dominate counts.
  let n = 0;
  const seq = [0.01, 0.2, 0.5, 0.8, 0.99];
  const rng = () => seq[(n++) % seq.length];
  const counts = {};
  for (let i = 0; i < 500; i++) {
    const id = core.pickDiscovery([], rng);
    counts[id] = (counts[id] || 0) + 1;
  }
  const commons = (counts.worker || 0) + (counts.forager || 0);
  const rares = (counts.drone || 0) + (counts.sentinel || 0);
  assert.ok(commons > rares, `commons ${commons} should exceed rares ${rares}`);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/bee-core.test.js`
Expected: FAIL — `core.discoveryPool is not a function`.

- [ ] **Step 3: Implement** — in `bee-core.js`, add above `var api`:

```js
  var TIER_WEIGHT = { common: 100, uncommon: 45, rare: 18, epic: 6, legendary: 2 };

  function tierWeight(tier) { return TIER_WEIGHT[tier] || 1; }

  function discoveryPool() {
    var out = [];
    for (var i = 0; i < BEES.length; i++) if (BEES[i].source === "discovery") out.push(BEES[i].id);
    return out;
  }

  // Weighted pick from discoveryPool minus ownedIds. rng() -> [0,1). Null if exhausted.
  function pickDiscovery(ownedIds, rng) {
    ownedIds = ownedIds || [];
    var candidates = [];
    var total = 0;
    var pool = discoveryPool();
    for (var i = 0; i < pool.length; i++) {
      if (ownedIds.indexOf(pool[i]) !== -1) continue;
      var w = tierWeight(getBee(pool[i]).tier);
      candidates.push({ id: pool[i], w: w });
      total += w;
    }
    if (candidates.length === 0) return null;
    var r = (rng ? rng() : 0.5) * total;
    for (var j = 0; j < candidates.length; j++) {
      r -= candidates[j].w;
      if (r < 0) return candidates[j].id;
    }
    return candidates[candidates.length - 1].id;
  }
```

Extend `api`: `tierWeight: tierWeight, discoveryPool: discoveryPool, pickDiscovery: pickDiscovery`.

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/bee-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/bee-core.js test/bee-core.test.js
git commit -m "feat: weighted bee discovery selection"
```

---

## Task 4: Milestone evaluation + registry validation

**Files:**
- Modify: `WordPlay/wwwroot/js/bee-core.js`
- Test: `test/bee-core.test.js`

- [ ] **Step 1: Add failing tests** — append:

```js
test("evaluateMilestones returns satisfied, not-yet-owned milestone bees", () => {
  // honeycombQueen requires rank index 6; questComplete requires >=1 quest done
  assert.deepStrictEqual(
    core.evaluateMilestones({ honeycombRankIndex: 6, questsCompleted: 0, ownedIds: [] }),
    ["regent"]);
  assert.deepStrictEqual(
    core.evaluateMilestones({ honeycombRankIndex: 6, questsCompleted: 2, ownedIds: [] }).sort(),
    ["monarch", "regent"]);
});

test("evaluateMilestones excludes already-owned bees", () => {
  assert.deepStrictEqual(
    core.evaluateMilestones({ honeycombRankIndex: 6, questsCompleted: 2, ownedIds: ["regent"] }),
    ["monarch"]);
});

test("evaluateMilestones never returns discovery bees", () => {
  const ids = core.evaluateMilestones({ honeycombRankIndex: 6, questsCompleted: 9, ownedIds: [] });
  for (const id of ids) assert.strictEqual(core.getBee(id).source.startsWith("milestone:"), true);
});

test("every milestone key referenced by a bee has a predicate", () => {
  for (const b of core.BEES) {
    if (b.source.startsWith("milestone:")) {
      const key = b.source.slice("milestone:".length);
      assert.ok(core.MILESTONE_KEYS.includes(key), `missing predicate for ${key}`);
    }
  }
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/bee-core.test.js`
Expected: FAIL — `core.evaluateMilestones is not a function`.

- [ ] **Step 3: Implement** — in `bee-core.js`, add above `var api`:

```js
  // Milestone predicates. context is a plain facts object supplied by the DOM layer.
  var MILESTONE_PREDICATES = {
    honeycombQueen: function (ctx) { return (ctx.honeycombRankIndex || 0) >= 6; },
    questComplete:  function (ctx) { return (ctx.questsCompleted || 0) >= 1; }
  };
  var MILESTONE_KEYS = Object.keys(MILESTONE_PREDICATES);

  function evaluateMilestones(context) {
    context = context || {};
    var owned = context.ownedIds || [];
    var out = [];
    for (var i = 0; i < BEES.length; i++) {
      var b = BEES[i];
      if (b.source.indexOf("milestone:") !== 0) continue;
      if (owned.indexOf(b.id) !== -1) continue;
      var key = b.source.slice("milestone:".length);
      var pred = MILESTONE_PREDICATES[key];
      if (pred && pred(context)) out.push(b.id);
    }
    return out;
  }
```

Extend `api`: `evaluateMilestones: evaluateMilestones, MILESTONE_KEYS: MILESTONE_KEYS`.

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/bee-core.test.js`
Expected: PASS (all bee-core tests).

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/bee-core.js test/bee-core.test.js
git commit -m "feat: bee milestone evaluation and registry validation"
```

---

## Task 5: Collection state — fields, save, load/normalize, sync

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (state ~173; save payload ~1125; load hydration ~1023; daily-reset ~1078; `resetStateToDefaults` ~444)
- Modify: `WordPlay/wwwroot/js/sync.js` (after the `hc` merge block)

- [ ] **Step 1: Add state fields.** In `app.js` state object, after the Honeycomb fields (`honeycomb: null,` / `showHoneycomb: false,`), add:

```js
    // Bee Collection ("Active Hive")
    hive: null,        // { bees:[], active:[], seen:[], progress:0, lastHintGrant:null }
    showHive: false,   // transient: Hive/album screen shown
```

- [ ] **Step 2: Persist.** In `saveProgress`'s payload object, after `hc: state.honeycomb,`, add:

```js
            hv: state.hive,
```

- [ ] **Step 3: Hydrate + normalize on load.** Where engagement fields are read from `d` (near `state.honeycomb = d.hc || null;`), add:

```js
            state.hive = normalizeHive(d.hv);
```

Then add this helper near the other top-level functions in `app.js` (e.g. just below `saveProgress`):

```js
// Guarantee a well-formed hive object: all arrays present, active capped at 3
// and limited to owned ids.
function normalizeHive(h) {
    h = h || {};
    const bees = Array.isArray(h.bees) ? h.bees.slice() : [];
    let active = Array.isArray(h.active) ? h.active.filter(id => bees.indexOf(id) !== -1) : [];
    if (active.length > 3) active = active.slice(0, 3);
    const seen = Array.isArray(h.seen) ? h.seen.filter(id => bees.indexOf(id) !== -1) : [];
    return {
        bees: bees,
        active: active,
        seen: seen,
        progress: Number.isFinite(h.progress) ? h.progress : 0,
        lastHintGrant: h.lastHintGrant || null
    };
}
```

- [ ] **Step 4: Reset on account switch.** In `resetStateToDefaults`, alongside `state.honeycomb = null;` (add that line if Slice 1 placed it here), add:

```js
    state.hive = null;
```

- [ ] **Step 5: Sync union-merge.** In `sync.js`, after the honeycomb (`hc`) merge block, add:

```js
    // Hive/Collection: union discovered + seen (never lose a bee); local active; max progress.
    const hvL = local.hv || null;
    const hvS = server.hv || null;
    if (hvL || hvS) {
        const a = hvL || {}, b = hvS || {};
        const union = (x, y) => Array.from(new Set([].concat(x || [], y || [])));
        merged.hv = {
            bees: union(a.bees, b.bees),
            seen: union(a.seen, b.seen),
            active: Array.isArray(a.active) && a.active.length ? a.active : (b.active || []),
            progress: Math.max(a.progress || 0, b.progress || 0),
            lastHintGrant: (a.lastHintGrant && b.lastHintGrant)
                ? (a.lastHintGrant > b.lastHintGrant ? a.lastHintGrant : b.lastHintGrant)
                : (a.lastHintGrant || b.lastHintGrant || null)
        };
    }
```

- [ ] **Step 6: Verify.** Run `node --check WordPlay/wwwroot/js/app.js` and `node --check WordPlay/wwwroot/js/sync.js` (expected: no output). In the browser console after load: `state.hive` should be a normalized object; `normalizeHive({bees:["worker"],active:["worker","ghost"]})` returns active `["worker"]`.

- [ ] **Step 7: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/js/sync.js
git commit -m "feat: hive collection state, persistence, and union sync"
```

---

## Task 6: `bee-collection.js` — perk helper, ensure, acquisition, celebration

**Files:**
- Create: `WordPlay/wwwroot/js/bee-collection.js`

- [ ] **Step 1: Create the file:**

```js
// ============================================================
// WordPlay — Bee Collection ("Active Hive"), DOM/state layer.
// Pure logic in bee-core.js (window.HiveCore). Uses globals:
// state, getTodayStr, saveProgress, and (optional) window.quests popup.
// ============================================================

const DISCOVERY_INTERVAL = 4; // activity completions per discovery attempt

function ensureHive() {
    if (!state.hive) {
        state.hive = { bees: [], active: [], seen: [], progress: 0, lastHintGrant: null };
    }
    return state.hive;
}

// Aggregated perks from the (<=3) equipped bees. Safe before data loads.
function hivePerks() {
    const h = state.hive;
    if (!h || typeof HiveCore === "undefined") {
        return { coinPerWord: 0, honeyPerGoal: 0, honeycombCoins: 0, dailyHint: 0 };
    }
    return HiveCore.activePerks(h.active || []);
}

// Add a bee to the collection (no-op if already owned). Returns the bee or null.
function grantBee(id, label) {
    ensureHive();
    if (!HiveCore.getBee(id)) return null;
    if (state.hive.bees.indexOf(id) !== -1) return null;
    state.hive.bees.push(id);
    if (typeof saveProgress === "function") saveProgress();
    showBeeReveal(HiveCore.getBee(id), label);
    return HiveCore.getBee(id);
}

// Called from activity-completion events; advances discovery and may grant a bee.
function recordActivityForDiscovery() {
    ensureHive();
    const owned = state.hive.bees;
    state.hive.progress = (state.hive.progress || 0) + 1;
    if (state.hive.progress < DISCOVERY_INTERVAL) {
        if (typeof saveProgress === "function") saveProgress();
        return;
    }
    const next = (typeof HiveCore !== "undefined")
        ? HiveCore.pickDiscovery(owned, Math.random) : null;
    if (next) {
        state.hive.progress = 0;
        grantBee(next, "Discovered!");
    } else {
        // Pool exhausted — cap progress so it doesn't spin.
        state.hive.progress = DISCOVERY_INTERVAL;
        if (typeof saveProgress === "function") saveProgress();
    }
}

// Evaluate milestone unlocks given current game facts.
function checkBeeMilestones() {
    ensureHive();
    if (typeof HiveCore === "undefined") return;
    const ctx = {
        ownedIds: state.hive.bees,
        honeycombRankIndex: _honeycombRankIndexToday(),
        questsCompleted: (state.questHistory ? state.questHistory.length : 0)
    };
    const ids = HiveCore.evaluateMilestones(ctx);
    for (const id of ids) grantBee(id, "Milestone!");
}

function _honeycombRankIndexToday() {
    if (typeof getTodaysHoneycomb !== "function" || !state.honeycomb) return 0;
    const p = getTodaysHoneycomb();
    if (!p) return 0;
    return HoneycombCore.currentRankIndex(state.honeycomb.score, p.maxScore);
}

// Grant the dailyHint perk once per calendar day.
function grantDailyHivePerks() {
    ensureHive();
    const today = (typeof getTodayStr === "function") ? getTodayStr() : null;
    if (!today || state.hive.lastHintGrant === today) return;
    const n = hivePerks().dailyHint;
    state.hive.lastHintGrant = today;
    if (n > 0 && typeof MAX_FREE_HINTS !== "undefined") {
        state.freeHints = Math.min((state.freeHints || 0) + n, MAX_FREE_HINTS);
    }
    if (typeof saveProgress === "function") saveProgress();
}

// Reveal celebration. Reuses the quest reward popup if present; else a console note.
function showBeeReveal(bee, label) {
    const tierEmoji = beeTierEmoji(bee.tier);
    if (window.quests && typeof window.quests._showRewardPopup === "function") {
        window.quests._showRewardPopup({ title: (label || "New Bee!") + " " + tierEmoji + " " + bee.name, reward: {} });
    } else if (typeof showToast === "function") {
        showToast((label || "New Bee!") + " " + bee.name);
    }
}

// Emoji placeholder art keyed by tier (Plan 2B replaces with illustrations).
function beeTierEmoji(tier) {
    return ({ common: "🐝", uncommon: "🐝", rare: "🍯", epic: "👑", legendary: "✨" })[tier] || "🐝";
}

function beeTierColor(tier) {
    return ({ common: "#cfcfd6", uncommon: "#8fd6a0", rare: "#6fb8ff", epic: "#c89bff", legendary: "#f4cf4a" })[tier] || "#cfcfd6";
}
```

> Note: `window.quests._showRewardPopup` is currently private. Task 6b exposes it. If it is not yet exposed when this runs, the reveal degrades gracefully (no crash).

- [ ] **Step 2: Verify it parses**

Run: `node --check WordPlay/wwwroot/js/bee-collection.js`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/bee-collection.js
git commit -m "feat: hive perk helper, acquisition, and reveal"
```

---

## Task 6b: Expose the quest reward popup for reuse

**Files:**
- Modify: `WordPlay/wwwroot/js/quests.js` (the `window.quests = { ... }` export block, ~360)

- [ ] **Step 1:** In `quests.js`, find the `window.quests = { ... }` object and add `_showRewardPopup` to it so other modules can trigger the popup:

```js
    _showRewardPopup,
```

(Place it among the existing exported members.)

- [ ] **Step 2: Verify**

Run: `node --check WordPlay/wwwroot/js/quests.js`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/quests.js
git commit -m "feat: expose reward popup for cross-module reuse"
```

---

## Task 7: Apply perks at the four hook points

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (`:2034`, `:2214` per-word; daily grant call)
- Modify: `WordPlay/wwwroot/js/quests.js` (goal-claim jar payout)
- Modify: `WordPlay/wwwroot/js/honeycomb.js` (rank-up coin payout)

- [ ] **Step 1: `coinPerWord` at the swiped-word site.** In `app.js`, find (~2033):

```js
        const wordReward = (!state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel)) ? 3 : 1;
        state.coins += wordReward;
        state.totalCoinsEarned += wordReward;
```

Replace with (adds the perk; only in normal play, not daily/bonus):

```js
        let wordReward = (!state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel)) ? 3 : 1;
        if (!state.isDailyMode && !state.isBonusMode && typeof hivePerks === "function") wordReward += hivePerks().coinPerWord;
        state.coins += wordReward;
        state.totalCoinsEarned += wordReward;
```

- [ ] **Step 2: `coinPerWord` at the auto-complete site.** In `app.js`, find (~2212):

```js
            const flow = !state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel);
            const wordReward = p.standalone ? (flow ? 200 : 100) : (flow ? 3 : 1);
            state.coins += wordReward;
            state.totalCoinsEarned += wordReward;
```

Replace with:

```js
            const flow = !state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel);
            let wordReward = p.standalone ? (flow ? 200 : 100) : (flow ? 3 : 1);
            if (!state.isDailyMode && !state.isBonusMode && typeof hivePerks === "function") wordReward += hivePerks().coinPerWord;
            state.coins += wordReward;
            state.totalCoinsEarned += wordReward;
```

- [ ] **Step 3: `honeyPerGoal` at goal-claim.** In `quests.js` `tickProgress`, find the goal-claim block that adds jars to the quest (it contains `if (state.quest && reward.jars) { state.quest.jars = (state.quest.jars || 0) + reward.jars; }`). Immediately AFTER that, add the perk bonus + a discovery tick:

```js
            if (state.quest && typeof hivePerks === "function") {
                const bonus = hivePerks().honeyPerGoal;
                if (bonus) state.quest.jars = (state.quest.jars || 0) + bonus;
            }
            if (typeof recordActivityForDiscovery === "function") recordActivityForDiscovery();
```

- [ ] **Step 4: `honeycombCoins` at rank-up.** In `honeycomb.js` `honeycombSubmit`, inside the `for (const ri of newRanks)` loop, find:

```js
        if (reward.coins) {
            state.coins = (state.coins || 0) + reward.coins;
            state.totalCoinsEarned = (state.totalCoinsEarned || 0) + reward.coins;
        }
```

Replace with (adds the perk once per rank-up):

```js
        let rankCoins = reward.coins || 0;
        if (typeof hivePerks === "function") rankCoins += hivePerks().honeycombCoins;
        if (rankCoins) {
            state.coins = (state.coins || 0) + rankCoins;
            state.totalCoinsEarned = (state.totalCoinsEarned || 0) + rankCoins;
        }
```

Then, at the END of `honeycombSubmit` (just before `return { ok: true, ... }`), add the discovery tick + milestone check when a rank was reached:

```js
    if (typeof recordActivityForDiscovery === "function") recordActivityForDiscovery();
    if (newRanks.length && typeof checkBeeMilestones === "function") checkBeeMilestones();
```

- [ ] **Step 5: Daily perk grant call.** In `app.js`, find the init/startup path where Slice 1 added `loadHoneycombData()` (search `loadHoneycombData`). After that block, add:

```js
        if (typeof grantDailyHivePerks === "function") grantDailyHivePerks();
```

- [ ] **Step 6: Verify.** Run `node --check` on `app.js`, `quests.js`, `honeycomb.js` (no output each). Run `npm test` (bee-core + honeycomb-core tests still pass).

- [ ] **Step 7: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/js/quests.js WordPlay/wwwroot/js/honeycomb.js
git commit -m "feat: apply hive perks at coin, honey, honeycomb, and daily hook points"
```

---

## Task 8: Discovery + milestone wiring on level completion

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (level-complete path)

- [ ] **Step 1: Find the level-complete handler.** Run: `grep -n "levelsCompleted\|levelUpReward\|showComplete = true" WordPlay/wwwroot/js/app.js` to locate where a normal (non-daily, non-bonus) level is completed and `state.levelsCompleted` is incremented / the complete screen is shown.

- [ ] **Step 2: Add the discovery + milestone calls.** In that level-complete path, guarded to normal play only (not daily/bonus), after the level is recorded as complete, add:

```js
        if (!state.isDailyMode && !state.isBonusMode) {
            if (typeof recordActivityForDiscovery === "function") recordActivityForDiscovery();
            if (typeof checkBeeMilestones === "function") checkBeeMilestones();
        }
```

If the level-complete logic spans daily/bonus and normal in one place, place the guard so daily/bonus completions do NOT advance discovery (consistent with perks being normal-play only). If unsure where exactly, STOP and report NEEDS_CONTEXT with the grep output.

- [ ] **Step 3: Verify.** `node --check WordPlay/wwwroot/js/app.js` (no output).

- [ ] **Step 4: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: advance bee discovery and milestones on level completion"
```

---

## Task 9: Hive/album screen + equip interaction

**Files:**
- Modify: `WordPlay/wwwroot/js/bee-collection.js` (append the screen)

- [ ] **Step 1: Append the screen renderer + interaction:**

```js
// ---------- Hive / album screen ----------
function renderHive() {
    const root = document.getElementById("app");
    if (!root) return;
    ensureHive();
    const h = state.hive;
    const all = HiveCore.BEES;
    const ownedSet = new Set(h.bees);
    const total = all.length;

    // Mark all owned bees as seen (clears NEW badges + rail "!").
    h.seen = Array.from(new Set([].concat(h.seen, h.bees)));
    if (typeof saveProgress === "function") saveProgress();

    const slots = [];
    for (let i = 0; i < HiveCore.MAX_ACTIVE; i++) {
        const id = h.active[i];
        slots.push(id
            ? `<button class="hive-slot filled" data-unequip="${id}" style="border-color:${beeTierColor(HiveCore.getBee(id).tier)}"><span class="hive-slot-emoji">${beeTierEmoji(HiveCore.getBee(id).tier)}</span><span class="hive-slot-name">${HiveCore.getBee(id).name}</span></button>`
            : `<div class="hive-slot empty">+</div>`);
    }

    const cards = all.map(b => {
        const owned = ownedSet.has(b.id);
        if (!owned) {
            const hint = b.source === "discovery" ? "Found by playing" : "Special achievement";
            return `<div class="hive-card locked"><div class="hive-card-art">❓</div><div class="hive-card-name">???</div><div class="hive-card-hint">${hint}</div></div>`;
        }
        const isActive = h.active.indexOf(b.id) !== -1;
        return `<button class="hive-card owned${isActive ? ' active' : ''}" data-bee="${b.id}" style="border-color:${beeTierColor(b.tier)}">
            <div class="hive-card-art">${beeTierEmoji(b.tier)}</div>
            <div class="hive-card-name">${b.name}</div>
            <div class="hive-card-tier" style="color:${beeTierColor(b.tier)}">${b.tier}</div>
            ${isActive ? '<div class="hive-card-badge">Active</div>' : ''}
        </button>`;
    }).join("");

    root.innerHTML = `
        <div class="quest-screen hive-screen">
            <button class="quest-close" data-action="close-hive">✕</button>
            <div class="quest-header">
                <div class="quest-header-icon">🐝</div>
                <div class="quest-header-name">The Hive</div>
                <div class="quest-header-tagline">Equip up to ${HiveCore.MAX_ACTIVE} bees. Only equipped bees' perks apply.</div>
            </div>
            <div class="hive-progress">${h.bees.length} / ${total} bees collected</div>
            <div class="hive-slots">${slots.join("")}</div>
            <div class="hive-grid">${cards}</div>
            <div class="hive-detail" id="hive-detail"></div>
        </div>`;

    _hiveWire();
}

function _hiveWire() {
    const root = document.getElementById("app");
    root.querySelector("[data-action='close-hive']").addEventListener("click", () => {
        state.showHive = false;
        if (typeof renderHome === "function") renderHome();
    });
    root.querySelectorAll("[data-bee]").forEach(el =>
        el.addEventListener("click", () => _hiveShowDetail(el.getAttribute("data-bee"))));
    root.querySelectorAll("[data-unequip]").forEach(el =>
        el.addEventListener("click", () => { _hiveUnequip(el.getAttribute("data-unequip")); }));
}

function _hiveShowDetail(id) {
    const b = HiveCore.getBee(id);
    if (!b) return;
    const isActive = state.hive.active.indexOf(id) !== -1;
    const canAdd = HiveCore.canEquip(state.hive, id);
    const btn = isActive
        ? `<button class="hive-btn" id="hive-unequip">Unequip</button>`
        : (canAdd ? `<button class="hive-btn hive-equip" id="hive-equip">Equip</button>`
                  : `<button class="hive-btn" disabled>Hive full (unequip one first)</button>`);
    const el = document.getElementById("hive-detail");
    el.innerHTML = `
        <div class="hive-detail-card" style="border-color:${beeTierColor(b.tier)}">
            <div class="hive-detail-art">${beeTierEmoji(b.tier)}</div>
            <div class="hive-detail-name">${b.name}</div>
            <div class="hive-detail-tier" style="color:${beeTierColor(b.tier)}">${b.tier}</div>
            <div class="hive-detail-perk">${perkLabel(b.perk)}</div>
            <div class="hive-detail-flavor">${b.flavor}</div>
            ${btn}
        </div>`;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const eq = document.getElementById("hive-equip");
    if (eq) eq.addEventListener("click", () => _hiveEquip(id));
    const uq = document.getElementById("hive-unequip");
    if (uq) uq.addEventListener("click", () => _hiveUnequip(id));
}

function _hiveEquip(id) {
    if (HiveCore.canEquip(state.hive, id)) {
        state.hive.active.push(id);
        if (typeof saveProgress === "function") saveProgress();
        renderHive();
    }
}

function _hiveUnequip(id) {
    state.hive.active = state.hive.active.filter(x => x !== id);
    if (typeof saveProgress === "function") saveProgress();
    renderHive();
}

function perkLabel(perk) {
    switch (perk.type) {
        case "coinPerWord":   return "+" + perk.value + " coin" + (perk.value > 1 ? "s" : "") + " per word found";
        case "honeyPerGoal":  return "+" + perk.value + " 🍯 per daily goal completed";
        case "honeycombCoins":return "+" + perk.value + " coins per Honeycomb rank-up";
        case "dailyHint":     return "+" + perk.value + " free hint" + (perk.value > 1 ? "s" : "") + " each day";
        default: return "";
    }
}
```

- [ ] **Step 2: Verify it parses**

Run: `node --check WordPlay/wwwroot/js/bee-collection.js`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/bee-collection.js
git commit -m "feat: hive album screen and equip interaction"
```

---

## Task 10: Hive screen CSS

**Files:**
- Modify: `WordPlay/wwwroot/css/app.css`

- [ ] **Step 1: Append** to the end of `WordPlay/wwwroot/css/app.css`:

```css
/* ============================================================
   Hive / Bee Collection screen
   ============================================================ */
.hive-progress { text-align: center; font-size: 16px; font-weight: 700; color: #fff; margin: 4px 0 12px; }
.hive-slots { display: flex; gap: 10px; justify-content: center; margin-bottom: 16px; }
.hive-slot {
    width: 96px; height: 84px; border-radius: 14px;
    border: 2px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.08); color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; touch-action: manipulation; padding: 4px;
}
.hive-slot.empty { font-size: 30px; opacity: 0.5; cursor: default; }
.hive-slot-emoji { font-size: 26px; line-height: 1; }
.hive-slot-name { font-size: 11px; margin-top: 4px; text-align: center; }
.hive-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.hive-card {
    border: 2px solid rgba(255,255,255,0.15); border-radius: 12px;
    background: rgba(255,255,255,0.08); color: #fff;
    padding: 10px 6px; text-align: center; cursor: pointer; touch-action: manipulation;
    position: relative; min-height: 96px;
}
.hive-card.locked { opacity: 0.6; cursor: default; }
.hive-card.active { box-shadow: 0 0 0 2px rgba(244,165,53,0.6) inset; }
.hive-card-art { font-size: 30px; line-height: 1; }
.hive-card-name { font-size: 13px; font-weight: 700; margin-top: 4px; }
.hive-card-tier { font-size: 11px; text-transform: capitalize; margin-top: 2px; }
.hive-card-hint { font-size: 11px; opacity: 0.8; margin-top: 4px; }
.hive-card-badge {
    position: absolute; top: 4px; right: 4px; font-size: 10px; font-weight: 800;
    background: var(--accent, #f4a535); color: #2a1500; padding: 1px 6px; border-radius: 8px;
}
.hive-detail { margin-top: 14px; }
.hive-detail-card {
    border: 2px solid rgba(255,255,255,0.2); border-radius: 14px;
    background: rgba(255,255,255,0.1); padding: 16px; text-align: center; color: #fff;
}
.hive-detail-art { font-size: 48px; line-height: 1; }
.hive-detail-name { font-size: 20px; font-weight: 800; margin-top: 6px; }
.hive-detail-tier { font-size: 13px; text-transform: capitalize; }
.hive-detail-perk { font-size: 15px; font-weight: 700; margin: 8px 0; color: #ffe08a; }
.hive-detail-flavor { font-size: 14px; font-style: italic; opacity: 0.9; }
.hive-btn {
    margin-top: 12px; min-width: 140px; height: 46px; border-radius: 23px; border: none;
    background: rgba(255,255,255,0.14); color: #fff; font-size: 15px; font-weight: 700; cursor: pointer;
}
.hive-btn:disabled { opacity: 0.5; cursor: default; }
.hive-equip { background: var(--accent, #f4a535); color: #2a1500; }
```

- [ ] **Step 2: Verify braces balanced**

Run: `node -e "const c=require('fs').readFileSync('WordPlay/wwwroot/css/app.css','utf8'); const o=(c.match(/{/g)||[]).length,x=(c.match(/}/g)||[]).length; if(o!==x)throw new Error('mismatch '+o+'/'+x); console.log('balanced',o)"`
Expected: "balanced N".

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/css/app.css
git commit -m "feat: hive collection screen styles"
```

---

## Task 11: Right-rail Collection button, staggering, dispatch, wiring

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (`renderCurrentScreen`; `renderHome` rail + early-return; click wiring)
- Modify: `WordPlay/wwwroot/js/bee-collection.js` (rail button helper)
- Modify: `WordPlay/wwwroot/css/app.css` (stagger offsets)

- [ ] **Step 1: Rail button helper.** Append to `WordPlay/wwwroot/js/bee-collection.js`:

```js
// Right-rail Collection button (uses Slice 1's renderActivityButton).
function renderHiveRailButton() {
    ensureHive();
    if (typeof HiveCore === "undefined") return "";
    const total = HiveCore.BEES.length;
    const owned = state.hive.bees.length;
    const ring = total > 0 ? Math.round((owned / total) * 100) : 0;
    const unseen = state.hive.bees.some(id => state.hive.seen.indexOf(id) === -1);
    return renderActivityButton({
        action: "open-hive",
        icon: "🍯",
        ringPct: ring,
        pill: owned + "/" + total,
        badge: unseen ? "!" : null,
        waiting: false,
        glow: unseen,
        title: "The Hive — " + owned + " of " + total + " bees"
    });
}
```

- [ ] **Step 2: Dispatch.** In `app.js` `renderCurrentScreen`, add as a branch (after the Honeycomb branch, before Quest):

```js
    if (state.showHive) {
        renderHive();
        return;
    }
```

And in `renderHome` near the top, beside the Honeycomb/Quest early-return guards, add:

```js
    if (state.showHive) { renderHive(); return; }
```

- [ ] **Step 3: Add the button to the right rail.** In `renderHome`, find the right-rail block that returns `'<div class="activity-rail activity-rail-right">' + renderQuestSideButton(state.quest, qDef) + '</div>';`. Change it to include the Collection button below Quest:

```js
                        return '<div class="activity-rail activity-rail-right">'
                            + renderQuestSideButton(state.quest, qDef)
                            + (typeof renderHiveRailButton === "function" ? renderHiveRailButton() : "")
                            + '</div>';
```

If there is no active quest (so the quest block returns early/empty), ALSO ensure the Hive button still renders: add a sibling interpolation right after the quest right-rail block that renders the Hive button alone when the quest rail was empty. Concretely, add this block directly after the quest-rail `${(function(){...})()}`:

```js
            ${(function () {
                // If the quest rail above didn't render (no active quest), still show the Hive button on the right.
                const hasQuest = state.quest && window.quests && window.quests.getCachedManifest();
                if (hasQuest) return "";
                return (typeof renderHiveRailButton === "function")
                    ? '<div class="activity-rail activity-rail-right">' + renderHiveRailButton() + '</div>' : "";
            })()}
```

- [ ] **Step 4: Click wiring.** In `renderHome`'s wiring section, after the `open-honeycomb` block, add:

```js
    document.querySelectorAll("[data-action='open-hive']").forEach(el => {
        el.addEventListener("click", () => {
            state.showHive = true;
            renderHive();
        });
    });
```

- [ ] **Step 5: Stagger the right rail (two buttons now).** In `WordPlay/wwwroot/css/app.css`, append:

```css
/* Two-button rails: stagger so they frame the Level button instead of pinching it. */
.activity-rail-right { top: 44%; }
.activity-rail-right .activity-btn:nth-child(2) { margin-top: 6px; }
```

- [ ] **Step 6: Verify.** `node --check WordPlay/wwwroot/js/app.js` and `node --check WordPlay/wwwroot/js/bee-collection.js` (no output). Brace-balance check on app.css as in Task 10.

- [ ] **Step 7: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/js/bee-collection.js WordPlay/wwwroot/css/app.css
git commit -m "feat: hive rail button, dispatch, wiring, and right-rail stagger"
```

---

## Task 12: Asset wiring + service worker + version bumps

**Files:**
- Modify: `WordPlay/wwwroot/index.html`, `WordPlay/wwwroot/sw.js`, `WordPlay/wwwroot/js/app.js`

> Current markers after Slice 1: `APP_VERSION="2.0.4"`, `CACHE_NAME='wordplay-v141'`, `?v=91`, `DATA_CACHE='wordplay-data-v11'`. Bump to `2.0.5` / `wordplay-v142` / `?v=92`. `DATA_CACHE` does NOT change (no precached data file added; bee art is lazy-loaded in Plan 2B). If live markers differ, increment from the actual values.

- [ ] **Step 1: index.html.** Add the two new scripts AFTER `honeycomb.js` and BEFORE `app.js`, and bump every `?v=91` to `?v=92`:

```html
    <script src="/js/bee-core.js?v=92"></script>
    <script src="/js/bee-collection.js?v=92"></script>
```

After this, no `?v=91` remains in `index.html`.

- [ ] **Step 2: sw.js.** Bump `CACHE_NAME` to `'wordplay-v142'`. Add to ASSETS (with `?v=92`), adjacent to the other JS:

```js
    '/js/bee-core.js?v=92',
    '/js/bee-collection.js?v=92',
```

Bump every remaining `?v=91` to `?v=92`. Leave `DATA_CACHE` unchanged.

- [ ] **Step 3: app.js.** Bump `const APP_VERSION = "2.0.4";` to `"2.0.5"`.

- [ ] **Step 4: Verify.** `grep -rn "?v=91" WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html` → no output. `grep -c "?v=92"` in each file → equal counts. `node --check WordPlay/wwwroot/sw.js` and `app.js` → no output.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/index.html WordPlay/wwwroot/sw.js WordPlay/wwwroot/js/app.js
git commit -m "chore: wire bee collection assets, bump cache and version markers"
```

---

## Task 13: Docs — README + in-game guide

**Files:**
- Modify: `README.md`, `WordPlay/wwwroot/js/app.js` (`GUIDE_SECTIONS`)

- [ ] **Step 1: In-game guide.** Add to the `GUIDE_SECTIONS` array in `app.js` (near the Honeycomb entry):

```js
    { icon: "🐝", title: "The Hive", body: "Collect <b>bees</b> as you play! Bees appear as you complete levels, daily goals, and Honeycomb ranks — and special bees are unlocked by big achievements. Open <b>The Hive</b> from the honeycomb button on the right of the home screen. You can <b>equip up to 3 bees</b> at a time, and only your equipped bees give their bonuses (like extra coins per word or extra honey per goal). Mix and match your favorites — find them all!" },
```

- [ ] **Step 2: README.** Add under the engagement features section of `README.md`:

```markdown
### The Hive (bee collection)

A cozy meta-collection. Players discover bees by playing across all activities
(levels, daily goals, Honeycomb) plus milestone unlocks, and equip up to 3 in an
"active hive" for small passive perks (extra coins per word, honey per goal,
Honeycomb coins, a daily free hint). Only equipped bees' perks apply, which
bounds the total bonus regardless of collection size.

- Pure logic: `wwwroot/js/bee-core.js` (registry, perks, equip rules, discovery,
  milestones — unit-tested via `npm test`).
- DOM/screen + acquisition: `wwwroot/js/bee-collection.js`.
- Illustrated bee art is a follow-on (Plan 2B); the system runs on emoji
  placeholders until then.
```

- [ ] **Step 3: Verify.** `node --check WordPlay/wwwroot/js/app.js` (no output). `npm test` (all green).

- [ ] **Step 4: Commit**

```bash
git add README.md WordPlay/wwwroot/js/app.js
git commit -m "docs: document the bee collection (Hive)"
```

---

## Task 14: Full verification pass

- [ ] **Step 1: Run all tests** — `npm test`. Expected: green (bee-core + honeycomb-core + data).

- [ ] **Step 2: Parse + brace checks** — `node --check` on `bee-core.js`, `bee-collection.js`, `app.js`, `quests.js`, `honeycomb.js`, `sync.js`, `sw.js`; brace-balance on `app.css`.

- [ ] **Step 3: Logic smoke test (real registry + core):**

Run:
```bash
node -e "const c=require('./WordPlay/wwwroot/js/bee-core.js'); let owned=[]; let rng=()=>Math.random ? 0.3 : 0; for(let i=0;i<20;i++){const id=c.pickDiscovery(owned,()=>((i*0.137)%1)); if(id)owned.push(id);} console.log('discovered',owned); console.log('perks of first 3',JSON.stringify(c.activePerks(owned.slice(0,3)))); console.log('milestones at queen+quest',JSON.stringify(c.evaluateMilestones({honeycombRankIndex:6,questsCompleted:1,ownedIds:owned})));"
```
Expected: a list of discovered discovery-pool bees (no `regent`/`monarch`), a perks object summing ≤3 bees, and milestones returning the not-yet-owned milestone ids.

- [ ] **Step 4: Manual / browser play-through checklist** (run the app or drive headless as in Slice 1's verification):
  - [ ] Right rail shows Quest (top) + Hive (bottom), staggered, not overlapping the Level button.
  - [ ] Hive button ring/pill reflect `owned/total`; glows with "!" when a new bee is unviewed.
  - [ ] Completing ~4 activities discovers a bee with a reveal popup.
  - [ ] Opening The Hive shows the album; locked bees are silhouettes with hints; owned bees show emoji + tier.
  - [ ] Equipping a `coinPerWord` bee then finding a word pays the extra coin; unequipping removes it.
  - [ ] Equip is capped at 3 (the 4th attempt is blocked with a reason).
  - [ ] Close returns home; reload preserves the collection; account-switch reset clears it.

- [ ] **Step 5: Final commit (if checklist fixes were needed)**

```bash
git add -A
git commit -m "fix: bee collection verification pass adjustments"
```

---

## Notes / deferred to Plan 2B

- **Illustrated art pipeline** (`tools/generate-bees.js`, `tools/bee-prompts.json`, ~30 webps + manifest, lazy-loading in the album) — its own plan. Until then, tier emoji placeholders are used.
- **Registry expansion** to ~30 bees across tiers — Plan 2B, alongside the art.
- Perk `value`s, `DISCOVERY_INTERVAL`, and the milestone list are starter values; tune after playtesting in `bee-core.js` / `bee-collection.js`.
- Left-rail stagger is unchanged (single Honeycomb button); revisit when Leagues (Slice 3) adds a second left button.
