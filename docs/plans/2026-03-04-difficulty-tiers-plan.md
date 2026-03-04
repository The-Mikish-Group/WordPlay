# Difficulty Tiers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let players choose a difficulty tier (Easy/Medium/Hard/Expert) that offsets their starting level, with auto-promotion on crossing tier boundaries, a celebration dialog, settings dropdown, and speed milestone gating.

**Architecture:** A numeric offset (`state.difficultyOffset`) shifts the actual level loaded by `getLevel()`. Display level = actual level - offset. All UI (header, map, home, completion modal, settings) shows display levels. The offset is stored in save data and synced. A first-launch modal forces tier selection. Auto-promotion triggers a trophy+flame achievement dialog.

**Tech Stack:** Vanilla JS (app.js), CSS animations (app.css), sync merge logic (sync.js).

---

### Task 1: Add State Fields & Constants

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:106-149` (state object)
- Modify: `WordPlay/wwwroot/js/app.js:324-348` (resetStateToDefaults)

**Step 1: Add tier constants after the state object**

Find the line with `const state = {` (line 106). Before it, add the tier constants:

```javascript
// ---- DIFFICULTY TIERS ----
const DIFFICULTY_TIERS = [
    { key: "easy",   label: "Easy",   offset: 0,    tagline: "New to word games" },
    { key: "medium", label: "Medium", offset: 250,  tagline: "I know my way around" },
    { key: "hard",   label: "Hard",   offset: 2000, tagline: "Bring it on" },
    { key: "expert", label: "Expert", offset: 5000, tagline: "Challenge me" },
];
```

**Step 2: Add state fields inside the `state` object**

After `isDailyMode: false,` (line 148), add:

```javascript
    difficultyTier: -1,       // tier index (0=Easy,1=Medium,2=Hard,3=Expert), -1 = not chosen yet
    difficultyOffset: 0,      // level offset for current tier
```

**Step 3: Add to resetStateToDefaults**

After `state.flowsCompleted = 0;` (line 347), add:

```javascript
    state.difficultyTier = -1;
    state.difficultyOffset = 0;
```

**Step 4: Add display level helper**

After the `isFlowLevel(n)` helper function, add:

```javascript
function displayLevel(actualLevel) {
    return actualLevel - state.difficultyOffset;
}

function actualLevel(displayLv) {
    return displayLv + state.difficultyOffset;
}
```

**Step 5: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js`
Expected: No errors

**Step 6: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add difficulty tier state fields and constants"
```

---

### Task 2: Save/Load/Sync Tier Data

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:488-520` (saveProgress)
- Modify: `WordPlay/wwwroot/js/app.js:422-486` (loadProgress)
- Modify: `WordPlay/wwwroot/js/sync.js:109-196` (mergeProgress)

**Step 1: Add to saveProgress**

In the `JSON.stringify({` block, after `fc: state.flowsCompleted,` (line 516), add:

```javascript
            dt: state.difficultyTier,
            doff: state.difficultyOffset,
```

**Step 2: Add to loadProgress**

After `state.flowsCompleted = d.fc || 0;` (line 474), add:

```javascript
            state.difficultyTier = d.dt !== undefined ? d.dt : -1;
            state.difficultyOffset = d.doff || 0;
```

**Step 3: Add to mergeProgress in sync.js**

After `merged.fc = Math.max(local.fc || 0, server.fc || 0);` (line 193), add:

```javascript
    // Difficulty tier: take from whichever has higher tier (up only)
    const localTier = local.dt !== undefined ? local.dt : -1;
    const serverTier = server.dt !== undefined ? server.dt : -1;
    merged.dt = Math.max(localTier, serverTier);
    // Offset matches the tier
    if (merged.dt >= 0 && merged.dt < 4) {
        const offsets = [0, 250, 2000, 5000];
        merged.doff = offsets[merged.dt];
    } else {
        merged.doff = Math.max(local.doff || 0, server.doff || 0);
    }
```

**Step 4: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js && node --check WordPlay/wwwroot/js/sync.js`
Expected: No errors

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/js/sync.js
git commit -m "feat: save/load/sync difficulty tier data"
```

---

### Task 3: First-Launch Tier Chooser Modal

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add new function after `renderDailyModal`)
- Modify: `WordPlay/wwwroot/css/app.css` (add tier chooser styles)

**Step 1: Add renderTierChooser function**

After the `renderDailyModal` function (around line 2092), add:

```javascript
function renderTierChooser() {
    let overlay = document.getElementById("tier-chooser");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "tier-chooser";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    overlay.style.zIndex = "9999";

    const tierColors = ["#4CAF50", "#2196F3", "#FF9800", "#f44336"];
    const tierEmojis = ["\uD83C\uDF31", "\uD83D\uDCAA", "\uD83D\uDD25", "\uD83D\uDC8E"];

    let btnsHtml = "";
    DIFFICULTY_TIERS.forEach((t, i) => {
        btnsHtml += `
            <button class="tier-choice-btn" data-tier="${i}" style="border-color:${tierColors[i]}">
                <span class="tier-choice-emoji">${tierEmojis[i]}</span>
                <span class="tier-choice-label" style="color:${tierColors[i]}">${t.label}</span>
                <span class="tier-choice-tagline">${t.tagline}</span>
            </button>`;
    });

    overlay.innerHTML = `
        <div class="modal-box tier-chooser-box">
            <div class="modal-emoji">\uD83C\uDFAF</div>
            <h2 class="modal-title" style="color:${theme.accent}">Choose Your Level</h2>
            <p class="tier-chooser-subtitle">Pick a starting difficulty. You can always move up later in Settings.</p>
            <div class="tier-choices">${btnsHtml}</div>
            <p class="tier-chooser-hint">Not sure? Check the <a href="#" id="tier-guide-link" style="color:${theme.accent}">Player Guide</a> for details.</p>
        </div>
    `;

    overlay.querySelectorAll(".tier-choice-btn").forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute("data-tier"));
            const tier = DIFFICULTY_TIERS[idx];
            state.difficultyTier = idx;
            state.difficultyOffset = tier.offset;
            // Apply offset to starting level
            if (state.highestLevel <= 1) {
                state.currentLevel = tier.offset + 1;
                state.highestLevel = tier.offset + 1;
            }
            saveProgress();
            overlay.style.display = "none";
            renderHome();
        };
    });

    const guideLink = document.getElementById("tier-guide-link");
    if (guideLink) {
        guideLink.onclick = (e) => {
            e.preventDefault();
            state.showGuide = true;
            renderGuide();
        };
    }
}
```

**Step 2: Trigger the chooser in renderHome**

In `renderHome()`, right after the event handlers are wired up (after `home-play-btn` onclick, around line 1918), add:

```javascript
    // First-launch: force tier selection
    if (state.difficultyTier < 0) {
        setTimeout(() => renderTierChooser(), 300);
    }
```

**Step 3: Add CSS for tier chooser**

In `app.css`, add at the end:

```css
/* ---- Difficulty Tier Chooser ---- */
.tier-chooser-box { max-width: 340px; }
.tier-chooser-subtitle { font-size: 14px; opacity: 0.8; margin: 4px 0 16px; line-height: 1.4; }
.tier-choices { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.tier-choice-btn {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.06); border: 2px solid; border-radius: 14px;
    padding: 14px 16px; cursor: pointer; transition: background 0.2s, transform 0.15s;
    text-align: left;
}
.tier-choice-btn:hover, .tier-choice-btn:active { background: rgba(255,255,255,0.12); transform: scale(1.02); }
.tier-choice-emoji { font-size: 28px; flex-shrink: 0; }
.tier-choice-label { font-size: 17px; font-weight: 700; display: block; }
.tier-choice-tagline { font-size: 13px; opacity: 0.65; display: block; }
.tier-chooser-hint { font-size: 12px; opacity: 0.5; margin-top: 14px; }
```

**Step 4: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js`
Expected: No errors

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: first-launch difficulty tier chooser modal"
```

---

### Task 4: Apply Offset to Level Loading & Display

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — multiple sites

This is the core task. Every place that shows `state.currentLevel` or `state.highestLevel` to the user needs to show the display level instead. The actual level numbers stay internal.

**Step 1: Update home screen play button**

Find the home play button (line ~1877-1878):
```javascript
                    <span class="home-level-label">Level</span>
                    <span class="home-level-num" style="font-size:${state.currentLevel >= 100000 ? 22 : state.currentLevel >= 10000 ? 26 : 36}px">${state.currentLevel.toLocaleString()}</span>
```

Replace with:
```javascript
                    <span class="home-level-label">Level</span>
                    <span class="home-level-num" style="font-size:${displayLevel(state.currentLevel) >= 100000 ? 22 : displayLevel(state.currentLevel) >= 10000 ? 26 : 36}px">${displayLevel(state.currentLevel).toLocaleString()}</span>
```

**Step 2: Update regular header**

Find the regular header level display (line ~2024):
```javascript
                <div class="header-level" style="color:${theme.accent}">Level ${state.currentLevel}</div>
```

Replace with:
```javascript
                <div class="header-level" style="color:${theme.accent}">Level ${displayLevel(state.currentLevel)}</div>
```

**Step 3: Update completion modal**

Find the regular completion modal subtitle (line ~3628):
```javascript
                <p class="modal-subtitle">${flowLevel ? '\uD83C\uDF0A Flow Level \u00B7 ' : ''}${level.group} \u00B7 ${level.pack} \u00B7 Level ${state.currentLevel}</p>
```

Replace with:
```javascript
                <p class="modal-subtitle">${flowLevel ? '\uD83C\uDF0A Flow Level \u00B7 ' : ''}${level.group} \u00B7 ${level.pack} \u00B7 Level ${displayLevel(state.currentLevel)}</p>
```

**Step 4: Update Settings stats**

Find the Settings stats section (lines ~3739-3746):
```javascript
                <div class="menu-stat">Highest Level: <span style="color:${theme.accent}">${state.highestLevel.toLocaleString()}</span></div>
```
Replace with:
```javascript
                <div class="menu-stat">Highest Level: <span style="color:${theme.accent}">${displayLevel(state.highestLevel).toLocaleString()}</span></div>
```

And the current level card:
```javascript
                <div class="menu-current-num" style="color:${theme.accent}">${state.currentLevel.toLocaleString()}</div>
```
Replace with:
```javascript
                <div class="menu-current-num" style="color:${theme.accent}">${displayLevel(state.currentLevel).toLocaleString()}</div>
```

**Step 5: Update map group view level ranges**

Find in `_renderMapGroupView` (line ~5488):
```javascript
        html += `<div class="map-pack-range">Levels ${g.start.toLocaleString()} – ${g.end.toLocaleString()} · ${g.packCount} packs</div></div></div>`;
```
Replace with:
```javascript
        html += `<div class="map-pack-range">Levels ${displayLevel(g.start).toLocaleString()} – ${displayLevel(g.end).toLocaleString()} · ${g.packCount} packs</div></div></div>`;
```

**Step 6: Update map pack view level ranges**

Find in `_renderMapPackView` (line ~5560):
```javascript
        html += `<div class="map-pack-range">Levels ${p.start.toLocaleString()} – ${p.end.toLocaleString()}</div></div></div>`;
```
Replace with:
```javascript
        html += `<div class="map-pack-range">Levels ${displayLevel(p.start).toLocaleString()} – ${displayLevel(p.end).toLocaleString()}</div></div></div>`;
```

**Step 7: Update renderSnakeNodes**

Find `renderSnakeNodes` (line ~5307). Any place it displays level numbers to the user, wrap with `displayLevel()`. The node labels that show level numbers need updating. Search for where the node shows the level number and apply `displayLevel()`.

**Step 8: Update goToLevel guard**

Find `goToLevel` (line ~1728-1730). The `num` parameter from the map is already an actual level number (from `data-lv` attributes), so `goToLevel` itself doesn't need changing — but verify the `data-lv` attributes in renderSnakeNodes use actual level numbers (they should, since they're computed from `pack.start`).

**Step 9: Hide groups/packs before the offset**

In `_renderMapGroupView`, the line `if (g.start > state.highestLevel) continue;` (line 5472) already filters future groups. But we also need to hide groups entirely below the offset. Add after that line:

```javascript
        if (g.end < state.difficultyOffset + 1) continue; // below tier start
```

Similarly in `_renderMapPackView`, after `if (p.start > state.highestLevel) continue;` (line 5539):

```javascript
        if (p.end < state.difficultyOffset + 1) continue; // below tier start
```

**Step 10: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js`
Expected: No errors

**Step 11: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: apply difficulty offset to all level displays"
```

---

### Task 5: Auto-Promotion & Achievement Dialog

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `advanceToNextLevel` and `handleNextLevel`, plus new dialog function
- Modify: `WordPlay/wwwroot/css/app.css` — achievement dialog styles

**Step 1: Add auto-promotion check function**

After the `renderTierChooser` function, add:

```javascript
function checkTierPromotion() {
    if (state.difficultyTier < 0 || state.difficultyTier >= DIFFICULTY_TIERS.length - 1) return;
    const nextTier = DIFFICULTY_TIERS[state.difficultyTier + 1];
    if (state.highestLevel >= nextTier.offset + 1) {
        state.difficultyTier++;
        state.difficultyOffset = nextTier.offset;
        saveProgress();
        setTimeout(() => renderTierPromotion(nextTier), 600);
    }
}
```

**Step 2: Add achievement dialog function**

```javascript
function renderTierPromotion(tier) {
    let overlay = document.getElementById("tier-promotion");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "tier-promotion";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    overlay.style.zIndex = "9998";

    const tierColors = ["#4CAF50", "#2196F3", "#FF9800", "#f44336"];
    const tierEmojis = ["\uD83C\uDF31", "\uD83D\uDCAA", "\uD83D\uDD25", "\uD83D\uDC8E"];
    const tierIdx = DIFFICULTY_TIERS.indexOf(tier);
    const color = tierColors[tierIdx] || theme.accent;
    const emoji = tierEmojis[tierIdx] || "\uD83C\uDFC6";

    overlay.innerHTML = `
        <div class="modal-box tier-promotion-box" style="border:2px solid ${color}50;box-shadow:0 0 60px ${color}30">
            <div class="tier-promotion-anim">
                <div class="tier-trophy">\uD83C\uDFC6</div>
                <div class="tier-flame" style="color:${color}">${emoji}</div>
            </div>
            <div class="tier-confetti" id="tier-confetti"></div>
            <h2 class="modal-title" style="color:${color}">Level Up!</h2>
            <p class="tier-promotion-tier" style="color:${color}">${tier.label}</p>
            <p class="tier-promotion-tagline">${tier.tagline}</p>
            <p class="tier-promotion-desc">Your puzzles just got harder. Rewards stay boosted!</p>
            <button class="modal-next-btn" id="tier-promo-btn"
                style="background:linear-gradient(180deg,${color} 0%,${color}bb 100%);border:2px solid ${color};box-shadow:0 4px 14px ${color}60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">
                Let's Go!
            </button>
        </div>
    `;

    // Confetti burst
    const confettiEl = document.getElementById("tier-confetti");
    if (confettiEl) {
        let confettiHtml = "";
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const hue = Math.random() * 360;
            const size = 4 + Math.random() * 6;
            confettiHtml += `<div class="confetti-piece" style="left:${x}%;animation-delay:${delay}s;background:hsl(${hue},80%,60%);width:${size}px;height:${size}px"></div>`;
        }
        confettiEl.innerHTML = confettiHtml;
    }

    playSound("spinPrize");

    document.getElementById("tier-promo-btn").onclick = () => {
        overlay.style.display = "none";
    };
}
```

**Step 3: Call checkTierPromotion in advanceToNextLevel**

In `advanceToNextLevel()`, after `state.highestLevel = Math.max(state.highestLevel, next);` (line 1643), add:

```javascript
    checkTierPromotion();
```

**Step 4: Call checkTierPromotion in handleNextLevel**

In `handleNextLevel()`, after `state.highestLevel = Math.max(state.highestLevel, next);` (line 1696), add:

```javascript
    checkTierPromotion();
```

**Step 5: Add CSS for achievement dialog**

In `app.css`, add:

```css
/* ---- Tier Promotion Dialog ---- */
.tier-promotion-box { max-width: 320px; text-align: center; overflow: visible; position: relative; }
.tier-promotion-anim { position: relative; height: 80px; margin-bottom: 8px; }
.tier-trophy { font-size: 56px; animation: tierTrophyBounce 0.6s ease-out; }
.tier-flame {
    font-size: 36px; position: absolute; bottom: -4px; right: calc(50% - 50px);
    animation: tierFlameGlow 1.5s ease-in-out infinite;
}
.tier-promotion-tier { font-size: 28px; font-weight: 800; margin: 4px 0; letter-spacing: 1px; }
.tier-promotion-tagline { font-size: 15px; opacity: 0.7; margin: 2px 0 8px; }
.tier-promotion-desc { font-size: 13px; opacity: 0.55; margin: 0 0 16px; }
.tier-confetti { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
.confetti-piece {
    position: absolute; top: -10px; border-radius: 2px;
    animation: confettiFall 1.8s ease-out forwards;
}

@keyframes tierTrophyBounce {
    0% { transform: scale(0) rotate(-15deg); opacity: 0; }
    50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0); }
}
@keyframes tierFlameGlow {
    0%, 100% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.15); filter: brightness(1.3); }
}
@keyframes confettiFall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
}
```

**Step 6: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js`
Expected: No errors

**Step 7: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: auto-promotion with trophy+flame achievement dialog"
```

---

### Task 6: Settings Dropdown

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `renderMenu()` function

**Step 1: Add difficulty tier dropdown to Settings**

In `renderMenu()`, after the stats/current-level `menu-top-row` block (after line ~3749 where `</div></div>` closes the top row), add:

```javascript
    // Difficulty Tier
    if (state.difficultyTier >= 0) {
        const currentTier = DIFFICULTY_TIERS[state.difficultyTier];
        let tierOptions = "";
        for (let i = state.difficultyTier; i < DIFFICULTY_TIERS.length; i++) {
            const t = DIFFICULTY_TIERS[i];
            tierOptions += `<option value="${i}" ${i === state.difficultyTier ? "selected" : ""}>${t.label} — ${t.tagline}</option>`;
        }
        html += `
            <div class="menu-setting">
                <label class="menu-setting-label">Difficulty Tier</label>
                <select id="menu-tier-select" class="menu-setting-select" style="accent-color:${theme.accent}">
                    ${tierOptions}
                </select>
                <div class="menu-setting-hint">Higher tiers have harder puzzles. You can move up but not down.</div>
            </div>
        `;
    }
```

**Step 2: Wire up the dropdown handler**

In the event handler section of `renderMenu()` (after all the existing handlers are wired), add:

```javascript
    const tierSelect = document.getElementById("menu-tier-select");
    if (tierSelect) {
        tierSelect.onchange = () => {
            const newIdx = parseInt(tierSelect.value);
            if (newIdx <= state.difficultyTier) return; // can't go down
            const newTier = DIFFICULTY_TIERS[newIdx];
            const levelsCompleted = state.highestLevel - state.difficultyOffset;
            state.difficultyTier = newIdx;
            state.difficultyOffset = newTier.offset;
            state.currentLevel = newTier.offset + levelsCompleted;
            state.highestLevel = newTier.offset + levelsCompleted;
            // Rebase in-progress entries
            const oldIp = state.inProgress;
            state.inProgress = {};
            saveProgress();
            state.showMenu = false;
            renderMenu();
            showToast(`Difficulty set to ${newTier.label}!`, theme.accent);
            // Reload level
            recompute().then(() => { restoreLevelState(); renderHome(); });
        };
    }
```

**Step 3: Add CSS for select dropdown**

In `app.css`, add:

```css
.menu-setting-select {
    width: 100%; padding: 10px 12px; font-size: 15px;
    background: rgba(255,255,255,0.08); color: inherit; border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px; appearance: auto; cursor: pointer;
}
.menu-setting-select:focus { outline: none; border-color: rgba(255,255,255,0.3); }
```

**Step 4: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js`
Expected: No errors

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: difficulty tier dropdown in Settings"
```

---

### Task 7: Gate Speed Milestone for Easy Tier

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `checkSpeedMilestone()` and callers

**Step 1: Add Easy tier guard to checkSpeedMilestone**

Find `checkSpeedMilestone()` (line 839). Add at the top of the function:

```javascript
function checkSpeedMilestone() {
    // Easy tier cannot trigger speed milestones
    if (state.difficultyTier === 0) return;
```

**Step 2: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js`
Expected: No errors

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: disable speed milestone for Easy difficulty tier"
```

---

### Task 8: Update Player Guide

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `GUIDE_SECTIONS` array (line ~5629)

**Step 1: Add Difficulty Tiers guide section**

In the `GUIDE_SECTIONS` array, add after the "Speed Bonus" entry (which is the 10th entry):

```javascript
    { icon: "\uD83C\uDFAF", title: "Difficulty Tiers", body: "Choose your challenge! When you first open WordPlay, pick a difficulty tier: <b>Easy</b> (start from the beginning), <b>Medium</b> (skip to 6-letter puzzles), <b>Hard</b> (jump to puzzles with lots of bonus words), or <b>Expert</b> (dive into the deep end with complex anagrams). Your level numbers always start at 1 — the tier just controls how challenging the puzzles are.<br><br>As you play, you'll be <b>auto-promoted</b> when you naturally reach the next tier's difficulty range. A celebration dialog marks the achievement! You can also manually upgrade in <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a> (but you can't go back down). <b>Speed milestones</b> (bonus puzzle from 5 fast levels) are disabled on Easy tier." },
```

**Step 2: Update the Earning Coins section (index 1)**

Add a note about difficulty tiers not affecting coin rates. No change needed — coin rates are per-word, not per-tier.

**Step 3: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js`
Expected: No errors

**Step 4: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add Difficulty Tiers section to player guide"
```

---

### Task 9: Handle Existing Players Migration

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — `loadProgress()`

**Step 1: Migration for existing players**

Existing players have `difficultyTier = -1` (not chosen). They'll see the tier chooser on next launch. When they choose, they're already past level 1, so the chooser needs to handle existing progress.

Update the tier chooser's button onclick to handle existing players:

In `renderTierChooser()`, replace the button onclick logic:

```javascript
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute("data-tier"));
            const tier = DIFFICULTY_TIERS[idx];
            state.difficultyTier = idx;
            state.difficultyOffset = tier.offset;
            // For existing players: rebase their progress onto the new offset
            if (state.highestLevel > 1) {
                const levelsCompleted = state.highestLevel - 1; // they started from 1 (old system = Easy)
                state.currentLevel = tier.offset + 1 + levelsCompleted;
                state.highestLevel = tier.offset + 1 + levelsCompleted;
                // Clear in-progress since level numbers changed
                state.inProgress = {};
                state.foundWords = [];
                state.bonusFound = [];
                state.revealedCells = [];
                state.standaloneFound = false;
            } else {
                state.currentLevel = tier.offset + 1;
                state.highestLevel = tier.offset + 1;
            }
            saveProgress();
            overlay.style.display = "none";
            recompute().then(() => { restoreLevelState(); renderHome(); });
        };
```

**Step 2: Verify**

Run: `node --check WordPlay/wwwroot/js/app.js`
Expected: No errors

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: handle existing player migration when choosing tier"
```

---

### Task 10: Final Integration & Edge Cases

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` — various touch-ups

**Step 1: Update the admin "Set Progress" section**

In Settings admin section (line ~3804), the level input shows `state.highestLevel`. Update to show display level:

```javascript
                <input type="number" id="seed-level-input" value="${displayLevel(state.highestLevel)}" min="1" max="${maxLv}" class="menu-setting-input">
```

And update the "Set Progress" button handler to convert back:

In the seed-level-btn handler, when reading the input value, add the offset back:
```javascript
const newLevel = parseInt(document.getElementById("seed-level-input").value) + state.difficultyOffset;
```

**Step 2: Update leaderboard level display**

If the leaderboard shows `state.highestLevel`, that value goes to the server as the actual level. The server stores actual levels. Leaderboard should continue using actual levels so scores are comparable across tiers. **No change needed here** — the leaderboard uses `totalCoinsEarned` and actual `highestLevel` which is correct for competitive comparison.

**Step 3: Ensure daily/bonus mode don't use offset**

Daily and bonus modes load specific level numbers that are independent of progression. The `displayLevel()` function subtracts offset from actual levels, but daily/bonus level numbers are not part of the player's progression. The header already shows "Bonus" (not a level number) and daily shows the date. **No change needed.**

**Step 4: Update the maxLv check**

In `advanceToNextLevel` and `handleNextLevel`, `maxLv` uses `getMaxLevel()` which returns the total available levels (155,996). This is correct — the offset doesn't change how many levels exist. **No change needed.**

**Step 5: Verify all files**

Run: `node --check WordPlay/wwwroot/js/app.js && node --check WordPlay/wwwroot/js/sync.js`
Expected: No errors

**Step 6: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: difficulty tier admin adjustments and edge cases"
```

---

## Verification Checklist

1. `node --check` all JS files pass
2. First launch → tier chooser modal appears, cannot dismiss
3. Choose "Medium" → level shows as 1, actual data is from level 251
4. Home screen shows "Level 1" not "Level 251"
5. Header shows real group/pack names from offset level
6. Map shows levels starting from 1, hides packs before offset
7. Completion modal shows display level
8. Settings shows difficulty dropdown with current + higher tiers
9. Manually upgrade tier in Settings → level number preserved, content changes
10. Play through enough levels to cross tier boundary → achievement dialog with trophy+flame+confetti
11. Speed milestone disabled on Easy tier
12. Daily/bonus modes unaffected by tier
13. Sync between devices preserves tier (max merge = up only)
14. Existing player (highestLevel > 1) sees chooser, progress rebased correctly
15. Guide explains difficulty tiers
