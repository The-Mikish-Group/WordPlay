# Regular Game Stars Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add bonus stars to regular gameplay — stars appear on ~20% of levels, share the same banner star counter as bonus mode, and award the 500-coin grand prize at 9 stars without ending the level.

**Architecture:** Generalize the existing bonus-star system (star cell assignment, grid rendering, collection, fly animation) to also work outside `isBonusMode`. Add a `_regularStarCells` array parallel to `_bonusStarCells`. Use seeded hash to deterministically decide which levels get stars and where they're placed. Modify the regular game header to show earned banner stars. Modify `checkBonusStars` to also handle regular mode star collection, with the key difference that reaching 9 stars awards the grand prize inline instead of ending the level.

**Tech Stack:** Vanilla JS (app.js), CSS (app.css) — single-file game, no build system, no test framework.

---

### Task 1: Add regular star state variables and assignment function

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:220` (after `_bonusStarCells` declaration)
- Modify: `WordPlay/wwwroot/js/app.js:763` (near `assignBonusStars`)

**Step 1: Add state variable**

After line 220 (`let _bonusStarCells = [];`), add:

```js
let _regularStarCells = [];     // array of "row,col" keys where stars are placed in regular levels
```

**Step 2: Add `assignRegularStars` function**

After `assignBonusStars` (after line 789), add:

```js
function shouldLevelHaveStars(levelNum) {
    // Seeded 20% chance based on level number
    return (hashStr("regularstars:" + levelNum) % 100) < 20;
}

function assignRegularStars(levelNum) {
    if (!crossword || !crossword.placements) return [];
    const words = crossword.placements.filter(p => !p.standalone);
    if (words.length === 0) return [];
    const starCells = [];
    // 1-2 stars based on seeded hash
    const starCount = (hashStr("regularstarcount:" + levelNum) % 2) + 1;
    let remaining = starCount;
    const shuffled = [...words].sort((a, b) => {
        const ha = hashStr(levelNum + ":regstar:" + a.word);
        const hb = hashStr(levelNum + ":regstar:" + b.word);
        return ha - hb;
    });
    for (const w of shuffled) {
        if (remaining <= 0) break;
        const available = w.cells.filter(c => !starCells.includes(c.row + "," + c.col));
        if (available.length === 0) continue;
        const seed = hashStr(levelNum + ":regstar:" + w.word);
        const c = available[seed % available.length];
        starCells.push(c.row + "," + c.col);
        remaining--;
    }
    return starCells;
}
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add regular star assignment function and state variable"
```

---

### Task 2: Initialize regular stars on level load and restore from in-progress

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:581-598` (`restoreLevelState`)
- Modify: `WordPlay/wwwroot/js/app.js:557-568` (`saveInProgressState`)

**Step 1: Initialize stars in `restoreLevelState`**

In `restoreLevelState()` (line 581), after the `if (ip)` block restores `foundWords/bonusFound/revealedCells/standaloneFound/wheelLetters` and before the `return` on line 598, add star restoration:

Replace lines 584-598:

```js
    const ip = state.inProgress[lv];
    if (ip) {
        state.foundWords = (ip.fw || []).filter(w => placedWords.includes(w));
        state.bonusFound = ip.bf || [];
        state.revealedCells = ip.rc || [];
        state.standaloneFound = ip.sf || false;
        if (ip.wo && ip.wo.length === level.letters.length &&
            [...ip.wo].sort().join('') === level.letters.split('').sort().join('')) {
            wheelLetters = [...ip.wo];
        }
        if (state.standaloneFound && standaloneWord && !state.foundWords.includes(standaloneWord)) {
            state.foundWords.push(standaloneWord);
        }
        while (checkAutoCompleteWords()) {}
        // Restore regular star cells
        _regularStarCells = ip.rsc || [];
        return;
    }
```

Also add initialization for fresh levels. After the existing `restoreLevelState` function's completed-level block (line 600-606), there is no star init for new levels. We handle that separately in Task 3.

**Step 2: Save star cells in `saveInProgressState`**

In `saveInProgressState()` (line 557), modify the object saved to `state.inProgress[lv]` to include star data. Replace lines 561-567:

```js
        state.inProgress[lv] = {
            fw: [...state.foundWords],
            bf: [...state.bonusFound],
            rc: [...state.revealedCells],
            sf: state.standaloneFound,
            wo: wheelLetters ? [...wheelLetters] : null,
            rsc: _regularStarCells.length > 0 ? [..._regularStarCells] : undefined,
        };
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: persist regular star cells in save/restore"
```

---

### Task 3: Assign stars when entering a new regular level

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — find where new regular levels are entered

The game calls `restoreLevelState()` after `recompute()`. For a fresh level (not in progress, not completed), `restoreLevelState` does nothing to `_regularStarCells`. We need to assign stars for new levels.

**Step 1: Find the main game render entry point**

Look at `renderAll()` (line ~1830) which calls `renderHeader()`, `renderGrid()`, etc. The stars need to be assigned after `recompute()` sets up the crossword but before `renderGrid()`.

Search for where `restoreLevelState()` is called in the normal game flow. It's called after `recompute()` in multiple places. The cleanest approach: initialize `_regularStarCells` inside `restoreLevelState` for new levels too.

In `restoreLevelState()`, at the very end of the function (after the completed-level block, line ~606), add:

```js
    // For fresh or completed levels, assign regular stars if applicable
    if (!state.isDailyMode && !state.isBonusMode && shouldLevelHaveStars(lv)) {
        _regularStarCells = assignRegularStars(lv);
    } else {
        _regularStarCells = [];
    }
```

Also clear `_regularStarCells` when entering bonus or daily mode. In `enterBonusMode()` (line 688), add after `state.isBonusMode = true;` (line 699):

```js
    _regularStarCells = [];
```

In `enterDailyMode()` (find it near line 609), add after `state.isDailyMode = true;`:

```js
    _regularStarCells = [];
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: assign regular stars on level entry"
```

---

### Task 4: Render stars on regular game grid

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:2439-2462` (grid rendering — star cell branch)

**Step 1: Generalize the star cell rendering condition**

Currently line 2439 checks only `state.isBonusMode && _bonusStarCells.includes(k)`. Change it to also check `_regularStarCells`.

Replace line 2439:

```js
            } else if (state.isBonusMode && _bonusStarCells.includes(k) && !isStarCollected(k)) {
```

With:

```js
            } else if (((state.isBonusMode && _bonusStarCells.includes(k)) || (!state.isBonusMode && !state.isDailyMode && _regularStarCells.includes(k))) && !isStarCollected(k)) {
```

**Step 2: Also update `pickRandomUnrevealedCell` (line ~1172)**

The function currently avoids star cells only in bonus mode. Update to also avoid regular star cells. Replace lines 1172-1175:

```js
    if (state.isBonusMode && _bonusStarCells.length > 0 && candidates.length > 0) {
        // In bonus mode, prefer non-starred cells
        const nonStarred = candidates.filter(k => !_bonusStarCells.includes(k));
        pool = nonStarred.length > 0 ? nonStarred : candidates;
```

With:

```js
    const activeStarCells = state.isBonusMode ? _bonusStarCells : _regularStarCells;
    if (activeStarCells.length > 0 && candidates.length > 0) {
        // Prefer non-starred cells for hint reveals
        const nonStarred = candidates.filter(k => !activeStarCells.includes(k));
        pool = nonStarred.length > 0 ? nonStarred : candidates;
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: render star overlays on regular game grid"
```

---

### Task 5: Show earned banner stars in regular game header

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:2068-2083` (regular game header in `renderHeader`)

**Step 1: Add star display to regular game header**

In `renderHeader()`, the regular game branch starts at line 2068 (`} else {`). The `header-right` div (lines 2080-2082) currently only has the coin display. Add the star display after it.

Replace lines 2080-2082:

```js
            <div class="header-right">
                <div class="header-btn coin-display" style="color:${theme.text}" id="coin-display">\uD83E\uDE99 ${state.coins.toLocaleString()}</div>
            </div>
```

With:

```js
            <div class="header-right">
                <div class="header-btn coin-display" style="color:${theme.text}" id="coin-display">\uD83E\uDE99 ${state.coins.toLocaleString()}</div>
                <div class="bonus-star-display" id="bonus-star-display">${(function() {
                    const sp = Math.floor(state.bonusStarsTotal / 3);
                    if (sp <= 0) return '';
                    return [0,1,2].filter(i => i < sp).map(i =>
                        '<span class="bonus-star-slot filled">\u2B50</span>'
                    ).join('');
                })()}</div>
            </div>
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: show earned banner stars in regular game header"
```

---

### Task 6: Implement star collection in regular mode

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:2637-2685` (`checkBonusStars` function)

**Step 1: Generalize `checkBonusStars` to handle regular mode**

Replace the entire `checkBonusStars` function (lines 2637-2685):

```js
function checkBonusStars(word) {
    const inBonus = state.isBonusMode && state.bonusPuzzle;
    const inRegular = !state.isBonusMode && !state.isDailyMode && _regularStarCells.length > 0;
    if (!inBonus && !inRegular) return;

    const activeStarCells = inBonus ? _bonusStarCells : _regularStarCells;
    const placement = crossword.placements.find(p => p.word === word);
    if (!placement) return;
    const wordStarCells = placement.cells
        .map(c => c.row + "," + c.col)
        .filter(k => {
            if (!activeStarCells.includes(k)) return false;
            // Skip stars already collected by a previously found word
            for (const p of crossword.placements) {
                if (p.word === word || p.standalone) continue;
                if (state.foundWords.includes(p.word)) {
                    for (const c of p.cells) {
                        if ((c.row + "," + c.col) === k) return false;
                    }
                }
            }
            return true;
        });
    if (wordStarCells.length === 0) return;
    const starsInWord = wordStarCells.length;
    const coinReward = starsInWord * 10;
    if (inBonus) {
        state.bonusPuzzle.starsCollected += starsInWord;
        _bonusCoinsEarned += coinReward;
    }
    state.bonusStarsTotal = Math.min(9, state.bonusStarsTotal + starsInWord);
    state.coins += coinReward;
    state.totalCoinsEarned += coinReward;
    wordStarCells.forEach((cellKey, i) => {
        setTimeout(() => animateStarFly(cellKey), i * 200);
    });
    setTimeout(() => {
        animateBonusCoinFly(wordStarCells[0], coinReward);
    }, wordStarCells.length * 200 + 400);
    const oldPoints = Math.floor((state.bonusStarsTotal - starsInWord) / 3);
    const newPoints = Math.floor(state.bonusStarsTotal / 3);
    if (newPoints > oldPoints) {
        setTimeout(() => {
            renderHeader();
            playSound("bonusChime");
        }, wordStarCells.length * 200 + 600);
    }
    if (inBonus) {
        saveBonusState();
    } else {
        saveProgress();
    }
    renderCoins();

    // Grand prize check
    if (state.bonusStarsTotal >= 9) {
        if (inBonus) {
            setTimeout(() => handleBonusCompletion(), wordStarCells.length * 200 + 800);
        } else {
            // Regular mode: award grand prize inline, do NOT end the level
            setTimeout(() => {
                state.coins += 500;
                state.totalCoinsEarned += 500;
                state.bonusStarsTotal = 0;
                saveProgress();
                renderCoins();
                renderHeader();
                showToast("\uD83C\uDF1F Grand Prize! +500 \uD83E\uDE99", "#d4a51c");
                playSound("bonusChime");
            }, wordStarCells.length * 200 + 800);
        }
    }
}
```

**Step 2: Also check regular stars for auto-completed words**

In `handleWord` around line 1056, the auto-complete star check is only for bonus mode:

```js
        if (state.isBonusMode) {
            for (let i = beforeAuto; i < state.foundWords.length; i++) {
                checkBonusStars(state.foundWords[i]);
            }
        }
```

Change to also run for regular star levels:

```js
        if (state.isBonusMode || _regularStarCells.length > 0) {
            for (let i = beforeAuto; i < state.foundWords.length; i++) {
                checkBonusStars(state.foundWords[i]);
            }
        }
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: star collection and grand prize in regular mode"
```

---

### Task 7: Fix `animateStarFly` to work in regular mode

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:2687-2730` (`animateStarFly` for in-game stars)

**Step 1: Check the function**

`animateStarFly` (line 2687) already targets `bonus-star-display` by ID, which now exists in the regular header too (from Task 5). No changes needed to the animation itself.

However, confirm `animateBonusCoinFly` also works. Search for it:

Find `animateBonusCoinFly` and verify it doesn't check `isBonusMode`. If it does, remove that guard.

**Step 2: Commit (if changes needed)**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "fix: ensure star animations work in regular mode"
```

---

### Task 8: Clear regular stars on level advance and verify cleanup

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `advanceToNextLevel` function

**Step 1: Find `advanceToNextLevel`**

Search for `function advanceToNextLevel`. Ensure `_regularStarCells = []` is set before the new level loads. This should happen naturally via `restoreLevelState`, but verify.

Also ensure that when a level is completed and removed from `inProgress`, the star data is cleaned up (it will be, since `delete state.inProgress[state.currentLevel]` removes the whole entry).

**Step 2: Verify the home screen star display**

The home screen already shows `bonusStarsTotal` via the star slots in the top-right. No changes needed there since we're reusing the same counter.

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "fix: clean up regular star state on level transitions"
```

---

### Task 9: Manual testing checklist

Test the following scenarios:

1. **Star appearance:** Play through several levels — roughly 1 in 5 should have gold star overlays on cells
2. **Star collection:** Find a word containing a star cell — star fly animation to header, +10 coins toast
3. **Banner star increment:** After collecting 3 board stars across levels, a banner star appears in header
4. **Persistence:** Leave a star level mid-game, return — stars should still be in the same positions
5. **Grand prize:** Accumulate 9 board stars (3 banner stars) — 500 coin grand prize, counter resets, level continues
6. **Bonus mode unchanged:** Enter a bonus puzzle — still ends when 9 stars collected
7. **Daily mode:** Daily puzzles should NOT have regular stars
8. **Level complete:** Completing a star level shows the normal completion modal, no star references unless grand prize was triggered during play
