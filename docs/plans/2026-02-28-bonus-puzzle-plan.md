# Bonus Puzzle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Bonus Puzzle game mode triggered by achievements, featuring star-collecting gameplay with coin rewards and a grand prize.

**Architecture:** Integrated into app.js following the daily puzzle pattern (enterBonusMode/exitBonusMode, isBonusMode flag, bonusPuzzle state object). Reuses existing grid, word-finding, coin animation systems.

**Tech Stack:** Vanilla JS (app.js), CSS (app.css), localStorage persistence, server sync (sync.js)

---

### Task 1: State & Persistence Foundation

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (state object ~line 105, resetStateToDefaults ~line 234, saveProgress ~line 356, loadProgress ~line 315)

**Step 1: Add new state fields**

In the `state` object at ~line 105, add after `dailyPuzzle: null,` and before `isDailyMode: false`:

```javascript
    bonusPuzzle: null,         // { available, trigger, levelNum, fw, bf, rc, sf, starsCollected, starPoints, coinsEarned, completed, starCells }
    isBonusMode: false,
    // Achievement tracking
    speedLevels: [],           // timestamps of recent level completions (for 10-in-an-hour)
    loginStreak: 0,            // consecutive days played
    lastPlayDate: null,        // "YYYY-MM-DD" of last play
```

**Step 2: Update resetStateToDefaults**

Add after `state.dailyPuzzle = null;` (~line 251):

```javascript
    state.bonusPuzzle = null;
    state.speedLevels = [];
    state.loginStreak = 0;
    state.lastPlayDate = null;
```

**Step 3: Update saveProgress**

Change version to 4 and add new fields. In `saveProgress()` (~line 359), change `v: 3` to `v: 4` and add after the `dp` field:

```javascript
            bp: state.bonusPuzzle,
            sl: state.speedLevels,
            ls: state.loginStreak,
            lpd: state.lastPlayDate,
```

**Step 4: Update loadProgress**

In `loadProgress()` after `state.dailyPuzzle = d.dp || null;` (~line 348), add:

```javascript
            state.bonusPuzzle = d.bp || null;
            state.speedLevels = d.sl || [];
            state.loginStreak = d.ls || 0;
            state.lastPlayDate = d.lpd || null;
```

**Step 5: Commit**

```
feat: add bonus puzzle state fields and persistence (v4 save format)
```

---

### Task 2: Bonus Puzzle Globals & Enter/Exit Functions

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (after daily mode globals ~line 146, after exitDailyMode ~line 512)

**Step 1: Add bonus mode globals**

After the daily mode globals (~line 146, after `let _savedRegularState = null;`), add:

```javascript
// ---- BONUS PUZZLE STATE ----
let _bonusStarCells = [];        // array of "row,col" keys where stars are placed
let _bonusCoinsEarned = 0;       // session accumulator for completion modal
let _savedRegularStateBonus = null; // snapshot of regular game state while in bonus mode
```

**Step 2: Add enterBonusMode function**

After `exitDailyMode()` (~line 512), add:

```javascript
// ---- BONUS PUZZLE MODE ----
async function enterBonusMode() {
    if (!state.bonusPuzzle || !state.bonusPuzzle.available) return;
    saveInProgressState();
    _savedRegularStateBonus = {
        currentLevel: state.currentLevel,
        foundWords: [...state.foundWords],
        bonusFound: [...state.bonusFound],
        revealedCells: [...state.revealedCells],
        standaloneFound: state.standaloneFound,
    };
    state.isBonusMode = true;
    state.bonusPuzzle.available = false; // consume the bonus
    state.currentLevel = state.bonusPuzzle.levelNum;
    await recompute();
    // Restore in-progress bonus state if resuming (shouldn't happen since we clear on exit, but safe)
    state.foundWords = (state.bonusPuzzle.fw || []).filter(w => placedWords.includes(w));
    state.bonusFound = state.bonusPuzzle.bf || [];
    state.revealedCells = state.bonusPuzzle.rc || [];
    state.standaloneFound = state.bonusPuzzle.sf || false;
    while (checkAutoCompleteWords()) {}
    _bonusCoinsEarned = state.bonusPuzzle.coinsEarned || 0;
    // Assign stars to grid cells
    _bonusStarCells = state.bonusPuzzle.starCells || assignBonusStars();
    state.bonusPuzzle.starCells = _bonusStarCells;
    state.showHome = false;
    const app = document.getElementById("app");
    app.innerHTML = "";
    renderAll();
    animateGridEntrance();
}

function exitBonusMode(forfeited) {
    saveBonusState();
    state.isBonusMode = false;
    state.showComplete = false;
    if (forfeited) {
        // Coins already added to state.coins during play — keep them
        state.bonusPuzzle = null;
    }
    if (_savedRegularStateBonus) {
        state.currentLevel = _savedRegularStateBonus.currentLevel;
        state.foundWords = _savedRegularStateBonus.foundWords;
        state.bonusFound = _savedRegularStateBonus.bonusFound;
        state.revealedCells = _savedRegularStateBonus.revealedCells;
        state.standaloneFound = _savedRegularStateBonus.standaloneFound;
    }
    _bonusStarCells = [];
    _bonusCoinsEarned = 0;
    _savedRegularStateBonus = null;
    saveProgress();
    recompute().then(() => {
        restoreLevelState();
        state.showHome = true;
        const app = document.getElementById("app");
        app.innerHTML = "";
        renderHome();
    });
}

function saveBonusState() {
    if (!state.bonusPuzzle) return;
    state.bonusPuzzle.fw = [...state.foundWords];
    state.bonusPuzzle.bf = [...state.bonusFound];
    state.bonusPuzzle.rc = [...state.revealedCells];
    state.bonusPuzzle.sf = state.standaloneFound;
    state.bonusPuzzle.coinsEarned = _bonusCoinsEarned;
    state.bonusPuzzle.starCells = _bonusStarCells;
    saveProgress();
}
```

**Step 3: Add assignBonusStars function**

Add right after `saveBonusState()`:

```javascript
function assignBonusStars() {
    // Distribute 9 stars across crossword words
    // Words with 5+ letters get 2 stars, others get 1
    if (!crossword || !crossword.placements) return [];
    const words = crossword.placements.filter(p => !p.standalone);
    if (words.length === 0) return [];
    const starCells = [];
    let remaining = 9;
    // Shuffle words deterministically using level number
    const shuffled = [...words].sort((a, b) => {
        const ha = hashStr(state.bonusPuzzle.levelNum + ":" + a.word);
        const hb = hashStr(state.bonusPuzzle.levelNum + ":" + b.word);
        return ha - hb;
    });
    for (const w of shuffled) {
        if (remaining <= 0) break;
        const count = (w.word.length >= 5 && remaining >= 2) ? 2 : 1;
        // Pick cells within this word for stars (avoid duplicates)
        const available = w.cells.filter(c => !starCells.includes(c.row + "," + c.col));
        const seed = hashStr(state.bonusPuzzle.levelNum + ":star:" + w.word);
        for (let i = 0; i < count && i < available.length && remaining > 0; i++) {
            const c = available[(seed + i) % available.length];
            starCells.push(c.row + "," + c.col);
            remaining--;
        }
    }
    return starCells;
}
```

**Step 4: Commit**

```
feat: add bonus puzzle enter/exit/star-assignment functions
```

---

### Task 3: Achievement Trigger System

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (after assignBonusStars, handleWord ~line 628, handleDailyCompletion ~line 566, advanceToNextLevel ~line 1148, app init area)

**Step 1: Add triggerBonusPuzzle function**

Add after `assignBonusStars()`:

```javascript
function triggerBonusPuzzle(trigger) {
    // Only one bonus at a time; need at least one completed level to replay
    if (state.bonusPuzzle && state.bonusPuzzle.available) return;
    const completedLevels = Object.keys(state.levelHistory);
    if (completedLevels.length === 0) return;
    // Pick a random completed level
    const pick = completedLevels[Math.floor(Math.random() * completedLevels.length)];
    state.bonusPuzzle = {
        available: true,
        trigger: trigger,
        levelNum: parseInt(pick),
        fw: [], bf: [], rc: [], sf: false,
        starsCollected: 0,
        starPoints: 0,
        coinsEarned: 0,
        completed: false,
        starCells: null, // assigned on entry
    };
    saveProgress();
}

function checkSpeedMilestone() {
    const now = Date.now();
    state.speedLevels.push(now);
    // Keep only timestamps from the last hour
    const oneHourAgo = now - 60 * 60 * 1000;
    state.speedLevels = state.speedLevels.filter(t => t >= oneHourAgo);
    if (state.speedLevels.length >= 10) {
        state.speedLevels = [];
        triggerBonusPuzzle("speed");
    }
}

function checkLoginStreak() {
    const today = getTodayStr();
    if (state.lastPlayDate === today) return; // already checked today
    if (state.lastPlayDate) {
        // Check if lastPlayDate was yesterday
        const last = new Date(state.lastPlayDate + "T00:00:00");
        const now = new Date(today + "T00:00:00");
        const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            state.loginStreak++;
        } else {
            state.loginStreak = 1;
        }
    } else {
        state.loginStreak = 1;
    }
    state.lastPlayDate = today;
    if (state.loginStreak >= 3) {
        state.loginStreak = 0;
        triggerBonusPuzzle("streak");
    }
    saveProgress();
}
```

**Step 2: Hook pack completion trigger**

In `advanceToNextLevel()` (~line 1148), after `state.levelsCompleted++` (~line 1172), add:

```javascript
        checkSpeedMilestone();
        // Check if we just completed a pack
        if (typeof getLevelPacks === "function") {
            const packs = getLevelPacks();
            for (const p of packs) {
                if (state.currentLevel === p.end + 1 || (state.currentLevel > p.end && state.currentLevel <= p.end + 1)) {
                    let allDone = true;
                    for (let lv = p.start; lv <= p.end; lv++) {
                        if (!state.levelHistory[lv]) { allDone = false; break; }
                    }
                    if (allDone) triggerBonusPuzzle("pack");
                    break;
                }
            }
        }
```

Note: The `state.currentLevel` has already been advanced to `next` at this point. We check if the level we just came from (`state.currentLevel - 1` effectively, but actually `next` was set from old currentLevel) completed a pack. A simpler approach: check the level we just completed. We need to capture the completed level before it's changed. Better approach — add the check before `state.currentLevel = next;` at line 1162. Move the trigger check there:

Actually, the cleaner approach: right after `state.levelHistory[state.currentLevel] = [...state.foundWords];` at line 1150-1151, before the level number changes, add the pack completion check:

```javascript
    // Check pack completion for bonus puzzle trigger
    if (typeof getLevelPacks === "function") {
        const justCompleted = state.currentLevel;
        const packs = getLevelPacks();
        for (const p of packs) {
            if (justCompleted >= p.start && justCompleted <= p.end) {
                let allDone = true;
                for (let lv = p.start; lv <= p.end; lv++) {
                    if (!state.levelHistory[lv]) { allDone = false; break; }
                }
                if (allDone) triggerBonusPuzzle("pack");
                break;
            }
        }
    }
```

Add the speed milestone check in `advanceToNextLevel()` after `state.levelsCompleted++` (line 1172):

```javascript
        checkSpeedMilestone();
```

**Step 3: Hook daily puzzle completion trigger**

In `handleDailyCompletion()` (~line 566), after `saveDailyState();` add:

```javascript
    triggerBonusPuzzle("daily");
```

**Step 4: Hook login streak check**

In the app initialization area (find where `loadProgress()` is called and the app starts up), add after loadProgress:

```javascript
    checkLoginStreak();
```

**Step 5: Commit**

```
feat: add achievement trigger system for bonus puzzles
```

---

### Task 4: Home Screen Bonus Button

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (renderHome ~line 1322)
- Modify: `WordPlay/wwwroot/css/app.css` (after daily puzzle button styles ~line 2103)

**Step 1: Add bonus button HTML to renderHome**

In `renderHome()`, find the daily puzzle button IIFE (~line 1360-1366). After that closing `})()}` and before `<div class="home-center">`, add the bonus puzzle button:

```javascript
            ${(function() {
                if (!state.bonusPuzzle || !state.bonusPuzzle.available) return '';
                return '<div class="home-bonus-puzzle-row"><button class="home-bonus-puzzle-btn" id="home-bonus-puzzle-btn">\u2B50 Bonus Puzzle</button></div>';
            })()}
```

**Step 2: Wire bonus button click handler**

After the daily puzzle button handler (`if (dpBtn)` block, ~line 1410), add:

```javascript
    const bpBtn = document.getElementById("home-bonus-puzzle-btn");
    if (bpBtn) {
        bpBtn.onclick = () => enterBonusMode();
    }
```

**Step 3: Add CSS for bonus button**

In `app.css`, after the `@keyframes dailyPuzzlePulse` block (~line 2103), add:

```css
/* ---- BONUS PUZZLE BUTTON (home screen) ---- */
.home-bonus-puzzle-row {
    display: flex;
    justify-content: center;
    padding: 0 20px;
    margin-top: 4px;
    margin-bottom: -46px;
    z-index: 3;
    position: relative;
    pointer-events: none;
}

.home-bonus-puzzle-btn {
    pointer-events: auto;
    background: linear-gradient(180deg, #d4a51c 0%, #a07818 100%);
    color: #fff;
    border: 2px solid #d4a51c;
    border-bottom-color: #a07818;
    border-radius: 30px;
    padding: 10px 28px;
    font-family: 'Nunito', system-ui, sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3);
    animation: bonusPuzzlePulse 2s ease-in-out infinite;
}

.home-bonus-puzzle-btn:active {
    transform: scale(0.96);
}

@keyframes bonusPuzzlePulse {
    0%, 100% { transform: scale(1); box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3); }
    50% { transform: scale(1.04); box-shadow: 0 6px 14px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.3); }
}
```

**Step 4: Commit**

```
feat: add bonus puzzle button to home screen
```

---

### Task 5: Game Header for Bonus Mode

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (renderHeader ~line 1416)
- Modify: `WordPlay/wwwroot/css/app.css` (after bonus button styles)

**Step 1: Add bonus mode branch to renderHeader**

In `renderHeader()` (~line 1416), the current structure is:

```javascript
if (state.isDailyMode) {
    // daily header
} else {
    // regular header
}
```

Change to:

```javascript
if (state.isBonusMode) {
    // bonus header
} else if (state.isDailyMode) {
    // daily header
} else {
    // regular header
}
```

The bonus mode header block:

```javascript
    if (state.isBonusMode) {
        const sp = state.bonusPuzzle ? state.bonusPuzzle.starPoints : 0;
        const starSlots = [0, 1, 2].map(i =>
            `<span class="bonus-star-slot${i < sp ? ' filled' : ''}" id="bonus-star-${i}">${i < sp ? '\u2B50' : '\u2606'}</span>`
        ).join('');
        hdr.innerHTML = `
            <button class="back-arrow-btn" id="back-home-btn" title="Back to Home">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="header-center">
                <div class="header-pack" style="color:#d4a51c">\u2B50 Bonus Puzzle</div>
                <div class="header-level" style="color:#d4a51c">Level ${state.currentLevel}</div>
            </div>
            <div class="header-right">
                <div class="header-btn coin-display" style="color:${theme.text}" id="coin-display">\uD83E\uDE99 ${state.coins.toLocaleString()}</div>
                <div class="bonus-star-display" id="bonus-star-display">${starSlots}</div>
            </div>
        `;
        document.getElementById("back-home-btn").onclick = () => {
            // Confirmation dialog before forfeiting
            if (!state.bonusPuzzle || state.bonusPuzzle.completed) {
                exitBonusMode(false);
                return;
            }
            const confirmEl = document.createElement("div");
            confirmEl.className = "modal-overlay";
            confirmEl.style.display = "flex";
            confirmEl.style.zIndex = "9999";
            confirmEl.innerHTML = `
                <div class="modal-box" style="border:2px solid #d4a51c50;box-shadow:0 0 40px #d4a51c20">
                    <div class="modal-emoji">\u26A0\uFE0F</div>
                    <h2 class="modal-title" style="color:#d4a51c">Leave Bonus Puzzle?</h2>
                    <p class="modal-subtitle">You'll lose your progress and the bonus prize.</p>
                    <div style="display:flex;gap:10px;margin-top:12px">
                        <button class="modal-next-btn" id="bonus-stay-btn"
                            style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;flex:1">
                            Stay
                        </button>
                        <button class="modal-next-btn" id="bonus-leave-btn"
                            style="background:linear-gradient(180deg,#d4a51c 0%,#a07818 100%);border:2px solid #d4a51c;border-bottom-color:#a07818;color:#fff;flex:1">
                            Leave
                        </button>
                    </div>
                </div>
            `;
            document.getElementById("app").appendChild(confirmEl);
            document.getElementById("bonus-stay-btn").onclick = () => confirmEl.remove();
            document.getElementById("bonus-leave-btn").onclick = () => {
                confirmEl.remove();
                exitBonusMode(true);
            };
        };
    } else if (state.isDailyMode) {
```

**Step 2: Add CSS for star display**

In `app.css`, add after the bonus puzzle button styles:

```css
/* ---- BONUS STAR DISPLAY (game header) ---- */
.bonus-star-display {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 18px;
    padding: 2px 8px;
    border-radius: 12px;
    background: rgba(0,0,0,0.3);
}

.bonus-star-slot {
    opacity: 0.3;
    transition: opacity 0.3s, transform 0.3s;
    font-size: 18px;
}

.bonus-star-slot.filled {
    opacity: 1;
    animation: starFillPulse 0.5s ease;
}

@keyframes starFillPulse {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); opacity: 1; }
}
```

**Step 3: Commit**

```
feat: add bonus mode header with star display and forfeit confirmation
```

---

### Task 6: Grid Star Overlays

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (renderGrid ~line 1577)
- Modify: `WordPlay/wwwroot/css/app.css`

**Step 1: Add star cell rendering in renderGrid**

In `renderGrid()`, after the daily coin cell block (~line 1672-1694) and before the `} else if (isR)` block (~line 1695), add a new condition for bonus star cells:

```javascript
            } else if (state.isBonusMode && _bonusStarCells.includes(k) && !isStarCollected(k)) {
                // Bonus star cell — show star overlay
                div.className = "grid-cell bonus-star-cell";
                if (isR) {
                    div.style.background = theme.accent;
                    div.style.color = "#fff";
                    div.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";
                    div.textContent = cell;
                    // Star overlay on revealed cell
                    const starFs = Math.max(cs * 0.4, 10);
                    div.innerHTML = cell + '<span class="bonus-star-overlay" style="font-size:' + starFs + 'px">\u2B50</span>';
                } else {
                    div.style.background = "rgba(220,215,230,1)";
                    div.style.border = "2px solid rgba(212,165,28,0.5)";
                    div.style.color = "";
                    div.style.textShadow = "";
                    const starFs = Math.max(cs * 0.55, 12);
                    div.innerHTML = '<span class="bonus-star-overlay unrevealed" style="font-size:' + starFs + 'px">\u2B50</span>';
                }
                if (state.pickMode) {
                    div.style.cursor = "pointer";
                    div.onclick = () => handlePickCell(k);
                } else {
                    div.style.cursor = "";
                    div.onclick = null;
                }
```

**Step 2: Add isStarCollected helper**

Add near the bonus puzzle functions:

```javascript
function isStarCollected(cellKey) {
    // A star is collected when the word containing that cell has been found
    if (!crossword || !crossword.placements) return false;
    for (const p of crossword.placements) {
        if (p.standalone) continue;
        for (const c of p.cells) {
            if ((c.row + "," + c.col) === cellKey && state.foundWords.includes(p.word)) {
                return true;
            }
        }
    }
    return false;
}
```

**Step 3: Add CSS for star overlay**

```css
/* ---- BONUS STAR CELLS ---- */
.bonus-star-cell {
    position: relative;
}

.bonus-star-overlay {
    position: absolute;
    bottom: 1px;
    right: 1px;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
    pointer-events: none;
}

.bonus-star-overlay.unrevealed {
    position: static;
    filter: drop-shadow(0 1px 3px rgba(212,165,28,0.5));
    animation: starCellPulse 2s ease-in-out infinite;
}

@keyframes starCellPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}
```

**Step 4: Commit**

```
feat: add star overlay rendering on bonus puzzle grid cells
```

---

### Task 7: Star Collection & Coin Rewards on Word Found

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (handleWord ~line 575, after animateCoinFlyFromDailyCoin ~line 1867)

**Step 1: Add checkBonusStars function**

Add after `animateCoinFlyFromDailyCoin()`:

```javascript
function checkBonusStars(word) {
    if (!state.isBonusMode || !state.bonusPuzzle) return;
    // Find which star cells belong to this word
    const placement = crossword.placements.find(p => p.word === word);
    if (!placement) return;
    const wordStarCells = placement.cells
        .map(c => c.row + "," + c.col)
        .filter(k => _bonusStarCells.includes(k));
    if (wordStarCells.length === 0) return;
    const starsInWord = wordStarCells.length;
    const coinReward = starsInWord * 10;
    state.bonusPuzzle.starsCollected += starsInWord;
    state.coins += coinReward;
    state.totalCoinsEarned += coinReward;
    _bonusCoinsEarned += coinReward;
    // Animate each star flying to the star display area
    wordStarCells.forEach((cellKey, i) => {
        setTimeout(() => animateStarFly(cellKey), i * 200);
    });
    // After star animations, fly coins
    setTimeout(() => {
        animateBonusCoinFly(wordStarCells[0], coinReward);
    }, wordStarCells.length * 200 + 400);
    // Check if we earned a new star point (every 3 stars)
    const oldPoints = state.bonusPuzzle.starPoints;
    const newPoints = Math.floor(state.bonusPuzzle.starsCollected / 3);
    if (newPoints > oldPoints) {
        state.bonusPuzzle.starPoints = newPoints;
        setTimeout(() => {
            renderHeader(); // refresh star display
            playSound("bonusChime");
        }, wordStarCells.length * 200 + 600);
    }
    saveBonusState();
    renderCoins();
}
```

**Step 2: Add animateStarFly function**

```javascript
function animateStarFly(cellKey) {
    const gc = document.getElementById("grid-container");
    const starDisplay = document.getElementById("bonus-star-display");
    if (!gc || !starDisplay || !cellKey) return;
    const [cr, cc] = cellKey.split(",").map(Number);
    const cellIdx = cr * crossword.cols + cc;
    const cellEl = gc.children[cellIdx];
    let startX = window.innerWidth / 2, startY = window.innerHeight / 2;
    if (cellEl) {
        const r = cellEl.getBoundingClientRect();
        startX = r.left + r.width / 2;
        startY = r.top + r.height / 2;
    }
    const destRect = starDisplay.getBoundingClientRect();
    const endX = destRect.left + destRect.width / 2;
    const endY = destRect.top + destRect.height / 2;
    const star = document.createElement("div");
    star.style.position = "fixed";
    star.style.left = startX + "px";
    star.style.top = startY + "px";
    star.style.fontSize = "24px";
    star.style.zIndex = "10000";
    star.style.pointerEvents = "none";
    star.style.transform = "translate(-50%, -50%)";
    star.textContent = "\u2B50";
    document.body.appendChild(star);
    const curveX = (Math.random() - 0.5) * 80;
    const curveY = (Math.random() - 0.5) * 40 - 30;
    const midX = (startX + endX) / 2 + curveX;
    const midY = (startY + endY) / 2 + curveY;
    const duration = 500;
    let start = null;
    function animate(ts) {
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        const u = 1 - t;
        const x = u * u * startX + 2 * u * t * midX + t * t * endX;
        const y = u * u * startY + 2 * u * t * midY + t * t * endY;
        star.style.left = x + "px";
        star.style.top = y + "px";
        star.style.transform = `translate(-50%, -50%) scale(${1 + t * 0.5})`;
        star.style.opacity = 0.5 + t * 0.5;
        if (t < 1) requestAnimationFrame(animate);
        else star.remove();
    }
    requestAnimationFrame(animate);
}
```

**Step 3: Add animateBonusCoinFly function**

```javascript
function animateBonusCoinFly(cellKey, amount) {
    const gc = document.getElementById("grid-container");
    const coinDisplay = document.getElementById("coin-display");
    if (!gc || !coinDisplay || !cellKey) return;
    const [cr, cc] = cellKey.split(",").map(Number);
    const cellIdx = cr * crossword.cols + cc;
    const cellEl = gc.children[cellIdx];
    let startX = window.innerWidth / 2, startY = window.innerHeight / 2;
    if (cellEl) {
        const r = cellEl.getBoundingClientRect();
        startX = r.left + r.width / 2;
        startY = r.top + r.height / 2;
    }
    const coinRect = coinDisplay.getBoundingClientRect();
    const endX = coinRect.left + coinRect.width / 2;
    const endY = coinRect.top + coinRect.height / 2;
    const gainText = document.createElement("div");
    gainText.className = "coin-gain-text";
    gainText.textContent = "+" + amount;
    gainText.style.left = endX + "px";
    gainText.style.top = endY + "px";
    document.body.appendChild(gainText);
    setTimeout(() => gainText.remove(), 900);
    const particleCount = Math.min(amount / 2, 6);
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const p = document.createElement("div");
            p.className = "coin-particle";
            p.textContent = "\uD83E\uDE99";
            const sx = startX + (Math.random() - 0.5) * 40;
            const sy = startY + (Math.random() - 0.5) * 20;
            p.style.left = sx + "px";
            p.style.top = sy + "px";
            document.body.appendChild(p);
            const curveX = (Math.random() - 0.5) * 60;
            const curveY = (Math.random() - 0.5) * 30 - 20;
            const midX = (sx + endX) / 2 + curveX;
            const midY = (sy + endY) / 2 + curveY;
            const duration = 450 + Math.random() * 150;
            let start = null;
            function animate(ts) {
                if (!start) start = ts;
                const t = Math.min((ts - start) / duration, 1);
                const u = 1 - t;
                const x = u * u * sx + 2 * u * t * midX + t * t * endX;
                const y = u * u * sy + 2 * u * t * midY + t * t * endY;
                p.style.left = x + "px";
                p.style.top = y + "px";
                p.style.transform = `translate(-50%, -50%) scale(${0.6 + t * 0.4})`;
                p.style.opacity = 0.4 + t * 0.6;
                if (t < 1) requestAnimationFrame(animate);
                else p.remove();
            }
            requestAnimationFrame(animate);
        }, i * 50);
    }
}
```

**Step 4: Hook checkBonusStars into handleWord**

In `handleWord()`, after a placed word is found and after `checkDailyCoinWord();` (~line 627), add:

```javascript
        checkBonusStars(w);
```

Also after the standalone word handling section (~line 594, after the coinFly animation timeout), add:

```javascript
        checkBonusStars(w);
```

**Step 5: Commit**

```
feat: add star collection, coin rewards, and fly animations for bonus puzzle
```

---

### Task 8: Bonus Puzzle Completion

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (handleWord completion checks, renderCompleteModal, handleNextLevel)

**Step 1: Add handleBonusCompletion function**

Add near the other completion handlers:

```javascript
function handleBonusCompletion() {
    if (!state.bonusPuzzle) return;
    state.bonusPuzzle.completed = true;
    // Grand prize: 500 coins if all 9 stars collected
    if (state.bonusPuzzle.starsCollected >= 9) {
        state.coins += 500;
        state.totalCoinsEarned += 500;
        _bonusCoinsEarned += 500;
    }
    saveBonusState();
    setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
}
```

**Step 2: Hook into handleWord completion checks**

In `handleWord()`, at the two places where level completion is checked (~line 595-604 and ~line 628-636), the existing pattern is:

```javascript
if (state.isDailyMode) {
    handleDailyCompletion();
} else {
    // regular completion
}
```

Change both to:

```javascript
if (state.isBonusMode) {
    handleBonusCompletion();
} else if (state.isDailyMode) {
    handleDailyCompletion();
} else {
    // regular completion
}
```

**Step 3: Add bonus completion to renderCompleteModal**

In `renderCompleteModal()` (~line 2673), change the structure from:

```javascript
if (state.isDailyMode) {
    // daily modal
} else {
    // regular modal
}
```

To:

```javascript
if (state.isBonusMode) {
    const bp = state.bonusPuzzle;
    const allStars = bp && bp.starsCollected >= 9;
    const starDisplay = [0, 1, 2].map(i => i < (bp ? bp.starPoints : 0) ? '\u2B50' : '\u2606').join(' ');
    overlay.innerHTML = `
        <div class="modal-box" style="border:2px solid #d4a51c50;box-shadow:0 0 40px #d4a51c20">
            <div class="modal-emoji">${allStars ? '\uD83C\uDF1F' : '\u2B50'}</div>
            <h2 class="modal-title" style="color:#d4a51c">${allStars ? 'Bonus Complete!' : 'Puzzle Done'}</h2>
            <p class="modal-subtitle" style="font-size:24px">${starDisplay}</p>
            <p class="modal-subtitle">${bp ? bp.starsCollected : 0}/9 stars collected</p>
            ${allStars ? '<p class="modal-coins" style="color:#d4a51c;font-size:18px;font-weight:700">Grand Prize: +500 \uD83E\uDE99</p>' : ''}
            <p class="modal-coins" style="color:${theme.text}">+${_bonusCoinsEarned} \uD83E\uDE99 total earned</p>
            <button class="modal-next-btn" id="next-btn"
                style="background:linear-gradient(180deg,#d4a51c 0%,#a07818 100%);border:2px solid #d4a51c;border-bottom-color:#a07818;box-shadow:0 4px 14px #d4a51c60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">
                Collect & Return Home
            </button>
        </div>
    `;
    document.getElementById("next-btn").onclick = () => exitBonusMode(false);
} else if (state.isDailyMode) {
```

**Step 4: Update handleNextLevel**

In `handleNextLevel()` (~line 1186), add bonus mode handling:

```javascript
async function handleNextLevel() {
    if (state.isBonusMode) { exitBonusMode(false); return; }
    if (state.isDailyMode) { exitDailyMode(); return; }
```

**Step 5: Commit**

```
feat: add bonus puzzle completion modal with grand prize
```

---

### Task 9: Hint Logic — Prefer Non-Starred Cells

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (pickRandomUnrevealedCell ~line 710)

**Step 1: Modify pickRandomUnrevealedCell**

In `pickRandomUnrevealedCell()` (~line 710), after the existing logic that separates candidates from standaloneCandidates, add a further split for bonus mode. Replace the pool selection:

Currently:
```javascript
    const pool = candidates.length ? candidates : standaloneCandidates;
```

Change to:
```javascript
    let pool;
    if (state.isBonusMode && _bonusStarCells.length > 0 && candidates.length > 0) {
        // In bonus mode, prefer non-starred cells
        const nonStarred = candidates.filter(k => !_bonusStarCells.includes(k));
        pool = nonStarred.length > 0 ? nonStarred : candidates;
    } else {
        pool = candidates.length ? candidates : standaloneCandidates;
    }
```

**Step 2: Commit**

```
feat: hints prefer non-starred cells in bonus puzzle mode
```

---

### Task 10: Server Sync Merge Logic

**Files:**
- Modify: `WordPlay/wwwroot/js/sync.js` (mergeProgress ~line 101)

**Step 1: Add bonusPuzzle merge**

In `mergeProgress()`, after the dailyPuzzle merge block (~line 179), add:

```javascript
    // Bonus puzzle: prefer completed > more stars > available > null
    const bpL = local.bp || null;
    const bpS = server.bp || null;
    if (bpL && bpS) {
        if (bpL.completed && !bpS.completed) merged.bp = bpL;
        else if (bpS.completed && !bpL.completed) merged.bp = bpS;
        else if (bpL.available && !bpS.available) merged.bp = bpL;
        else if (bpS.available && !bpL.available) merged.bp = bpS;
        else merged.bp = ((bpL.starsCollected || 0) >= (bpS.starsCollected || 0)) ? bpL : bpS;
    } else {
        merged.bp = bpL || bpS || null;
    }

    // Achievement tracking: max values
    merged.sl = (local.sl && local.sl.length > (server.sl || []).length) ? local.sl : (server.sl || []);
    merged.ls = Math.max(local.ls || 0, server.ls || 0);
    merged.lpd = (local.lpd && server.lpd) ? (local.lpd > server.lpd ? local.lpd : server.lpd) : (local.lpd || server.lpd || null);
```

**Step 2: Update version handling**

In the `mergeProgress()` function, the version line:
```javascript
const merged = { v: Math.max(local.v || 3, server.v || 3) };
```
Change to:
```javascript
const merged = { v: Math.max(local.v || 4, server.v || 4) };
```

**Step 3: Commit**

```
feat: add bonus puzzle merge logic to server sync
```

---

### Task 11: How to Play Guide Update

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (GUIDE_SECTIONS ~line 3615)

**Step 1: Add Bonus Puzzle guide section**

In `GUIDE_SECTIONS`, add a new entry after the Daily Puzzle entry (~line 3623):

```javascript
    { icon: "\u2B50", title: "Bonus Puzzle", body: "Earn bonus puzzles through achievements \u2014 complete a level pack, finish 10 levels in an hour, maintain a 3-day play streak, or beat the daily puzzle. A gold <b>\u2B50 Bonus Puzzle</b> button appears on the home screen. Inside, 9 stars are scattered across the grid. Find starred words to collect stars and earn 10 coins each! Every 3 stars fills one of your 3 star slots. Collect all 9 stars for a <b>500-coin grand prize</b>. But be careful \u2014 leaving the puzzle forfeits your progress!" },
```

**Step 2: Commit**

```
feat: add Bonus Puzzle section to How to Play guide
```

---

### Task 12: Integration Testing & Polish

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (various touch-ups)

**Step 1: Add isBonusMode checks alongside isDailyMode**

Search all places in the code where `state.isDailyMode` is checked and determine if `state.isBonusMode` needs the same treatment. Key places:

- `saveInProgressState()` (~line 384): Should skip saving in-progress for bonus mode too. Add `if (state.isDailyMode || state.isBonusMode) return;`
- `handleHint()` (~line 992): After hint, save state. Change `if (state.isDailyMode) saveDailyState(); else saveProgress();` to `if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();`
- `handleWord()` (~line 618): Same save pattern. Add bonus state saving.
- Standalone word handling (~line 588): Same pattern.
- `handleRocketHint()` (~line 2141): Same save pattern.
- Grid rendering coin cell check (~line 1672): Already handled by adding bonus star check before it.
- `handlePickCell()` (target hint): Find and add bonus save pattern.
- The `renderDailyBtn()` function: Should hide in bonus mode (or just let it be, since bonus header doesn't show it).

**Step 2: Ensure bonus mode saves on word found**

In `handleWord()`, the placed word branch (~line 618):
```javascript
if (state.isDailyMode) saveDailyState(); else saveProgress();
```
Change to:
```javascript
if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();
```

Same for standalone word branch (~line 588) and hint/rocket handlers.

**Step 3: Test checklist**

Manual testing steps:
1. Trigger a bonus puzzle (use daily puzzle completion as easiest trigger)
2. Verify gold "Bonus Puzzle" button appears on home screen
3. Verify button doesn't push the Word Play heading down
4. Enter the bonus puzzle — verify star cells are visible on grid
5. Find a starred word — verify star flies to star display, then coins fly to coin counter
6. Verify every 3rd star fills a star slot with animation
7. Use a hint — verify it avoids starred cells when possible
8. Press back — verify confirmation dialog appears
9. Complete the puzzle with all stars — verify 500-coin grand prize
10. Complete without all stars — verify no grand prize, just earned coins
11. After completion — verify bonus button is gone from home screen
12. Verify How to Play guide has the new Bonus Puzzle section
13. Test with daily puzzle not showing — verify bonus button takes its position

**Step 4: Commit**

```
feat: integrate bonus mode save patterns and polish
```
