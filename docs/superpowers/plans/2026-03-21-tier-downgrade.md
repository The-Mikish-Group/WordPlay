# Tier Downgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow players to downgrade their difficulty tier, with capacity-based filtering and an auto-promotion ceiling.

**Architecture:** Add a `tierCeiling` state field that caps auto-promotion. Replace the hard downgrade block with capacity-based dropdown filtering. All changes are in `app.js` (state, UI, logic) and `sync.js` (merge).

**Tech Stack:** Vanilla JavaScript, localStorage persistence

**Spec:** `docs/superpowers/specs/2026-03-21-tier-downgrade-design.md`

---

### Task 1: Add `tierCeiling` to state, save, and load

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:162` (initial state)
- Modify: `WordPlay/wwwroot/js/app.js:365-366` (resetStateToDefaults)
- Modify: `WordPlay/wwwroot/js/app.js:526-527` (load)
- Modify: `WordPlay/wwwroot/js/app.js:607-608` (save)

- [ ] **Step 1: Add `tierCeiling` to initial state**

In the state object, after line 162 (`difficultyOffset: 0,`), change the closing `};` to add the new field:

```javascript
    difficultyOffset: 0,      // level offset for current tier
    tierCeiling: -1,           // manual tier cap; -1 = no cap (organic promotion allowed)
};
```

- [ ] **Step 2: Add `tierCeiling` reset in `resetStateToDefaults()`**

At line 366, after `state.difficultyOffset = 0;`, add:

```javascript
    state.tierCeiling = -1;
```

- [ ] **Step 3: Add `tierCeiling` to load logic**

At line 527, after `state.difficultyOffset = d.doff || 0;`, add:

```javascript
            state.tierCeiling = d.tc !== undefined ? d.tc : -1;
```

- [ ] **Step 4: Add `tierCeiling` to save logic**

At line 608, after `doff: state.difficultyOffset,`, add:

```javascript
            tc: state.tierCeiling,
```

- [ ] **Step 5: Verify manually**

Open the app in browser, open DevTools console, run:
```javascript
JSON.parse(localStorage.getItem("wordplay-save"))
```
Confirm the save object now includes a `tc` field (will be `-1` after a fresh save).

- [ ] **Step 6: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add tierCeiling state field for downgrade support"
```

---

### Task 2: Guard auto-promotion with `tierCeiling`

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:2530-2541` (checkTierPromotion)

- [ ] **Step 1: Add ceiling guard to `checkTierPromotion()`**

At line 2531, after the existing early-return guard, add:

```javascript
    if (state.tierCeiling >= 0 && state.difficultyTier >= state.tierCeiling) return;
```

The full function should now read:

```javascript
function checkTierPromotion() {
    if (state.difficultyTier < 0 || state.difficultyTier >= DIFFICULTY_TIERS.length - 1) return;
    if (state.tierCeiling >= 0 && state.difficultyTier >= state.tierCeiling) return;
    const nextTier = DIFFICULTY_TIERS[state.difficultyTier + 1];
    // Threshold in display terms: how many levels until the next tier's data range
    const threshold = nextTier.offset - state.difficultyOffset + 1;
    if (state.highestLevel >= threshold) {
        state.difficultyTier++;
        // Do NOT change difficultyOffset — organic promotion is just a label change
        saveProgress();
        setTimeout(() => renderTierPromotion(nextTier), 600);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: respect tierCeiling in auto-promotion check"
```

---

### Task 3: Replace dropdown filtering with capacity-based logic

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:4361-4380` (dropdown rendering in renderMenu)

- [ ] **Step 1: Replace the dropdown rendering block**

Replace lines 4361-4380 (the entire `if (state.difficultyTier >= 0)` block) with:

```javascript
    if (state.difficultyTier >= 0) {
        let tierOptions = "";
        for (let i = 0; i < DIFFICULTY_TIERS.length; i++) {
            const t = DIFFICULTY_TIERS[i];
            // Compute capacity: levels available in this tier
            const capacity = (i < DIFFICULTY_TIERS.length - 1)
                ? DIFFICULTY_TIERS[i + 1].offset - t.offset
                : Infinity;
            if (state.highestLevel > capacity) continue; // tier too small
            tierOptions += `<option value="${i}" ${i === state.difficultyTier ? "selected" : ""}>${t.label} \u2014 ${t.tagline}</option>`;
        }
        const hint = state.tierCeiling >= 0
            ? "Auto-promotion paused. Select a higher tier to resume."
            : "Higher tiers have harder puzzles.";
        html += `
            <div class="menu-setting">
                <label class="menu-setting-label">Difficulty Tier</label>
                <select id="menu-tier-select" class="menu-setting-select" style="accent-color:${theme.accent}">
                    ${tierOptions}
                </select>
                <div class="menu-setting-hint">${hint}</div>
            </div>
        `;
    }
```

- [ ] **Step 2: Verify manually**

Open the app settings menu. Confirm:
- All valid tiers appear (including lower ones)
- Tiers whose capacity < `highestLevel` are hidden
- Hint text shows "Higher tiers have harder puzzles." (when no ceiling is set)

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: show all reachable tiers in dropdown with capacity filter"
```

---

### Task 4: Update tier change handler to allow downgrade and set ceiling

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:4749-4771` (tierSelect.onchange handler)

- [ ] **Step 1: Replace the tier change handler**

Replace lines 4749-4771 with:

```javascript
    const tierSelect = document.getElementById("menu-tier-select");
    if (tierSelect) {
        tierSelect.onchange = () => {
            const newIdx = parseInt(tierSelect.value);
            if (newIdx === state.difficultyTier) return;
            const newTier = DIFFICULTY_TIERS[newIdx];
            // Set or clear the auto-promotion ceiling
            if (newIdx < state.difficultyTier) {
                state.tierCeiling = newIdx; // downgrade: cap auto-promotion
            } else {
                state.tierCeiling = -1;     // upgrade: restore organic promotion
            }
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
    }
```

- [ ] **Step 2: Verify downgrade manually**

1. Open the app, go to Settings, select a lower tier
2. Confirm the tier changes, toast appears, level reloads
3. Check DevTools console: `JSON.parse(localStorage.getItem("wordplay-save")).tc` should equal the new tier index
4. Confirm hint text now shows "Auto-promotion paused. Select a higher tier to resume."

- [ ] **Step 3: Verify upgrade clears ceiling**

1. Select a higher tier from the dropdown
2. Confirm `tc` in localStorage is now `-1`
3. Confirm hint text reverts to "Higher tiers have harder puzzles."

- [ ] **Step 4: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: allow tier downgrade with auto-promotion ceiling"
```

---

### Task 5: Add `tierCeiling` to sync merge

**Files:**
- Modify: `WordPlay/wwwroot/js/sync.js:226-227` (merge logic)

- [ ] **Step 1: Add `tc` to merge**

At line 227, after `merged.doff = primary.doff || 0;`, add:

```javascript
    merged.tc = primary.tc !== undefined ? primary.tc : -1;
```

- [ ] **Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/sync.js
git commit -m "feat: include tierCeiling in cross-device sync merge"
```

---

### Task 6: Version bump and documentation

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:6` (APP_VERSION)
- Modify: `WordPlay/wwwroot/sw.js:1` (CACHE_NAME)
- Modify: `WordPlay/wwwroot/sw.js` (ASSETS ?v= params)
- Modify: `WordPlay/wwwroot/index.html` (script/link ?v= params)

- [ ] **Step 1: Bump APP_VERSION**

In `app.js` line ~6, increment from `"1.4.2"` to `"1.4.3"`.

- [ ] **Step 2: Bump CACHE_NAME**

In `sw.js` line 1, increment from `wordplay-v103` to `wordplay-v104`.

- [ ] **Step 3: Bump ?v= query strings**

Increment `?v=53` to `?v=54` in both:
- `sw.js` ASSETS array
- `index.html` script/link tags

These must match each other.

- [ ] **Step 4: Update in-game guide**

In `app.js` line 6424, in the GUIDE_SECTIONS "Difficulty Tiers" entry, replace:

```
(but you can\u2019t go back down)
```

with:

```
You can also switch to a lower tier if puzzles feel too hard \u2014 tiers that can\u2019t fit your level count are hidden. Lowering your tier pauses auto-promotion until you move back up.
```

Remove the `(but you can't go back down)` parenthetical and the sentence `You can also manually upgrade in Settings` — replace both with the new text above.

- [ ] **Step 5: Update README.md**

At line 116 of `README.md`, replace:

```
Tier is set automatically based on progress and can be manually upgraded (but not downgraded) in Settings.
```

with:

```
Tier is set automatically based on progress and can be changed in Settings. Tiers whose level capacity is smaller than your current level are hidden.
```

- [ ] **Step 6: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html README.md
git commit -m "chore: bump version and update docs for tier downgrade"
```

---

### Task 7: End-to-end verification

- [ ] **Step 1: Fresh start test**

Clear localStorage, reload the app. Pick a tier. Confirm the tier chooser works as before.

- [ ] **Step 2: Downgrade test**

Play a few levels on Hard. Open Settings, confirm Easy is hidden (capacity 250 < highestLevel if > 250, otherwise visible). Select Medium. Confirm:
- Display level unchanged
- Level content changed (different puzzle)
- `tc` is set in localStorage
- Hint shows auto-promotion paused message

- [ ] **Step 3: Upgrade test**

From Medium, select Expert. Confirm:
- `tc` is cleared to `-1`
- Hint reverts to standard text
- Level content changed

- [ ] **Step 4: Auto-promotion ceiling test**

Downgrade to a lower tier. Complete a level. Confirm no auto-promotion toast/animation fires even if `highestLevel` exceeds the next tier's threshold.
