# Layout Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let players toggle between crossword and flow/zen grid layouts mid-game by tapping the header-center, with a settings preference for default layout.

**Architecture:** Add a `state.layoutPref` setting ("auto"/"crossword"/"flow") and a transient `_currentLayoutIsZen` flag. On toggle, regenerate the grid via the alternate layout function, re-map `revealedCells` and star cells by building a letter-position lookup from the old layout, then finding matching positions in the new layout. The standalone coin word becomes a regular placed word in zen mode. The header-center gets an onclick handler in all game modes.

**Tech Stack:** Vanilla JS (app.js), CSS (app.css) — single-file game, no build system, no test framework.

---

### Task 1: Add layout state and preference

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:137` (state object)
- Modify: `WordPlay/wwwroot/js/app.js:478` (loadProgress)
- Modify: `WordPlay/wwwroot/js/app.js:540` (saveProgress)

**Step 1: Add state fields**

In the `state` object (around line 137, near `soundEnabled`), add:

```js
    layoutPref: "auto",        // "auto" | "crossword" | "flow"
```

Add a transient variable near the other transient state (around line 220, near `_bonusStarCells`):

```js
let _currentLayoutIsZen = false;  // whether the current grid is in zen/flow layout
```

**Step 2: Load the preference**

In `loadProgress` (around line 478, near `state.soundEnabled = d.se`), add:

```js
            state.layoutPref = d.lp || "auto";
```

**Step 3: Save the preference**

In `saveProgress` (around line 540, near `se: state.soundEnabled`), add:

```js
            lp: state.layoutPref,
```

**Step 4: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add layoutPref state and persistence"
```

---

### Task 2: Track current layout in recompute and apply preference

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:390` (recompute — layout decision)

**Step 1: Replace the layout decision block**

In `recompute()`, find the layout decision (around line 390):

```js
    if (level.zen || _forceZenLayout || (!state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel))) {
        crossword = generateZenGrid(gridWords);
        standaloneWord = null;
    } else {
        const extracted = extractStandaloneWord(gridWords, 12);
        crossword = extracted.crossword;
        standaloneWord = extracted.standalone;
    }
```

Replace with:

```js
    // Determine if this level should use zen layout
    const naturalZen = level.zen || _forceZenLayout || (!state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel));
    if (state.layoutPref === "flow") {
        _currentLayoutIsZen = true;
    } else if (state.layoutPref === "crossword") {
        _currentLayoutIsZen = false;
    } else {
        _currentLayoutIsZen = naturalZen;
    }

    if (_currentLayoutIsZen) {
        crossword = generateZenGrid(gridWords);
        standaloneWord = null;
    } else {
        const extracted = extractStandaloneWord(gridWords, 12);
        crossword = extracted.crossword;
        standaloneWord = extracted.standalone;
    }
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: apply layout preference in recompute"
```

---

### Task 3: Build the cell re-mapping utility

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add near `restoreLevelState`, around line 617)

**Step 1: Add the re-map function**

After `restoreLevelState` (around line 617), add:

```js
function remapCells(oldCells, oldPlacements, newPlacements) {
    // Build lookup: for each old placement, map each cell index to {word, letterIdx}
    const oldLookup = {};
    for (const p of oldPlacements) {
        for (let i = 0; i < p.cells.length; i++) {
            const k = p.cells[i].row + "," + p.cells[i].col;
            if (!oldLookup[k]) oldLookup[k] = [];
            oldLookup[k].push({ word: p.word, letterIdx: i });
        }
    }
    // Build reverse lookup: for each new placement, map {word, letterIdx} to cell key
    const newLookup = {};
    for (const p of newPlacements) {
        for (let i = 0; i < p.cells.length; i++) {
            newLookup[p.word + ":" + i] = p.cells[i].row + "," + p.cells[i].col;
        }
    }
    // Re-map each old cell to its new position
    const result = [];
    const seen = new Set();
    for (const oldKey of oldCells) {
        const refs = oldLookup[oldKey];
        if (!refs) continue;
        for (const ref of refs) {
            const newKey = newLookup[ref.word + ":" + ref.letterIdx];
            if (newKey && !seen.has(newKey)) {
                seen.add(newKey);
                result.push(newKey);
                break;
            }
        }
    }
    return result;
}
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add cell re-mapping utility for layout toggle"
```

---

### Task 4: Implement the toggle function

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add after `remapCells`)

**Step 1: Add `toggleLayout` function**

```js
function toggleLayout() {
    if (!crossword || !level) return;
    const oldPlacements = crossword.placements;
    const oldRevealedCells = [...state.revealedCells];
    const oldStarCells = state.isBonusMode ? [..._bonusStarCells] : [..._regularStarCells];
    const oldDailyCoinKey = _dailyCoinCellKey;

    // Toggle
    _currentLayoutIsZen = !_currentLayoutIsZen;

    // Regenerate grid
    const gridWords = level.words;
    if (_currentLayoutIsZen) {
        crossword = generateZenGrid(gridWords);
        standaloneWord = null;
    } else {
        const extracted = extractStandaloneWord(gridWords, 12);
        crossword = extracted.crossword;
        standaloneWord = extracted.standalone;
    }
    placedWords = crossword.placements.map(p => p.word);
    bonusPool = [...(level.bonus || []), ...gridWords.filter(w => !placedWords.includes(w))];
    if (standaloneWord) bonusPool = bonusPool.filter(w => w !== standaloneWord);
    totalRequired = placedWords.length;

    // Re-map revealed cells
    state.revealedCells = remapCells(oldRevealedCells, oldPlacements, crossword.placements);

    // Re-map star cells
    if (state.isBonusMode) {
        _bonusStarCells = remapCells(oldStarCells, oldPlacements, crossword.placements);
        if (state.bonusPuzzle) state.bonusPuzzle.starCells = _bonusStarCells;
    } else {
        _regularStarCells = remapCells(oldStarCells, oldPlacements, crossword.placements);
    }

    // Re-map daily coin cell
    if (oldDailyCoinKey) {
        const mapped = remapCells([oldDailyCoinKey], oldPlacements, crossword.placements);
        _dailyCoinCellKey = mapped.length > 0 ? mapped[0] : null;
    }

    // Ensure standalone found state is consistent
    if (_currentLayoutIsZen && standaloneWord === null) {
        // Standalone word is now a regular placed word — if it was already found, it's in foundWords
    } else if (!_currentLayoutIsZen && standaloneWord) {
        // Standalone word extracted — if already found as regular word, mark standaloneFound
        if (state.foundWords.includes(standaloneWord)) {
            state.standaloneFound = true;
        }
    }

    // Re-render
    renderAll();
    playSound("letterClick");
}
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: implement toggleLayout function"
```

---

### Task 5: Wire up header-center as toggle tap target

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:2060-2145` (renderHeader — all three mode branches)
- Modify: `WordPlay/wwwroot/css/app.css` (cursor style for header-center)

**Step 1: Add onclick to header-center in all mode branches**

In `renderHeader()`, after the event wiring for each mode branch, add the toggle handler. Find each `document.getElementById("back-home-btn").onclick` block. After each one, add:

```js
    const headerCenter = document.querySelector(".header-center");
    if (headerCenter) headerCenter.onclick = toggleLayout;
```

There are three places this needs to go — after the bonus mode back-btn handler (around line 2073 area), after the daily mode back-btn handler (around line 2123 area), and after the regular mode back-btn handler (around line 2146 area).

The simplest approach: add it ONCE at the very end of `renderHeader()`, right before the closing `}`. Find the end of `renderHeader` (look for the regular mode back-btn onclick that ends with `};` followed by `}`). Right before that final `}`, add:

```js
    const hdrCenter = document.querySelector(".header-center");
    if (hdrCenter) hdrCenter.onclick = toggleLayout;
```

**Step 2: Add CSS cursor**

In `app.css`, find `.header-center` styles (or if none exist, add):

```css
.header-center {
    cursor: pointer;
}
```

If `.header-center` already has styles, just add `cursor: pointer;` to the existing rule.

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: wire header-center as layout toggle tap target"
```

---

### Task 6: Add Grid Layout setting to menu

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — renderMenu (settings HTML and handler wiring)

**Step 1: Add the setting UI**

In `renderMenu()`, find the Difficulty Tier setting block (around line 4047). Right AFTER the tier block's closing `};` (the `</div>` + template literal end around line 4055-4056), add:

```js
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Grid Layout</label>
            <select id="menu-layout-select" class="menu-setting-select" style="accent-color:${theme.accent}">
                <option value="auto" ${state.layoutPref === "auto" ? "selected" : ""}>Auto</option>
                <option value="crossword" ${state.layoutPref === "crossword" ? "selected" : ""}>Crossword</option>
                <option value="flow" ${state.layoutPref === "flow" ? "selected" : ""}>Flow</option>
            </select>
            <div class="menu-setting-hint">Auto uses crossword by default and flow every 5th level. Toggle mid-game by tapping the level info.</div>
        </div>
    `;
```

**Step 2: Wire up the handler**

In the event wiring section of `renderMenu`, find the tier select handler (`document.getElementById("menu-tier-select")`). After that handler block, add:

```js
    const layoutSelect = document.getElementById("menu-layout-select");
    if (layoutSelect) {
        layoutSelect.onchange = () => {
            state.layoutPref = layoutSelect.value;
            saveProgress();
            showToast("Layout set to " + state.layoutPref);
        };
    }
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add Grid Layout preference to settings menu"
```

---

### Task 7: Update the player's guide

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — guide entries array (around line 5980)

**Step 1: Add guide entry**

Find the Flow Levels guide entry (around line 5989, starts with `{ icon: "\uD83C\uDF0A", title: "Flow Levels"`). Replace it with an updated version that covers the toggle:

```js
    { icon: "\uD83C\uDF0A", title: "Flow Levels", body: "Every 5th level (5, 10, 15, 20\u2026) is a <b>flow level</b>! These use a stacked layout instead of the usual crossword. Same words, same letters \u2014 just a different visual style with <b>3x rewards</b>: 3 coins per word, 15 per bonus word, and 200 for the coin word." },
    { icon: "\u21C4", title: "Grid Layouts", body: "WordPlay has two grid styles: <b>Crossword</b> (interlocking words) and <b>Flow</b> (stacked rows). You can <b>switch between them anytime</b> by tapping the level info at the top of the screen (the pack name and level number). All your progress \u2014 found words, hints, and stars \u2014 carries over when you switch. Set your preferred default in <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a> under Grid Layout: Auto (game decides), Crossword, or Flow." },
```

**Step 2: Also update the Speed Bonus entry** (line ~5990) to say "10 seconds per word" instead of "15 seconds per word" since we changed that earlier:

Find `15 seconds per word` in the guide and replace with `10 seconds per word`.

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: update guide with grid layout toggle and speed bonus time"
```

---

### Task 8: Handle edge cases

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js`

**Step 1: Persist layout state in saveInProgressState**

In `saveInProgressState` (around line 563), add to the in-progress object:

```js
            zen: _currentLayoutIsZen || undefined,
```

**Step 2: Restore layout state in restoreLevelState**

In the `if (ip)` block of `restoreLevelState` (around line 588), add before the `return;`:

```js
        _currentLayoutIsZen = ip.zen || false;
```

In the fresh/completed level section (after the star assignment block), add:

```js
    // _currentLayoutIsZen was already set by recompute based on layoutPref
```

(This is a comment-only reminder — `recompute` already sets `_currentLayoutIsZen` before `restoreLevelState` runs.)

**Step 3: Override recompute's layout choice when restoring in-progress level**

The tricky part: `recompute()` sets `_currentLayoutIsZen` based on preference, but if the player toggled layout and left mid-game, we need to restore their toggle choice. After `restoreLevelState()` is called and sets `_currentLayoutIsZen` from `ip.zen`, we need to regenerate the grid if it differs from what `recompute` chose.

In the home play-btn onclick (around line 2012), change:

```js
        await recompute();
        restoreLevelState();
```

To:

```js
        await recompute();
        restoreLevelState();
        // If restored level had a toggled layout, regenerate grid
        const ip = state.inProgress[state.currentLevel];
        if (ip && ip.zen !== undefined && ip.zen !== _currentLayoutIsZen) {
            // recompute set a different layout than what was saved — toggle to match
            _currentLayoutIsZen = ip.zen;
            const gridWords = level.words;
            if (_currentLayoutIsZen) {
                crossword = generateZenGrid(gridWords);
                standaloneWord = null;
            } else {
                const extracted = extractStandaloneWord(gridWords, 12);
                crossword = extracted.crossword;
                standaloneWord = extracted.standalone;
            }
            placedWords = crossword.placements.map(p => p.word);
            bonusPool = [...(level.bonus || []), ...gridWords.filter(w => !placedWords.includes(w))];
            if (standaloneWord) bonusPool = bonusPool.filter(w => w !== standaloneWord);
            totalRequired = placedWords.length;
            // Re-restore state since placements changed
            state.foundWords = (ip.fw || []).filter(w => placedWords.includes(w));
            state.revealedCells = ip.rc || [];
            state.standaloneFound = ip.sf || false;
            _regularStarCells = ip.rsc || [];
            if (state.standaloneFound && standaloneWord && !state.foundWords.includes(standaloneWord)) {
                state.foundWords.push(standaloneWord);
            }
            while (checkAutoCompleteWords()) {}
        }
```

Do the same for the daily mode and bonus mode entry points where `recompute` + restore happens. Check `enterDailyMode` and `enterBonusMode` for similar patterns.

For `enterBonusMode` (around line 700-720), the zen flag should also be saved/restored in `saveBonusState`/bonus restore. Add `zen: _currentLayoutIsZen || undefined` to `saveBonusState` and restore it in `enterBonusMode`.

For `enterDailyMode` (around line 640-660), add `zen` to `saveDailyState` and restore in `enterDailyMode`.

**Step 4: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: persist toggled layout across save/restore for all modes"
```

---

### Task 9: Update header text to reflect current layout

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — renderHeader

**Step 1: Show layout indicator in header**

In `renderHeader()`, for the regular game branch (around line 2132), update the pack line to show a wave icon when in zen mode regardless of whether it's a natural flow level:

Replace:

```js
                <div class="header-pack">${flowLevel ? '\uD83C\uDF0A ' : ''}${level.group} \u00B7 ${level.pack}</div>
```

With:

```js
                <div class="header-pack">${_currentLayoutIsZen ? '\uD83C\uDF0A ' : ''}${level.group} \u00B7 ${level.pack}</div>
```

Do the same for the daily mode branch if it shows a flow indicator.

For the bonus mode branch, add a wave prefix when in zen:

Replace:

```js
                <div class="header-pack" style="color:#d4a51c">\u2B50 Bonus Puzzle</div>
```

With:

```js
                <div class="header-pack" style="color:#d4a51c">${_currentLayoutIsZen ? '\uD83C\uDF0A ' : ''}\u2B50 Bonus Puzzle</div>
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: show wave icon in header when in flow layout"
```

---

### Task 10: Manual testing checklist

1. **Toggle works**: Tap header-center during a level — grid switches between crossword and flow
2. **Found words persist**: Find a word, toggle, word is still shown as found
3. **Revealed cells persist**: Use a hint, toggle, the revealed letter is still visible in the correct position
4. **Stars persist**: On a star level, toggle — star overlays appear in correct new positions
5. **Standalone coin word**: In crossword mode the coin word is standalone; toggle to flow — it becomes a stacked word (still awards coins)
6. **Daily mode toggle**: Enter daily puzzle, toggle works
7. **Bonus mode toggle**: Enter bonus puzzle, toggle works
8. **Settings preference**: Set to "Flow" in settings, start a level — starts in flow. Toggle to crossword — works. Leave and come back — starts in flow again
9. **Settings preference "Crossword"**: Flow levels (every 5th) still start in crossword. Toggle to flow works.
10. **Save/restore**: Toggle to non-default layout mid-level, go home, come back — restored in the toggled layout
11. **Guide entry**: Check guide shows the new "Grid Layouts" entry
12. **3x rewards**: Flow level rewards (3x) should be based on the LEVEL NUMBER (every 5th), not the layout — toggling to flow on a non-5th level should NOT give 3x rewards
