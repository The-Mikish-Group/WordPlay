# Activity Rail + Honeycomb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a daily Spelling-Bee-style "Honeycomb" minigame, reached from a new reusable round progress-button rail on the home screen.

**Architecture:** Honeycomb is split into a pure-logic core (`honeycomb-core.js`, dual browser/Node export, fully unit-tested with Node's built-in test runner) and a DOM layer (`honeycomb.js`, manually verified). Puzzles are precomputed by a build tool into a static JSON file and selected per-day deterministically by date hash — no backend, mirroring how level data already works. The existing Quest side button is generalized into a reusable `renderActivityButton`, and a mirrored left rail is added.

**Tech Stack:** Vanilla browser JS (global-script style, no bundler), Node 22 (`node --test`) for tests, plain Node scripts for the generator. ASP.NET host serves static `wwwroot/`.

**Spec:** `docs/specs/2026-06-01-activity-rail-honeycomb-design.md`

---

## File Structure

**Create:**
- `WordPlay/wwwroot/js/honeycomb-core.js` — pure logic: scoring, validation, rank thresholds, daily pick, reward table. Dual export (`window.HoneycombCore` + `module.exports`). No DOM references.
- `WordPlay/wwwroot/js/honeycomb.js` — browser-only: data loader, today's-puzzle selection, screen rendering, tap/delete/shuffle/enter interaction, reward payout, state reset helper.
- `tools/honeycomb-generator.js` — build tool that reads `tools/casual-dict.txt` and writes the puzzle pool.
- `WordPlay/wwwroot/data/honeycomb.json` — generated puzzle pool (committed, like level data).
- `test/honeycomb-core.test.js` — unit tests for the core.
- `test/honeycomb-data.test.js` — validates the generated data file against the core.

**Modify:**
- `package.json` — add a `test` script.
- `WordPlay/wwwroot/js/app.js` — `state.honeycomb` + `state.showHoneycomb`; `renderActivityButton`; refactor `renderQuestSideButton`; left rail + Honeycomb button in `renderHome`; `renderCurrentScreen` dispatch; click wiring; save/load/daily-reset; preload hook; `GUIDE_SECTIONS` entry; `APP_VERSION` bump.
- `WordPlay/wwwroot/css/app.css` — generic `.activity-*` rail/button classes; Honeycomb screen styles.
- `WordPlay/wwwroot/js/sync.js` — merge the `hc` key.
- `WordPlay/wwwroot/index.html` — script tags for the two new JS files + `?v=` bump on all assets.
- `WordPlay/wwwroot/sw.js` — `CACHE_NAME` bump, `DATA_CACHE` bump, add new JS + JSON to ASSETS, `?v=` bump.
- `README.md` — document Honeycomb.

**Conventions for every commit:** no `Co-Authored-By` line. Run from repo root `D:\Projects\Repos\WordPlay`.

---

## Task 0: Test harness

**Files:**
- Modify: `package.json`
- Create: `test/.gitkeep`

- [ ] **Step 1: Add a test script to `package.json`**

Replace the file contents with (keep existing dependencies):

```json
{
  "scripts": {
    "test": "node --test test/"
  },
  "dependencies": {
    "@fal-ai/client": "^1.9.3",
    "dotenv": "^17.3.1",
    "sharp": "^0.34.5"
  }
}
```

- [ ] **Step 2: Create the test directory placeholder**

Create `test/.gitkeep` (empty file).

- [ ] **Step 3: Verify the runner works (no tests yet)**

Run: `npm test`
Expected: exits 0 with "tests 0" (no test files found is fine).

- [ ] **Step 4: Commit**

```bash
git add package.json test/.gitkeep
git commit -m "chore: add node --test harness"
```

---

## Task 1: Core — word scoring

**Files:**
- Create: `WordPlay/wwwroot/js/honeycomb-core.js`
- Test: `test/honeycomb-core.test.js`

- [ ] **Step 1: Write the failing test**

Create `test/honeycomb-core.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert");
const core = require("../WordPlay/wwwroot/js/honeycomb-core.js");

test("scoreWord: 4 letters = 1 point", () => {
  assert.strictEqual(core.scoreWord("GLEN", "AEGLNRT"), 1);
});

test("scoreWord: 5+ letters = word length", () => {
  assert.strictEqual(core.scoreWord("ANGLE", "AEGLNRT"), 5);
  assert.strictEqual(core.scoreWord("GENERAL", "AEGLNRT"), 7);
});

test("scoreWord: pangram adds 7 bonus", () => {
  // TANGLER uses all of A,E,G,L,N,R,T → 7 + 7 = 14
  assert.strictEqual(core.scoreWord("TANGLER", "AEGLNRT"), 14);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/honeycomb-core.test.js`
Expected: FAIL — "Cannot find module '../WordPlay/wwwroot/js/honeycomb-core.js'".

- [ ] **Step 3: Create the core file with scoreWord + dual export**

Create `WordPlay/wwwroot/js/honeycomb-core.js`:

```js
// ============================================================
// WordPlay — Honeycomb pure logic (no DOM).
// Dual export: window.HoneycombCore (browser) + module.exports (Node tests).
// ============================================================
(function (global) {
  "use strict";

  function scoreWord(word, letters) {
    var w = String(word).toUpperCase();
    var base = w.length === 4 ? 1 : w.length;
    var distinct = {};
    for (var i = 0; i < w.length; i++) distinct[w[i]] = true;
    var L = String(letters).toUpperCase();
    var pangram = true;
    for (var j = 0; j < L.length; j++) {
      if (!distinct[L[j]]) { pangram = false; break; }
    }
    if (pangram) base += 7;
    return base;
  }

  var api = { scoreWord: scoreWord };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HoneycombCore = api;
})(typeof window !== "undefined" ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/honeycomb-core.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/honeycomb-core.js test/honeycomb-core.test.js
git commit -m "feat: honeycomb core word scoring"
```

---

## Task 2: Core — pangram detection + word validation

**Files:**
- Modify: `WordPlay/wwwroot/js/honeycomb-core.js`
- Test: `test/honeycomb-core.test.js`

- [ ] **Step 1: Add failing tests**

Append to `test/honeycomb-core.test.js`:

```js
test("isPangram: true only when all 7 letters used", () => {
  assert.strictEqual(core.isPangram("TANGLER", "AEGLNRT"), true);
  assert.strictEqual(core.isPangram("ANGLE", "AEGLNRT"), false);
});

function puzzle(words) {
  return { letters: "AEGLNRT", center: "G", wordSet: new Set(words) };
}

test("validateWord: rejects words shorter than 4", () => {
  assert.deepStrictEqual(core.validateWord("GEL", puzzle(["GEL"])), { ok: false, reason: "short" });
});

test("validateWord: rejects words missing the center letter", () => {
  assert.deepStrictEqual(core.validateWord("LANE", puzzle(["LANE"])), { ok: false, reason: "center" });
});

test("validateWord: rejects words using letters outside the set", () => {
  assert.deepStrictEqual(core.validateWord("GOAT", puzzle(["GOAT"])), { ok: false, reason: "badletter" });
});

test("validateWord: rejects words not in the answer set", () => {
  assert.deepStrictEqual(core.validateWord("GNARL", puzzle([])), { ok: false, reason: "notword" });
});

test("validateWord: accepts a valid answer", () => {
  assert.deepStrictEqual(core.validateWord("ANGLE", puzzle(["ANGLE"])), { ok: true });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/honeycomb-core.test.js`
Expected: FAIL — `core.isPangram is not a function`.

- [ ] **Step 3: Implement isPangram + validateWord**

In `WordPlay/wwwroot/js/honeycomb-core.js`, add these functions above the `var api` line:

```js
  function isPangram(word, letters) {
    var w = String(word).toUpperCase();
    var L = String(letters).toUpperCase();
    var d = {};
    for (var i = 0; i < w.length; i++) d[w[i]] = true;
    for (var j = 0; j < L.length; j++) if (!d[L[j]]) return false;
    return true;
  }

  // puzzle: { letters, center, wordSet: Set<UPPERCASE word> }
  function validateWord(word, puzzle) {
    var w = String(word).toUpperCase();
    if (w.length < 4) return { ok: false, reason: "short" };
    var center = String(puzzle.center).toUpperCase();
    if (w.indexOf(center) === -1) return { ok: false, reason: "center" };
    var allowed = {};
    var L = String(puzzle.letters).toUpperCase();
    for (var i = 0; i < L.length; i++) allowed[L[i]] = true;
    for (var k = 0; k < w.length; k++) if (!allowed[w[k]]) return { ok: false, reason: "badletter" };
    if (!puzzle.wordSet.has(w)) return { ok: false, reason: "notword" };
    return { ok: true };
  }
```

And extend the `api` object:

```js
  var api = {
    scoreWord: scoreWord,
    isPangram: isPangram,
    validateWord: validateWord
  };
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/honeycomb-core.test.js`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/honeycomb-core.js test/honeycomb-core.test.js
git commit -m "feat: honeycomb pangram detection and word validation"
```

---

## Task 3: Core — ranks, thresholds, ring percent, reward payout selection

**Files:**
- Modify: `WordPlay/wwwroot/js/honeycomb-core.js`
- Test: `test/honeycomb-core.test.js`

- [ ] **Step 1: Add failing tests**

Append to `test/honeycomb-core.test.js`:

```js
test("rankThresholds: 7 ranks, ceil of percentage of maxScore", () => {
  const t = core.rankThresholds(100);
  assert.strictEqual(t.length, 7);
  assert.strictEqual(t[0].name, "Worker");
  assert.strictEqual(t[0].at, 0);
  assert.strictEqual(t[6].name, "Queen Bee");
  assert.strictEqual(t[6].at, 90); // ceil(100 * 0.90)
  assert.strictEqual(t[1].at, 10); // Forager 10%
});

test("currentRankIndex: highest rank whose threshold is met", () => {
  assert.strictEqual(core.currentRankIndex(0, 100), 0);
  assert.strictEqual(core.currentRankIndex(10, 100), 1);
  assert.strictEqual(core.currentRankIndex(89, 100), 5);
  assert.strictEqual(core.currentRankIndex(90, 100), 6);
});

test("ringPct: percent toward Queen Bee, capped at 100", () => {
  assert.strictEqual(core.ringPct(0, 100), 0);
  assert.strictEqual(core.ringPct(45, 100), 50); // 45 / 90
  assert.strictEqual(core.ringPct(90, 100), 100);
  assert.strictEqual(core.ringPct(200, 100), 100);
});

test("newlyReachedRanks: returns unclaimed reached rank indices", () => {
  assert.deepStrictEqual(core.newlyReachedRanks(20, 100, []), [1, 2]);
  assert.deepStrictEqual(core.newlyReachedRanks(20, 100, [1]), [2]);
  assert.deepStrictEqual(core.newlyReachedRanks(20, 100, [1, 2]), []);
});

test("rewardForRank: Queen Bee pays coins + jars, Worker pays nothing", () => {
  assert.deepStrictEqual(core.rewardForRank(0), {});
  assert.ok(core.rewardForRank(6).coins > 0);
  assert.ok(core.rewardForRank(6).jars > 0);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/honeycomb-core.test.js`
Expected: FAIL — `core.rankThresholds is not a function`.

- [ ] **Step 3: Implement ranks + rewards**

In `WordPlay/wwwroot/js/honeycomb-core.js`, add near the top of the IIFE (after `"use strict";`):

```js
  // Rank ladder: each rank is a fraction of the puzzle's maxScore.
  var RANKS = [
    { name: "Worker",    pct: 0.00 },
    { name: "Forager",   pct: 0.10 },
    { name: "Builder",   pct: 0.20 },
    { name: "Drone",     pct: 0.35 },
    { name: "Keeper",    pct: 0.50 },
    { name: "Royal",     pct: 0.70 },
    { name: "Queen Bee", pct: 0.90 }
  ];

  // Reward paid the first time each rank index is reached, once per day. Tunable.
  var RANK_REWARDS = [
    {},                       // 0 Worker
    { coins: 3 },             // 1 Forager
    { coins: 5 },             // 2 Builder
    { coins: 8 },             // 3 Drone
    { coins: 12 },            // 4 Keeper
    { coins: 15, jars: 10 },  // 5 Royal
    { coins: 25, jars: 20 }   // 6 Queen Bee
  ];
```

Add these functions above `var api`:

```js
  function rankThresholds(maxScore) {
    return RANKS.map(function (r) {
      return { name: r.name, at: Math.ceil(maxScore * r.pct) };
    });
  }

  function currentRankIndex(score, maxScore) {
    var t = rankThresholds(maxScore), idx = 0;
    for (var i = 0; i < t.length; i++) if (score >= t[i].at) idx = i;
    return idx;
  }

  function ringPct(score, maxScore) {
    var t = rankThresholds(maxScore);
    var queen = t[t.length - 1].at;
    if (queen <= 0) return 0;
    return Math.min(100, Math.round((score / queen) * 100));
  }

  function newlyReachedRanks(score, maxScore, claimed) {
    claimed = claimed || [];
    var cur = currentRankIndex(score, maxScore);
    var out = [];
    for (var i = 1; i <= cur; i++) if (claimed.indexOf(i) === -1) out.push(i);
    return out;
  }

  function rewardForRank(index) {
    return RANK_REWARDS[index] || {};
  }
```

Extend `api`:

```js
  var api = {
    RANKS: RANKS,
    RANK_REWARDS: RANK_REWARDS,
    scoreWord: scoreWord,
    isPangram: isPangram,
    validateWord: validateWord,
    rankThresholds: rankThresholds,
    currentRankIndex: currentRankIndex,
    ringPct: ringPct,
    newlyReachedRanks: newlyReachedRanks,
    rewardForRank: rewardForRank
  };
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/honeycomb-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/honeycomb-core.js test/honeycomb-core.test.js
git commit -m "feat: honeycomb ranks, thresholds and reward selection"
```

---

## Task 4: Core — deterministic daily puzzle selection

**Files:**
- Modify: `WordPlay/wwwroot/js/honeycomb-core.js`
- Test: `test/honeycomb-core.test.js`

- [ ] **Step 1: Add failing tests**

Append to `test/honeycomb-core.test.js`:

```js
test("pickDailyIndex: deterministic for a given date + pool size", () => {
  const a = core.pickDailyIndex("2026-06-01", 400);
  const b = core.pickDailyIndex("2026-06-01", 400);
  assert.strictEqual(a, b);
  assert.ok(a >= 0 && a < 400);
});

test("pickDailyIndex: different dates usually differ", () => {
  const a = core.pickDailyIndex("2026-06-01", 400);
  const b = core.pickDailyIndex("2026-06-02", 400);
  assert.notStrictEqual(a, b);
});

test("pickDailyIndex: empty pool returns 0", () => {
  assert.strictEqual(core.pickDailyIndex("2026-06-01", 0), 0);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/honeycomb-core.test.js`
Expected: FAIL — `core.pickDailyIndex is not a function`.

- [ ] **Step 3: Implement pickDailyIndex**

Add above `var api` in `WordPlay/wwwroot/js/honeycomb-core.js`:

```js
  // djb2 string hash → stable daily puzzle index.
  function pickDailyIndex(dateStr, poolLength) {
    if (!poolLength) return 0;
    var h = 5381;
    var s = String(dateStr);
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h % poolLength;
  }
```

Add `pickDailyIndex: pickDailyIndex` to the `api` object.

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/honeycomb-core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/honeycomb-core.js test/honeycomb-core.test.js
git commit -m "feat: honeycomb deterministic daily selection"
```

---

## Task 5: Puzzle generator tool + generated data

**Files:**
- Create: `tools/honeycomb-generator.js`
- Create: `WordPlay/wwwroot/data/honeycomb.json` (generated)

- [ ] **Step 1: Write the generator**

Create `tools/honeycomb-generator.js`:

```js
#!/usr/bin/env node
// ============================================================
// WordPlay — Honeycomb puzzle generator.
// Reads tools/casual-dict.txt (common words) and writes a pool of
// Spelling-Bee-style puzzles to wwwroot/data/honeycomb.json.
// Run: node tools/honeycomb-generator.js
// ============================================================
const fs = require("fs");
const path = require("path");
const core = require("../WordPlay/wwwroot/js/honeycomb-core.js");

const DICT = path.join(__dirname, "casual-dict.txt");
const OUT = path.join(__dirname, "..", "WordPlay", "wwwroot", "data", "honeycomb.json");

const MIN_WORDS = 20;
const MAX_WORDS = 50;
const POOL_TARGET = 400;
const TARGET_COUNT = 30; // prefer puzzles near this many answers

function distinctSorted(w) {
  return Array.from(new Set(w.split(""))).sort().join("");
}

function main() {
  const words = fs.readFileSync(DICT, "utf8")
    .split(/\r?\n/)
    .map(s => s.trim().toUpperCase())
    .filter(w => /^[A-Z]+$/.test(w) && w.length >= 4);

  // Candidate 7-letter sets = distinct-letter signature of any 7-distinct-letter word.
  const setKeys = new Set();
  for (const w of words) {
    if (new Set(w.split("")).size === 7) setKeys.add(distinctSorted(w));
  }

  const puzzles = [];
  for (const letters of setKeys) {
    const allowed = new Set(letters.split(""));
    const usable = words.filter(w => {
      for (const c of w) if (!allowed.has(c)) return false;
      return true;
    });

    let best = null;
    for (const center of letters) {
      const set = usable.filter(w => w.indexOf(center) !== -1);
      if (set.length < MIN_WORDS || set.length > MAX_WORDS) continue;
      const pangrams = set.filter(w => core.isPangram(w, letters));
      if (pangrams.length === 0) continue;
      const closeness = Math.abs(set.length - TARGET_COUNT);
      if (!best || closeness < best.closeness) {
        const maxScore = set.reduce((s, w) => s + core.scoreWord(w, letters), 0);
        best = {
          closeness,
          puzzle: {
            letters,
            center,
            words: set.slice().sort(),
            pangrams: pangrams.slice().sort(),
            maxScore
          }
        };
      }
    }
    if (best) puzzles.push(best.puzzle);
  }

  // Stable quality sort, then cap to the pool target.
  puzzles.sort((a, b) =>
    (b.pangrams.length - a.pangrams.length) ||
    (b.words.length - a.words.length) ||
    a.letters.localeCompare(b.letters)
  );
  const pool = puzzles.slice(0, POOL_TARGET);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ version: 1, puzzles: pool }));
  console.log(`Wrote ${pool.length} honeycomb puzzles to ${OUT}`);
}

main();
```

- [ ] **Step 2: Run the generator**

Run: `node tools/honeycomb-generator.js`
Expected: prints `Wrote N honeycomb puzzles ...` with N between 200 and 400. If N < 200, lower `TARGET_COUNT` toward 25 or raise `MAX_WORDS` to 60 and re-run.

- [ ] **Step 3: Sanity-check the output**

Run: `node -e "const d=require('./WordPlay/wwwroot/data/honeycomb.json'); console.log(d.puzzles.length, d.puzzles[0])"`
Expected: a count and a first puzzle object with `letters` (7 chars), `center`, `words` array, `pangrams` array, `maxScore` number.

- [ ] **Step 4: Commit**

```bash
git add tools/honeycomb-generator.js WordPlay/wwwroot/data/honeycomb.json
git commit -m "feat: honeycomb puzzle generator and generated pool"
```

---

## Task 6: Data validation test

**Files:**
- Create: `test/honeycomb-data.test.js`

- [ ] **Step 1: Write the test**

Create `test/honeycomb-data.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const core = require("../WordPlay/wwwroot/js/honeycomb-core.js");

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "WordPlay", "wwwroot", "data", "honeycomb.json"), "utf8"));

test("pool is non-empty", () => {
  assert.ok(Array.isArray(data.puzzles) && data.puzzles.length > 0);
});

test("every puzzle is well-formed and self-consistent", () => {
  for (const p of data.puzzles) {
    assert.strictEqual(p.letters.length, 7, "7 letters");
    assert.strictEqual(new Set(p.letters.split("")).size, 7, "distinct letters");
    assert.ok(p.letters.includes(p.center), "center in letters");
    assert.ok(p.words.length >= 20 && p.words.length <= 60, "word count band");
    assert.ok(p.pangrams.length >= 1, "has a pangram");

    const wordSet = new Set(p.words);
    for (const w of p.words) {
      const v = core.validateWord(w, { letters: p.letters, center: p.center, wordSet });
      assert.ok(v.ok, `word ${w} valid in ${p.letters}/${p.center}`);
    }
    for (const pan of p.pangrams) {
      assert.ok(core.isPangram(pan, p.letters), `${pan} is a pangram`);
    }
    const computed = p.words.reduce((s, w) => s + core.scoreWord(w, p.letters), 0);
    assert.strictEqual(p.maxScore, computed, "maxScore matches sum");
  }
});
```

- [ ] **Step 2: Run to verify pass**

Run: `node --test test/honeycomb-data.test.js`
Expected: PASS. (If a word-count assertion fails, regenerate in Task 5 with adjusted bands, then re-run.)

- [ ] **Step 3: Commit**

```bash
git add test/honeycomb-data.test.js
git commit -m "test: validate generated honeycomb data"
```

---

## Task 7: Activity rail CSS (generic button + left/right rails)

**Files:**
- Modify: `WordPlay/wwwroot/css/app.css`

- [ ] **Step 1: Add generic activity classes**

Append to `WordPlay/wwwroot/css/app.css` (additive — existing `.quest-side-*` rules stay until Task 8 switches markup over):

```css
/* ============================================================
   Activity rail — reusable round progress buttons (left + right).
   Generalizes the original quest side button.
   ============================================================ */
.activity-rail {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 50;
    pointer-events: none;
}
.activity-rail-right { right: 10px; }
.activity-rail-left  { left: 10px; }

.activity-btn {
    pointer-events: auto;
    position: relative;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(40, 25, 70, 0.85) 0%, rgba(20, 10, 40, 0.95) 100%);
    border: 2px solid rgba(244, 165, 53, 0.55);
    cursor: pointer;
    padding: 0;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), 0 0 16px rgba(244, 165, 53, 0.25);
    transition: transform 0.12s ease, box-shadow 0.2s ease;
}
.activity-btn:active { transform: scale(0.94); }
.activity-btn:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5), 0 0 22px rgba(244, 165, 53, 0.45);
}
.activity-btn-glow { animation: activityBtnGlow 2.6s ease-in-out infinite; }
@keyframes activityBtnGlow {
    0%, 100% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), 0 0 14px rgba(244, 165, 53, 0.22); }
    50%      { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.55), 0 0 22px rgba(244, 165, 53, 0.45); }
}
@media (prefers-reduced-motion: reduce) {
    .activity-btn-glow { animation: none; }
}
.activity-ring {
    position: absolute;
    top: -2px;
    left: -2px;
    width: 68px;
    height: 68px;
}
.activity-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 30px;
    line-height: 1;
    pointer-events: none;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}
.activity-icon svg { display: block; }
.activity-pill {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent, #f4a535);
    color: #1a1a2e;
    font-size: 11px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
    white-space: nowrap;
}
.activity-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    font-size: 22px;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}
.activity-btn-waiting { border-color: rgba(180, 180, 200, 0.45); opacity: 0.85; }
.activity-btn-waiting .activity-icon { opacity: 0.7; }
.activity-btn-waiting .activity-pill { background: rgba(180, 180, 200, 0.6); color: #1a1a2e; }
```

- [ ] **Step 2: Verify CSS parses (no syntax error)**

Run: `node -e "const c=require('fs').readFileSync('WordPlay/wwwroot/css/app.css','utf8'); const o=(c.match(/{/g)||[]).length, x=(c.match(/}/g)||[]).length; if(o!==x){throw new Error('brace mismatch '+o+'/'+x)} console.log('braces balanced', o)"`
Expected: "braces balanced N".

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/css/app.css
git commit -m "feat: generic activity rail and button styles"
```

---

## Task 8: renderActivityButton + refactor Quest button to use it

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (`renderQuestSideButton` ~2939; `renderHome` quest-rail block ~3056-3066)

- [ ] **Step 1: Add `renderActivityButton` helper**

In `WordPlay/wwwroot/js/app.js`, immediately above `function renderQuestSideButton(` (~line 2939), insert:

```js
// Reusable round home-screen activity button (icon + SVG progress ring + pill).
// opts: { action, icon, ringPct, pill, badge, waiting, glow, title }
function renderActivityButton(opts) {
    const pct = Math.max(0, Math.min(100, Math.round(opts.ringPct || 0)));
    const CIRCUM = 188.5;
    const dashOffset = CIRCUM - (CIRCUM * pct / 100);
    const cls = "activity-btn"
        + (opts.waiting ? " activity-btn-waiting" : "")
        + (opts.glow && !opts.waiting ? " activity-btn-glow" : "");
    const pill = (opts.pill != null && opts.pill !== "")
        ? '<span class="activity-pill">' + opts.pill + '</span>' : "";
    const badge = opts.badge
        ? '<span class="activity-badge" aria-hidden="true">' + opts.badge + '</span>' : "";
    const title = (opts.title || "").replace(/"/g, "&quot;");
    return `
    <button class="${cls}" data-action="${opts.action}" title="${title}">
        <svg class="activity-ring" width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="30" stroke="rgba(255,255,255,0.20)" stroke-width="5" fill="none"></circle>
            <circle cx="34" cy="34" r="30" stroke="var(--accent, #f4a535)" stroke-width="5" fill="none"
                    stroke-dasharray="${CIRCUM}" stroke-dashoffset="${dashOffset}"
                    stroke-linecap="round" transform="rotate(-90 34 34)"></circle>
        </svg>
        <span class="activity-icon">${opts.icon}</span>
        ${pill}${badge}
    </button>`;
}
```

- [ ] **Step 2: Replace the body of `renderQuestSideButton` to delegate**

Replace the entire `renderQuestSideButton` function (the one returning the `<button class="quest-side-btn ...">` markup) with:

```js
function renderQuestSideButton(q, qDef) {
    // Reflects TODAY'S progress: how many of today's daily goals are claimed.
    const goals = (state.dailyGoals && state.dailyGoals.goals) || [];
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.claimed).length;
    const pct = totalGoals > 0 ? Math.floor((completedGoals / totalGoals) * 100) : 0;
    const allDone = totalGoals > 0 && completedGoals === totalGoals;
    const titleText = qDef.name + " — Today: " + completedGoals + "/" + totalGoals + " goals"
        + (allDone ? " (all done — refreshes at midnight)" : "");
    return renderActivityButton({
        action: "open-quest",
        icon: qDef.icon || "🐝",
        ringPct: pct,
        pill: allDone ? null : (pct + "%"),
        badge: allDone ? "💤" : null,
        waiting: allDone,
        glow: !allDone,
        title: titleText
    });
}
```

- [ ] **Step 3: Switch the quest rail container class in `renderHome`**

In `renderHome`, find the block (~3062) that returns `'<div class="quest-side-rail">' + renderQuestSideButton(state.quest, qDef) + '</div>'` and change the wrapper class to the generic rail:

```js
return '<div class="activity-rail activity-rail-right">' + renderQuestSideButton(state.quest, qDef) + '</div>';
```

- [ ] **Step 4: Manual verification**

Run the app (`dotnet run` in `WordPlay/`, open the served URL) and view the home screen with an active quest. Expected: the Quest button looks and behaves exactly as before (ring, %, glow; 💤 badge when all daily goals are done). Tapping it still opens the Quest screen.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "refactor: quest side button uses reusable renderActivityButton"
```

---

## Task 9: Honeycomb state, daily reset, save/load, sync

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (state init ~168-173; load/daily-reset ~1071; save payload ~1117)
- Modify: `WordPlay/wwwroot/js/sync.js` (merge ~258-270)

- [ ] **Step 1: Add state fields**

In `WordPlay/wwwroot/js/app.js`, in the state object's Engagement block (after `questHistory: [],` ~line 172) add:

```js
    // Honeycomb (daily Spelling-Bee minigame)
    honeycomb: null,       // { date, found:[], score, ranksClaimed:[] }
    showHoneycomb: false,  // transient: Honeycomb screen shown
```

- [ ] **Step 2: Persist in `saveProgress`**

In the `saveProgress` payload object, after `qh: state.questHistory,` (~line 1117) add:

```js
            hc: state.honeycomb,
```

- [ ] **Step 3: Hydrate + daily-reset on load**

In the load path, locate where engagement fields are restored from `d` (near `state.dailyPuzzle = d.dp`). Add:

```js
            state.honeycomb = d.hc || null;
```

Then in the "Clear stale daily data" block (~1071), after the `dailyPuzzle` reset, add:

```js
            if (state.honeycomb && state.honeycomb.date !== getTodayStr()) {
                state.honeycomb = null;
            }
```

- [ ] **Step 4: Merge `hc` in sync**

In `WordPlay/wwwroot/js/sync.js`, after the daily-puzzle (`dp`) merge block (~line 270), add an analogous block:

```js
    // Honeycomb: same date → higher score wins; different dates → later date.
    const hcL = local.hc || null;
    const hcS = server.hc || null;
    if (hcL && hcS) {
        if (hcL.date === hcS.date) {
            merged.hc = (hcL.score || 0) >= (hcS.score || 0) ? hcL : hcS;
        } else {
            merged.hc = hcL.date > hcS.date ? hcL : hcS;
        }
    } else {
        merged.hc = hcL || hcS || null;
    }
```

- [ ] **Step 5: Manual verification**

Run the app, open DevTools console. Run `state.honeycomb = {date: getTodayStr(), found:['ANGLE'], score:5, ranksClaimed:[]}; saveProgress();` then reload. Confirm `JSON.parse(localStorage.getItem('wordplay-save')).hc` round-trips, and that changing the date string and reloading nulls it out.

- [ ] **Step 6: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/js/sync.js
git commit -m "feat: persist and sync honeycomb daily state"
```

---

## Task 10: Honeycomb module — loader, today's puzzle, submit logic

**Files:**
- Create: `WordPlay/wwwroot/js/honeycomb.js`

- [ ] **Step 1: Create the module with loader + state helpers + submit**

Create `WordPlay/wwwroot/js/honeycomb.js`:

```js
// ============================================================
// WordPlay — Honeycomb (daily Spelling-Bee minigame), DOM layer.
// Pure logic lives in honeycomb-core.js (window.HoneycombCore).
// ============================================================

let _honeycombData = null;

async function loadHoneycombData() {
    if (_honeycombData) return _honeycombData;
    try {
        const resp = await fetch("data/honeycomb.json");
        if (!resp.ok) return null;
        _honeycombData = await resp.json();
        return _honeycombData;
    } catch (e) {
        return null;
    }
}

// Returns today's puzzle augmented with a wordSet, or null if data not loaded.
function getTodaysHoneycomb() {
    if (!_honeycombData || !_honeycombData.puzzles || !_honeycombData.puzzles.length) return null;
    const idx = HoneycombCore.pickDailyIndex(getTodayStr(), _honeycombData.puzzles.length);
    const p = _honeycombData.puzzles[idx];
    return {
        letters: p.letters,
        center: p.center,
        words: p.words,
        pangrams: p.pangrams,
        maxScore: p.maxScore,
        wordSet: new Set(p.words)
    };
}

// Make sure state.honeycomb exists for today.
function ensureHoneycombToday() {
    const today = getTodayStr();
    if (!state.honeycomb || state.honeycomb.date !== today) {
        state.honeycomb = { date: today, found: [], score: 0, ranksClaimed: [] };
    }
}

// Attempt to submit a word. Returns a result object for the UI.
function honeycombSubmit(puzzle, word) {
    ensureHoneycombToday();
    const w = String(word).toUpperCase();
    const v = HoneycombCore.validateWord(w, puzzle);
    if (!v.ok) return v;
    if (state.honeycomb.found.indexOf(w) !== -1) return { ok: false, reason: "dup" };

    const pts = HoneycombCore.scoreWord(w, puzzle.letters);
    state.honeycomb.found.push(w);
    state.honeycomb.score += pts;

    const newRanks = HoneycombCore.newlyReachedRanks(
        state.honeycomb.score, puzzle.maxScore, state.honeycomb.ranksClaimed);
    let rankNames = [];
    for (const ri of newRanks) {
        const reward = HoneycombCore.rewardForRank(ri);
        if (reward.coins) {
            state.coins = (state.coins || 0) + reward.coins;
            state.totalCoinsEarned = (state.totalCoinsEarned || 0) + reward.coins;
        }
        if (reward.jars && state.quest) {
            state.quest.jars = (state.quest.jars || 0) + reward.jars;
        }
        state.honeycomb.ranksClaimed.push(ri);
        rankNames.push(HoneycombCore.RANKS[ri].name);
    }
    if (typeof saveProgress === "function") saveProgress();
    return {
        ok: true,
        points: pts,
        pangram: HoneycombCore.isPangram(w, puzzle.letters),
        newRankNames: rankNames
    };
}

// Small hexagon icon (center letter inside) for the rail button.
function honeycombIcon(centerLetter) {
    return '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">'
        + '<polygon points="15,2 27,9 27,21 15,28 3,21 3,9" fill="rgba(244,165,53,0.92)" stroke="#7a4f10" stroke-width="1.5"></polygon>'
        + '<text x="15" y="20" text-anchor="middle" font-size="14" font-weight="800" fill="#2a1500" font-family="Nunito, sans-serif">'
        + centerLetter + '</text></svg>';
}
```

- [ ] **Step 2: Smoke-check the core dependency resolves in a browser-like check**

Run: `node -e "global.window={};global.getTodayStr=()=>'2026-06-01';require('./WordPlay/wwwroot/js/honeycomb-core.js');const c=window.HoneycombCore;console.log(c.pickDailyIndex('2026-06-01',400))"`
Expected: prints an integer 0–399 (confirms core loads as a browser global).

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/honeycomb.js
git commit -m "feat: honeycomb data loader and submit logic"
```

---

## Task 11: Honeycomb screen rendering + interaction

**Files:**
- Modify: `WordPlay/wwwroot/js/honeycomb.js` (append render + interaction)

- [ ] **Step 1: Append the screen renderer and interaction wiring**

Append to `WordPlay/wwwroot/js/honeycomb.js`:

```js
// Module-level input buffer for the word being assembled.
let _hcTyped = "";
let _hcOuterOrder = null; // shuffled outer-letter order

function _hcOuterLetters(puzzle) {
    return puzzle.letters.split("").filter(c => c !== puzzle.center);
}

function _hcRankLabel(puzzle) {
    const idx = HoneycombCore.currentRankIndex(state.honeycomb.score, puzzle.maxScore);
    return HoneycombCore.RANKS[idx].name;
}

function renderHoneycomb() {
    const root = document.getElementById("app");
    if (!root) return;
    ensureHoneycombToday();
    const puzzle = getTodaysHoneycomb();
    if (!puzzle) {
        root.innerHTML = '<div class="quest-screen"><button class="quest-close" data-action="close-honeycomb">✕</button>'
            + '<div class="quest-screen-empty">Honeycomb is taking a break. Check back soon!</div></div>';
        const c = root.querySelector("[data-action='close-honeycomb']");
        if (c) c.addEventListener("click", _hcClose);
        return;
    }
    if (!_hcOuterOrder) _hcOuterOrder = _hcOuterLetters(puzzle);

    const ring = HoneycombCore.ringPct(state.honeycomb.score, puzzle.maxScore);
    const rank = _hcRankLabel(puzzle);
    const found = state.honeycomb.found.slice().sort();

    root.innerHTML = `
        <div class="quest-screen honeycomb-screen">
            <button class="quest-close" data-action="close-honeycomb">✕</button>
            <div class="quest-header">
                <div class="quest-header-icon">🍯</div>
                <div class="quest-header-name">Honeycomb</div>
                <div class="quest-header-tagline">Find words using the 7 letters. Every word must use the center letter.</div>
            </div>

            <div class="hc-rankbar">
                <div class="hc-rankbar-fill" style="width:${ring}%"></div>
                <div class="hc-rankbar-label">${rank} · ${state.honeycomb.score} pts</div>
            </div>

            <div class="hc-typed" id="hc-typed">${_hcTyped || '&nbsp;'}</div>
            <div class="hc-msg" id="hc-msg">&nbsp;</div>

            <div class="hc-hex" id="hc-hex">
                <button class="hc-letter hc-center" data-letter="${puzzle.center}">${puzzle.center}</button>
                ${_hcOuterOrder.map(L => `<button class="hc-letter" data-letter="${L}">${L}</button>`).join("")}
            </div>

            <div class="hc-controls">
                <button class="hc-btn" id="hc-delete">Delete</button>
                <button class="hc-btn" id="hc-shuffle">Shuffle</button>
                <button class="hc-btn hc-enter" id="hc-enter">Enter</button>
            </div>

            <div class="hc-found">
                <div class="hc-found-head">Found ${found.length} word${found.length === 1 ? "" : "s"}</div>
                <div class="hc-found-list">${found.map(w => `<span class="hc-found-word">${w}</span>`).join("")}</div>
            </div>
        </div>`;

    _hcWire(puzzle);
}

function _hcWire(puzzle) {
    const root = document.getElementById("app");
    root.querySelectorAll(".hc-letter").forEach(b => {
        b.addEventListener("click", () => {
            _hcTyped += b.getAttribute("data-letter");
            _hcUpdateTyped();
        });
    });
    root.querySelector("#hc-delete").addEventListener("click", () => {
        _hcTyped = _hcTyped.slice(0, -1);
        _hcUpdateTyped();
    });
    root.querySelector("#hc-shuffle").addEventListener("click", () => {
        // Deterministic-free shuffle is fine here (UI only, not persisted).
        for (let i = _hcOuterOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [_hcOuterOrder[i], _hcOuterOrder[j]] = [_hcOuterOrder[j], _hcOuterOrder[i]];
        }
        renderHoneycomb();
    });
    root.querySelector("#hc-enter").addEventListener("click", () => _hcEnter(puzzle));
    root.querySelector("[data-action='close-honeycomb']").addEventListener("click", _hcClose);
}

function _hcUpdateTyped() {
    const el = document.getElementById("hc-typed");
    if (el) el.innerHTML = _hcTyped || "&nbsp;";
}

function _hcMsg(text, kind) {
    const el = document.getElementById("hc-msg");
    if (!el) return;
    el.textContent = text;
    el.className = "hc-msg" + (kind ? " hc-msg-" + kind : "");
}

const _HC_REASONS = {
    short: "Words must be at least 4 letters",
    center: "Must use the center letter",
    badletter: "That letter isn't in the hive",
    notword: "Not in the word list",
    dup: "Already found"
};

function _hcEnter(puzzle) {
    const word = _hcTyped;
    if (!word) return;
    const res = honeycombSubmit(puzzle, word);
    if (!res.ok) {
        _hcMsg(_HC_REASONS[res.reason] || "Try another word", "bad");
        _hcTyped = "";
        _hcUpdateTyped();
        return;
    }
    let msg = "+" + res.points;
    if (res.pangram) msg = "PANGRAM! +" + res.points;
    if (res.newRankNames.length) msg += " · " + res.newRankNames[res.newRankNames.length - 1] + "!";
    _hcTyped = "";
    renderHoneycomb();          // refresh score, rank bar, found list
    _hcMsg(msg, res.pangram ? "pangram" : "good");
}

function _hcClose() {
    state.showHoneycomb = false;
    _hcTyped = "";
    if (typeof renderHome === "function") renderHome();
}
```

- [ ] **Step 2: Manual verification**

(Screen styling lands in Task 12; this step just confirms logic.) Temporarily add to the home init or run in console after data loads: `state.showHoneycomb = true; renderHoneycomb();`. Tap letters, Delete, Shuffle, Enter. Confirm: valid words add to the list and bump the score/rank bar; invalid words show the right message; duplicates are rejected; reaching a threshold appends a rank name and (check `state.coins`) pays coins. Close returns home.

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/honeycomb.js
git commit -m "feat: honeycomb screen rendering and interaction"
```

---

## Task 12: Honeycomb screen CSS

**Files:**
- Modify: `WordPlay/wwwroot/css/app.css`

- [ ] **Step 1: Append Honeycomb screen styles**

Append to `WordPlay/wwwroot/css/app.css`:

```css
/* ============================================================
   Honeycomb screen
   ============================================================ */
.honeycomb-screen .hc-rankbar {
    position: relative;
    height: 26px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 13px;
    overflow: hidden;
    margin: 8px 0 14px;
}
.hc-rankbar-fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: linear-gradient(90deg, rgba(244,165,53,0.85), rgba(244,200,90,0.95));
    transition: width 0.3s ease;
}
.hc-rankbar-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}
.hc-typed {
    text-align: center;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: 3px;
    min-height: 38px;
    color: #fff;
}
.hc-msg { text-align: center; font-size: 15px; min-height: 22px; margin: 2px 0 8px; color: #f0e8d0; }
.hc-msg-bad { color: #ffb3a7; }
.hc-msg-good { color: #b9f0c0; font-weight: 700; }
.hc-msg-pangram { color: #ffe08a; font-weight: 800; }

.hc-hex {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    max-width: 280px;
    margin: 6px auto 16px;
}
.hc-letter {
    width: 76px;
    height: 76px;
    border-radius: 14px;
    border: none;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 30px;
    font-weight: 800;
    cursor: pointer;
    touch-action: manipulation;
    transition: transform 0.1s ease, background 0.15s ease;
}
.hc-letter:active { transform: scale(0.92); }
.hc-center {
    background: var(--accent, #f4a535);
    color: #2a1500;
}
.hc-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 18px;
}
.hc-btn {
    min-width: 92px;
    height: 48px;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    touch-action: manipulation;
}
.hc-btn:active { transform: scale(0.96); }
.hc-enter { background: var(--accent, #f4a535); color: #2a1500; border: none; }

.hc-found { margin-top: 6px; }
.hc-found-head { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: #fff; }
.hc-found-list { display: flex; flex-wrap: wrap; gap: 6px; }
.hc-found-word {
    font-size: 14px;
    padding: 4px 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fff;
}
```

- [ ] **Step 2: Verify braces balanced**

Run: `node -e "const c=require('fs').readFileSync('WordPlay/wwwroot/css/app.css','utf8'); const o=(c.match(/{/g)||[]).length, x=(c.match(/}/g)||[]).length; if(o!==x){throw new Error('brace mismatch '+o+'/'+x)} console.log('braces balanced', o)"`
Expected: "braces balanced N".

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/css/app.css
git commit -m "feat: honeycomb screen styles"
```

---

## Task 13: Wire Honeycomb into home — rail button, dispatch, click, preload

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (`renderCurrentScreen` ~2899; `renderHome` left-rail; click wiring ~3167; init preload)

- [ ] **Step 1: Add the screen dispatch**

In `renderCurrentScreen` (~2899), add a Honeycomb branch before the Quest branch:

```js
function renderCurrentScreen() {
    const app = document.getElementById("app");
    if (state.showHoneycomb) {
        renderHoneycomb();
        return;
    }
    if (state.showQuest) {
        renderQuestScreen();
        return;
    }
```

Also, in `renderHome` near its top where it early-returns for the quest screen (`if (state.showQuest) { renderQuestScreen(); return; }`, ~2974), add directly above it:

```js
    if (state.showHoneycomb) { renderHoneycomb(); return; }
```

- [ ] **Step 2: Render the left rail with the Honeycomb button**

In `renderHome`, immediately after the right-rail (quest) block you edited in Task 8, add a left-rail block:

```js
            ${(function () {
                const puzzle = (typeof getTodaysHoneycomb === "function") ? getTodaysHoneycomb() : null;
                if (!puzzle) return ""; // data not loaded yet; re-render fires on load
                if (typeof ensureHoneycombToday === "function") ensureHoneycombToday();
                const ring = HoneycombCore.ringPct(state.honeycomb.score, puzzle.maxScore);
                const rankIdx = HoneycombCore.currentRankIndex(state.honeycomb.score, puzzle.maxScore);
                const untouched = state.honeycomb.found.length === 0;
                return '<div class="activity-rail activity-rail-left">'
                    + renderActivityButton({
                        action: "open-honeycomb",
                        icon: honeycombIcon(puzzle.center),
                        ringPct: ring,
                        pill: ring + "%",
                        badge: rankIdx === 6 ? "👑" : null,
                        waiting: false,
                        glow: untouched,
                        title: "Honeycomb — " + HoneycombCore.RANKS[rankIdx].name + " · " + state.honeycomb.score + " pts"
                    })
                    + '</div>';
            })()}
```

- [ ] **Step 3: Wire the open click**

In `renderHome`'s event-wiring section, after the existing `document.querySelectorAll("[data-action='open-quest']")` block (~3167), add:

```js
    document.querySelectorAll("[data-action='open-honeycomb']").forEach(el => {
        el.addEventListener("click", () => {
            state.showHoneycomb = true;
            renderHoneycomb();
        });
    });
```

- [ ] **Step 4: Preload honeycomb data at startup and re-render home when ready**

Find the app init path where the quests manifest is loaded. Run: `grep -n "loadQuestsManifest\|activateQuestForToday" WordPlay/wwwroot/js/app.js` to locate it. In that same async init function, after the quests setup, add:

```js
        if (typeof loadHoneycombData === "function") {
            loadHoneycombData().then(() => {
                if (state.showHome && typeof renderHome === "function") renderHome();
            });
        }
```

- [ ] **Step 5: Manual verification**

Run the app. Expected: a left-edge round button with a hexagon icon (center letter inside) and a `0%` pill appears, glowing (today untouched). Tap it → Honeycomb screen opens. Find a few words → close → the left button's ring/pill reflect progress and the glow stops. The right Quest button is unchanged and balanced opposite it.

- [ ] **Step 6: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: honeycomb home rail button, dispatch and wiring"
```

---

## Task 14: Script/asset wiring + service worker + version bumps

**Files:**
- Modify: `WordPlay/wwwroot/index.html`
- Modify: `WordPlay/wwwroot/sw.js`
- Modify: `WordPlay/wwwroot/js/app.js` (`APP_VERSION` ~line 5)

> Current markers (from project memory): `APP_VERSION="2.0.3"`, `CACHE_NAME=wordplay-v140`, `?v=90`, `DATA_CACHE=wordplay-data-v10`. This task bumps to `2.0.4` / `wordplay-v141` / `?v=91`, and `DATA_CACHE` to `wordplay-data-v11` (a new data file was added). If the live markers differ, increment from whatever is current.

- [ ] **Step 1: Add the new scripts to `index.html`**

In `WordPlay/wwwroot/index.html`, the core script must load before the DOM/app uses it. Add `honeycomb-core.js` and `honeycomb.js` to the script block (before `app.js`), and bump every `?v=90` to `?v=91` (CSS link + all script tags):

```html
    <script src="/js/quests.js?v=91"></script>
    <script src="/js/honeycomb-core.js?v=91"></script>
    <script src="/js/honeycomb.js?v=91"></script>
    <script src="/js/app.js?v=91"></script>
```

(Keep the other existing script tags; just update their `?v=` to `91` as well, and the `app.css?v=` link.)

- [ ] **Step 2: Update the service worker**

In `WordPlay/wwwroot/sw.js`:
- Bump `CACHE_NAME` to `'wordplay-v141'`.
- Bump `DATA_CACHE` to `'wordplay-data-v11'`.
- Add the two JS files and the data file to `ASSETS`, and bump all `?v=90` to `?v=91`:

```js
    '/js/quests.js?v=91',
    '/js/honeycomb-core.js?v=91',
    '/js/honeycomb.js?v=91',
    '/js/app.js?v=91',
```

and add to the asset list:

```js
    '/data/honeycomb.json',
```

(Bump every other `?v=90` occurrence in `sw.js` to `91` to match `index.html`.)

- [ ] **Step 3: Bump `APP_VERSION`**

In `WordPlay/wwwroot/js/app.js` (~line 5): `const APP_VERSION = "2.0.4";`

- [ ] **Step 4: Verify no stale version strings remain**

Run: `grep -rn "?v=90" WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html`
Expected: no output (all bumped to 91).

- [ ] **Step 5: Manual verification**

Hard-reload the app twice (the service worker is network-first for the shell). Confirm the home version reads `v2.0.4` and the Honeycomb button + data load correctly from cache offline.

- [ ] **Step 6: Commit**

```bash
git add WordPlay/wwwroot/index.html WordPlay/wwwroot/sw.js WordPlay/wwwroot/js/app.js
git commit -m "chore: wire honeycomb assets, bump cache and version markers"
```

---

## Task 15: Docs — README + in-game guide

**Files:**
- Modify: `README.md`
- Modify: `WordPlay/wwwroot/js/app.js` (`GUIDE_SECTIONS` ~7695)

- [ ] **Step 1: Add a Honeycomb section to the in-game guide**

In `WordPlay/wwwroot/js/app.js`, add an entry to the `GUIDE_SECTIONS` array (near the other engagement entries):

```js
    { icon: "🍯", title: "Honeycomb", body: "Tap the <b>hexagon button</b> on the home screen to play <b>Honeycomb</b> — a brand-new daily word game! You get <b>7 letters</b> and one <b>center letter</b>. Build as many words as you can (4+ letters), and <b>every word must use the center letter</b>. Letters can be reused. Longer words score more, and a <b>pangram</b> (a word using all 7 letters) earns a big bonus! Climb the ranks from Worker all the way to <b>Queen Bee</b> to earn coins and honey for your Quest. A fresh puzzle arrives every day." },
```

- [ ] **Step 2: Document Honeycomb in `README.md`**

Add a short subsection under the features/engagement area of `README.md`:

```markdown
### Honeycomb (daily minigame)

A daily Spelling-Bee-style word game reached from the hexagon button on the
home screen. Players get 7 letters plus a required center letter and find as
many valid words (4+ letters, must include the center letter) as they can,
climbing a rank ladder (Worker → Queen Bee) for coins and Quest honey.

- Pure logic: `wwwroot/js/honeycomb-core.js` (unit-tested via `npm test`).
- DOM/screen: `wwwroot/js/honeycomb.js`.
- Puzzles are precomputed: `tools/honeycomb-generator.js` → `wwwroot/data/honeycomb.json`.
- Today's puzzle is chosen deterministically by date, identical for all players.
```

- [ ] **Step 3: Run the full test suite once more**

Run: `npm test`
Expected: all tests pass (core + data).

- [ ] **Step 4: Commit**

```bash
git add README.md WordPlay/wwwroot/js/app.js
git commit -m "docs: document honeycomb in README and in-game guide"
```

---

## Task 16: Full verification pass

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: green (Tasks 1–6 logic + data).

- [ ] **Step 2: Play-through checklist (manual, in the running app)**

- [ ] Home screen shows balanced left (Honeycomb) and right (Quest) round buttons.
- [ ] Honeycomb button glows when today is untouched; ring + `%` pill update after play; stops glowing once played.
- [ ] Opening Honeycomb shows the hex, rank bar, controls, and found list over the dark scrim.
- [ ] Valid word: adds to list, bumps score/rank bar, shows `+N`.
- [ ] Pangram: shows the PANGRAM celebration and the larger score.
- [ ] Invalid/short/missing-center/duplicate: correct nudge message, no score change.
- [ ] Crossing a rank threshold pays coins (and honey to the active Quest at Royal/Queen Bee) exactly once — re-entering and re-finding does not double-pay.
- [ ] Close returns home; reload preserves today's found words and score; a simulated date change resets them.
- [ ] Quest button behaves exactly as before.

- [ ] **Step 3: Final commit (if any checklist fixes were needed)**

```bash
git add -A
git commit -m "fix: honeycomb verification pass adjustments"
```

---

## Notes / deferred decisions

- **Staggered rails:** with one button per side this slice keeps both rails vertically centered (balanced). When a second button is added to a rail (Collection/Leagues slices), switch `.activity-rail-left`/`-right` to staggered top/bottom offsets so they frame the Level button.
- **Old `.quest-side-*` CSS** becomes unused after Task 8 and may be removed in a later cleanup; left in place here to keep this slice low-risk.
- **Physical-keyboard input** for Honeycomb is intentionally not implemented in v1 (tap-only), per the spec's open question.
- **Reward values** (`RANK_REWARDS`) and **rank percentages** (`RANKS`) are the spec's starting proposal; tune in `honeycomb-core.js` without touching the UI.
