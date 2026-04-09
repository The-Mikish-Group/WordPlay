// ============================================================
// WordPlay — Main Application (Vanilla JS)
// ============================================================

const APP_VERSION = "1.6.5";

// ---- THEMES ----
const THEMES = {
    sunrise: {
        bg: "linear-gradient(170deg, #0f0520 0%, #2d1b4e 25%, #8b2252 50%, #d4622a 75%, #f4a535 100%)",
        accent: "#f4a535", accentDark: "#c47d1a",
        wheelBg: "rgba(15,5,32,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#f4a535", text: "#fef3e0", dim: "rgba(254,243,224,0.5)",
    },
    forest: {
        bg: "linear-gradient(170deg, #040d04 0%, #0d2a0d 25%, #1a4a1a 50%, #2d6a2d 75%, #4a8a3f 100%)",
        accent: "#8ed87c", accentDark: "#5ba04a",
        wheelBg: "rgba(4,13,4,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#8ed87c", text: "#d8f0c8", dim: "rgba(216,240,200,0.5)",
    },
    canyon: {
        bg: "linear-gradient(170deg, #1a0e05 0%, #3d1f0a 25%, #7a3d1a 50%, #a0622d 75%, #c99a60 100%)",
        accent: "#e8b44c", accentDark: "#b8862e",
        wheelBg: "rgba(26,14,5,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#e8b44c", text: "#faebd7", dim: "rgba(250,235,215,0.5)",
    },
    sky: {
        bg: "linear-gradient(170deg, #060d2a 0%, #0f2055 25%, #2050a0 50%, #4a8ad0 75%, #85c5f0 100%)",
        accent: "#6ec6f5", accentDark: "#3a96c5",
        wheelBg: "rgba(6,13,42,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#6ec6f5", text: "#d8eeff", dim: "rgba(216,238,255,0.5)",
    },
    ocean: {
        bg: "linear-gradient(180deg, #020c1b 0%, #0a2342 25%, #0d4f6e 50%, #1a8a8a 75%, #3ccfcf 100%)",
        accent: "#3ccfcf", accentDark: "#1a8a8a",
        wheelBg: "rgba(2,12,27,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#3ccfcf", text: "#d0f5f5", dim: "rgba(208,245,245,0.5)",
    },
    lavender: {
        bg: "linear-gradient(160deg, #120820 0%, #2a1545 25%, #5c3d8f 50%, #9a6cbf 75%, #d4a5e5 100%)",
        accent: "#d4a5e5", accentDark: "#9a6cbf",
        wheelBg: "rgba(18,8,32,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#d4a5e5", text: "#f0e0ff", dim: "rgba(240,224,255,0.5)",
    },
    autumn: {
        bg: "linear-gradient(170deg, #1a0800 0%, #3d1200 25%, #8b3a0f 50%, #c45e1a 75%, #e89040 100%)",
        accent: "#e89040", accentDark: "#c45e1a",
        wheelBg: "rgba(26,8,0,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#e89040", text: "#fde8cc", dim: "rgba(253,232,204,0.5)",
    },
    midnight: {
        bg: "linear-gradient(175deg, #03000a 0%, #0a0520 25%, #1a1040 50%, #2a1860 75%, #3d2080 100%)",
        accent: "#8878c8", accentDark: "#5e4e9e",
        wheelBg: "rgba(3,0,10,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#8878c8", text: "#d8d0f0", dim: "rgba(216,208,240,0.5)",
    },
    arctic: {
        bg: "linear-gradient(165deg, #0a1520 0%, #152535 25%, #2a4a60 50%, #5a8aa0 75%, #a0d4e8 100%)",
        accent: "#a0d4e8", accentDark: "#5a8aa0",
        wheelBg: "rgba(10,21,32,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#a0d4e8", text: "#e0f4ff", dim: "rgba(224,244,255,0.5)",
    },
    volcano: {
        bg: "linear-gradient(175deg, #0a0000 0%, #2a0505 25%, #6a1010 50%, #a02020 75%, #e04030 100%)",
        accent: "#f06848", accentDark: "#c03828",
        wheelBg: "rgba(10,0,0,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#f06848", text: "#ffe0d8", dim: "rgba(255,224,216,0.5)",
    },
    meadow: {
        bg: "linear-gradient(160deg, #080d02 0%, #1a2a08 25%, #3a5a10 50%, #6a9a20 75%, #a0d040 100%)",
        accent: "#a0d040", accentDark: "#6a9a20",
        wheelBg: "rgba(8,13,2,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#a0d040", text: "#e8f8c8", dim: "rgba(232,248,200,0.5)",
    },
    storm: {
        bg: "linear-gradient(180deg, #08080c 0%, #1a1a2a 25%, #2e3050 50%, #4a5070 75%, #7080a0 100%)",
        accent: "#90a8d0", accentDark: "#6078a0",
        wheelBg: "rgba(8,8,12,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#90a8d0", text: "#d8e0f0", dim: "rgba(216,224,240,0.5)",
    },
    coral: {
        bg: "linear-gradient(165deg, #1a0810 0%, #3d1025 25%, #8a2050 50%, #c84878 75%, #f08ca0 100%)",
        accent: "#f08ca0", accentDark: "#c84878",
        wheelBg: "rgba(26,8,16,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#f08ca0", text: "#ffe0e8", dim: "rgba(255,224,232,0.5)",
    },
    aurora: {
        bg: "linear-gradient(170deg, #020810 0%, #0a2030 25%, #105040 50%, #20a060 75%, #60e0a0 100%)",
        accent: "#60e0a0", accentDark: "#20a060",
        wheelBg: "rgba(2,8,16,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#60e0a0", text: "#d0ffe8", dim: "rgba(208,255,232,0.5)",
    },
    desert: {
        bg: "linear-gradient(160deg, #1a1408 0%, #3a2a10 25%, #6a5020 50%, #a08838 75%, #d0c060 100%)",
        accent: "#d0c060", accentDark: "#a08838",
        wheelBg: "rgba(26,20,8,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#d0c060", text: "#f8f0d0", dim: "rgba(248,240,208,0.5)",
    },
    twilight: {
        bg: "linear-gradient(175deg, #0a0515 0%, #1a1035 25%, #3a2060 50%, #6a3090 75%, #a050c0 100%)",
        accent: "#c080e0", accentDark: "#8850b0",
        wheelBg: "rgba(10,5,21,0.55)", cellBg: "rgba(40,30,60,0.95)",
        cellFound: "#c080e0", text: "#f0e0ff", dim: "rgba(240,224,255,0.5)",
    },
};

// ---- DIFFICULTY TIERS ----
const DIFFICULTY_TIERS = [
    { key: "easy",   label: "Easy",   offset: 0,    tagline: "New to word games" },
    { key: "medium", label: "Medium", offset: 250,  tagline: "I know my way around" },
    { key: "hard",   label: "Hard",   offset: 2000, tagline: "Bring it on" },
    { key: "expert", label: "Expert", offset: 5000, tagline: "Challenge me" },
    { key: "master", label: "Master", offset: 15000, tagline: "I live for word puzzles" },
];

// ---- STATE ----
const state = {
    currentLevel: 1,       // Display level number (1-based, user-facing)
    foundWords: [],
    bonusFound: [],
    coins: 50,
    highestLevel: 1,
    shuffleKey: 0,
    bonusCounter: 0,       // bonus words toward 10-word reward (persists)
    revealedCells: [],     // "row,col" strings for individually hinted letters (resets per level)
    freeHints: 0,          // accumulated free hints (persists)
    freeTargets: 0,        // accumulated free targeted hints (persists)
    freeRockets: 0,        // accumulated free rocket hints (persists)
    levelsCompleted: 0,    // total levels completed (persists, for 10-level target reward)
    totalCoinsEarned: 0,   // lifetime coins earned (never decreases, for expertise/leaderboard)
    inProgress: {},        // { levelNum: { fw, bf, rc } } — partial progress for incomplete levels
    lastDailyClaim: null,  // date string of last daily coin claim
    // Transient
    showHome: true,        // home/opening screen shown (default entry point)
    showMenu: false,
    showComplete: false,
    showMap: false,
    loading: false,
    pickMode: false,       // target-hint: user taps a cell to reveal it
    soundEnabled: true,    // sound effects on/off
    layoutPref: "auto",        // "auto" | "crossword" | "flow"
    standaloneFound: false, // whether the standalone coin word has been solved
    showLeaderboard: false,
    showGuide: false,
    showContact: false,
    showPrivacy: false,
    showTerms: false,
    showCookiePolicy: false,
    showAdmin: false,
    dailyPuzzle: null,     // { date, levelNum, fw, bf, rc, sf, coinWordsFound, completed }
    bonusPuzzle: null,         // { available, trigger, levelNum, fw, bf, rc, sf, starsCollected, starPoints, coinsEarned, completed, starCells }
    bonusHistory: [],           // recently used bonus level numbers (avoids repeats)
    bonusStarsTotal: 0,        // cumulative bonus stars across rounds (0-9, resets on grand prize)
    isBonusMode: false,
    flowsCompleted: 0,        // total flow sessions completed (internal tracking)
    // Achievement tracking
    speedLevels: [],           // timestamps of recent level completions (for 5-in-an-hour)
    loginStreak: 0,            // consecutive days played
    lastPlayDate: null,        // "YYYY-MM-DD" of last play
    isDailyMode: false,
    difficultyTier: -1,       // tier index (0=Easy,1=Medium,2=Hard,3=Expert), -1 = not chosen yet
    difficultyOffset: 0,      // level offset for current tier
    tierCeiling: -1,           // manual tier cap; -1 = no cap (organic promotion allowed)
};

// ---- POWERUP CAPS ----
const MAX_FREE_HINTS = 9999;
const MAX_FREE_TARGETS = 9999;
const MAX_FREE_ROCKETS = 9999;

// ---- DEBUG: BONUS TESTING ----
// Usage: open browser console, run  debugBonus()  or  debugBonus(5)  to preset bonusStarsTotal
window.debugBonus = function(presetStars) {
    if (typeof presetStars === "number") {
        state.bonusStarsTotal = Math.max(0, Math.min(9, presetStars));
    }
    // Force a bonus puzzle using level 1 (small level, has short words like DOG)
    state.bonusPuzzle = {
        available: true,
        trigger: "debug",
        levelNum: 1,
        fw: [], bf: [], rc: [], sf: false,
        starsCollected: 0,
        starPoints: Math.floor(state.bonusStarsTotal / 3),
        coinsEarned: 0,
        completed: false,
        starCells: null,
        awardedAt: Date.now(),
    };
    saveProgress();
    console.log("Bonus puzzle ready! bonusStarsTotal=" + state.bonusStarsTotal + ". Click the ⭐ Bonus Puzzle button on the home screen.");
    // Re-render home if we're on it
    if (state.showHome) {
        const app = document.getElementById("app");
        if (app) { app.innerHTML = ""; renderHome(); }
    }
};

// ---- DEBUG: FLOW GRID TESTING ----
// Usage: debugFlow() — convert current level to flow layout
//        debugFlow(["HOP","HOT","POT","TOO","TOP","PHOTO"], "HOTPO") — custom words + letters
window.debugFlow = function(words, letters) {
    const w = words || level.words;
    crossword = generateFlowGrid(w);
    standaloneWord = null;
    placedWords = crossword.placements.map(p => p.word);
    bonusPool = [...(level.bonus || [])];
    { const _gl = new Set(placedWords.map(w => w.length)); bonusPool = bonusPool.filter(w => _gl.has(w.length)); }
    totalRequired = placedWords.length;
    state.foundWords = [];
    state.revealedCells = [];
    if (letters) { level.letters = letters; rebuildWheelLetters(); }
    renderAll();
};

// ---- MENU SECRET ----
let _menuSecretTaps = 0;

// ---- DAILY PUZZLE ----
let _dailyCoinWord = null;      // current word with coin (string)
let _dailyCoinCellKey = null;   // "row,col" of the visible coin cell
let _dailyCoinsEarned = 0;     // session accumulator for completion modal
let _savedRegularState = null;  // snapshot of regular game state while in daily mode

// ---- BONUS PUZZLE STATE ----
let _bonusStarCells = [];        // array of "row,col" keys where stars are placed
let _regularStarCells = [];     // array of "row,col" keys where stars are placed in regular levels
let _currentLayoutIsFlow = false;  // whether the current grid is in flow layout
let _bonusCoinsEarned = 0;       // session accumulator for completion modal
let _savedRegularStateBonus = null; // snapshot of regular game state while in bonus mode

// ---- FLOW / DAILY LAYOUT STATE ----
let _forceFlowLayout = false;       // transient flag for daily flow layout variant

// ---- SPEED BONUS STATE ----
let _speedTimerStart = 0;        // timestamp of first wheel touch this level
let _speedTimerActive = false;   // whether the timer is running
let _speedBonusEarned = false;   // whether the current level beat the clock
let _speedBonusTime = 0;         // elapsed seconds when bonus was earned
let _speedSpinPending = false;   // free spin available on completion modal
let _speedSpinAnimating = false;
let _speedSpinAngle = 0;

const AVATAR_EMOJI = {
    dog:"\uD83D\uDC36", cat:"\uD83D\uDC31", fox:"\uD83E\uDD8A", unicorn:"\uD83E\uDD84",
    bear:"\uD83D\uDC3B", panda:"\uD83D\uDC3C", owl:"\uD83E\uDD89", frog:"\uD83D\uDC38",
    lion:"\uD83E\uDD81", monkey:"\uD83D\uDC35", robot:"\uD83E\uDD16", alien:"\uD83D\uDC7D",
    ghost:"\uD83D\uDC7B", octopus:"\uD83D\uDC19", butterfly:"\uD83E\uDD8B", dragon:"\uD83D\uDC32"
};

function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

function getDailyLevelNum() {
    const maxLv = (typeof getMaxLevel === "function" && getMaxLevel() > 0) ? getMaxLevel() : 156000;
    const h1 = hashStr(getTodayStr());
    // Normalize to 0..1 range, then bias toward upper levels (harder, more variety)
    const r = (h1 % 10000) / 10000;
    const biased = 1 - r * r; // bias toward higher levels
    // Skip first 80 levels (too easy for a daily challenge)
    const floor = 81;
    return Math.floor(biased * (maxLv - floor)) + floor;
}

function assignDailyCoinWord() {
    _dailyCoinWord = null;
    _dailyCoinCellKey = null;
    if (!crossword || !crossword.placements) return;
    const unfound = crossword.placements.filter(p =>
        !p.standalone && !state.foundWords.includes(p.word)
    );
    if (unfound.length === 0) return;
    // Build set of currently revealed cells (from found words + hints)
    const revealed = new Set();
    for (const p of crossword.placements) {
        if (state.foundWords.includes(p.word)) {
            for (const c of p.cells) revealed.add(c.row + "," + c.col);
        }
    }
    for (const k of state.revealedCells) revealed.add(k);

    const cwf = state.dailyPuzzle ? (state.dailyPuzzle.coinWordsFound || 0) : 0;
    const seed = hashStr(getTodayStr() + ":" + cwf);
    // Loop through unfound words to find one with an unrevealed cell for the coin
    for (let i = 0; i < unfound.length; i++) {
        const pick = unfound[(seed + i) % unfound.length];
        const unrevealed = pick.cells.filter(c => !revealed.has(c.row + "," + c.col));
        if (unrevealed.length === 0) continue;
        _dailyCoinWord = pick.word;
        const cellSeed = hashStr(getTodayStr() + ":cell:" + cwf);
        const c = unrevealed[cellSeed % unrevealed.length];
        _dailyCoinCellKey = c.row + "," + c.col;
        return;
    }
    // All unfound words have fully revealed cells — place coin on a revealed cell
    const pick = unfound[seed % unfound.length];
    _dailyCoinWord = pick.word;
    const cellSeed = hashStr(getTodayStr() + ":cell:" + cwf);
    const c = pick.cells[cellSeed % pick.cells.length];
    _dailyCoinCellKey = c.row + "," + c.col;
}

// ---- MAP STATE ----
let _mapExpandedPacks = {};       // { "group/pack/start": true }
let _mapAutoExpanded = false;     // only auto-expand the active pack once per open
let _mapHasScrolled = false;      // only auto-scroll to current level on first render
let _mapScrollTarget = null;      // pack key to scroll to after toggle
let _mapSelectedGroup = null;     // null = show group list, string = show packs in that group

// ---- BACKGROUND IMAGE MANIFEST ----
let _bgManifest = null; // Set of available background image keys (e.g. "sunrise-rise")

async function loadBgManifest() {
    try {
        const resp = await fetch("images/bg/bg-manifest.json");
        if (!resp.ok) return;
        const list = await resp.json();
        _bgManifest = new Set(list);
    } catch (e) { /* no manifest = no bg images available */ }
}

function getBgImageKey(lvl) {
    if (!lvl) return null;
    return `${lvl.group}-${lvl.pack}`.toLowerCase().replace(/\s+/g, '-');
}

function preloadBgImage(key) {
    if (!key || !_bgManifest || !_bgManifest.has(key)) return;
    const img = new Image();
    img.src = `images/bg/${key}.webp`;
}

// ---- COMPUTED ----
let level, theme, crossword, placedWords, bonusPool, totalRequired, wheelLetters;
let standaloneWord = null;
let DEFINITIONS = null;
let _bannedWords = new Set();
let _myWordVotes = new Set();
let _cellToWord = {};     // "row,col" → word (only for cells owned by exactly 1 word)

function buildCellWordMaps() {
    const count = {};
    _cellToWord = {};
    if (!crossword) return;
    for (const p of crossword.placements) {
        for (const c of p.cells) {
            const k = c.row + "," + c.col;
            count[k] = (count[k] || 0) + 1;
            _cellToWord[k] = p.word;
        }
    }
    for (const k in count) {
        if (count[k] > 1) delete _cellToWord[k];
    }
}

function resetStateToDefaults() {
    state.currentLevel = 1;
    state.highestLevel = 1;
    state.foundWords = [];
    state.bonusFound = [];
    state.coins = 50;
    state.bonusCounter = 0;
    state.revealedCells = [];
    state.freeHints = 0;
    state.freeTargets = 0;
    state.freeRockets = 0;
    state.levelsCompleted = 0;
    state.totalCoinsEarned = 0;
    state.inProgress = {};
    state.lastDailyClaim = null;
    state.standaloneFound = false;
    state.dailyPuzzle = null;
    state.bonusPuzzle = null;
    state.bonusStarsTotal = 0;
    state.speedLevels = [];
    state.loginStreak = 0;
    state.lastPlayDate = null;
    state.showAdmin = false;
    state.flowsCompleted = 0;
    state.difficultyTier = 0;
    state.difficultyOffset = 0;
    state.tierCeiling = -1;
}


async function recompute() {
    resetSpeedTimer();
    // Try dynamic loader first, fall back to built-in
    let lvData = null;
    // Compute the data-file level number (display + offset)
    const dataLevel = (state.isDailyMode || state.isBonusMode)
        ? state.currentLevel    // daily/bonus levels are raw data positions
        : state.currentLevel + state.difficultyOffset;

    if (typeof getLevel === "function") {
        lvData = await getLevel(dataLevel);
    }
    // Fallback: old static array (0-based index)
    if (!lvData && typeof ALL_LEVELS !== "undefined") {
        const idx = dataLevel - 1; // convert 1-based to 0-based
        if (idx >= 0 && idx < ALL_LEVELS.length) {
            lvData = ALL_LEVELS[idx];
        } else {
            lvData = ALL_LEVELS[0];
        }
    }
    if (!lvData) {
        console.error("No level data for level", state.currentLevel, "(data:", dataLevel + ")");
        return;
    }
    level = lvData;
    theme = THEMES[level.theme] || THEMES.sunrise;

    // Filter banned words from level data
    if (_bannedWords.size > 0) {
        const unfilteredWords = level.words;
        level.words = level.words.filter(w => !_bannedWords.has(w));
        if (level.words.length < 2) level.words = unfilteredWords; // safety fallback
        if (level.bonus) level.bonus = level.bonus.filter(w => !_bannedWords.has(w));
    }

    // Determine grid words vs bonus words
    const gridWords = level.words;

    // Determine if this level should use flow layout
    const naturalFlow = level.flow || _forceFlowLayout || (!state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel));
    if (state.layoutPref === "flow") {
        _currentLayoutIsFlow = true;
    } else if (state.layoutPref === "crossword") {
        _currentLayoutIsFlow = false;
    } else {
        _currentLayoutIsFlow = naturalFlow;
    }

    // Always determine the standalone coin word (deterministic per level)
    const forceStandalone = gridWords.length >= 6 && ((state.currentLevel * 2654435761) >>> 0) % 5 === 0;
    const extracted = extractStandaloneWord(gridWords, 12, forceStandalone);
    standaloneWord = extracted.standalone;

    if (_currentLayoutIsFlow) {
        crossword = generateFlowGrid(gridWords);
        // Mark the coin word's placement in the flow grid so it shows coins
        if (standaloneWord) {
            for (const p of crossword.placements) {
                if (p.word === standaloneWord) { p.standalone = true; break; }
            }
        }
    } else {
        crossword = extracted.crossword;
    }

    placedWords = crossword.placements.map(p => p.word);
    // Words that couldn't be placed in the crossword become bonus
    const overflow = gridWords.filter(w => !placedWords.includes(w));
    bonusPool = [...(level.bonus || []), ...overflow];
    // Only allow bonus words whose length matches a word on the grid
    const _gridLengths = new Set(placedWords.map(w => w.length));
    bonusPool = bonusPool.filter(w => _gridLengths.has(w.length));
    // Filter standalone from bonus pool so it doesn't appear there
    if (standaloneWord) bonusPool = bonusPool.filter(w => w !== standaloneWord);
    totalRequired = placedWords.length;
    buildCellWordMaps();
    rebuildWheelLetters();
    // Preload next chunk
    if (typeof preloadAround === "function") {
        const preloadLevel = (state.isDailyMode || state.isBonusMode)
            ? state.currentLevel
            : state.currentLevel + state.difficultyOffset;
        preloadAround(preloadLevel);
    }
    // Preload current level's background image
    preloadBgImage(getBgImageKey(level));
}

function rebuildWheelLetters() {
    const a = level.letters.split("");
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    wheelLetters = a;
}

function applyPendingUpdate() {
    if (window._updatePending) { window.location.reload(); return true; }
    return false;
}

// ---- PERSISTENCE ----

function loadProgress() {
    try {
        const raw = localStorage.getItem("wordplay-save");
        if (raw) {
            const d = JSON.parse(raw);
            // Migration: old saves used 0-based index + startingLevel
            // New saves use actual level number (1-based)
            if (d.v >= 2) {
                state.currentLevel = d.cl || 1;
                state.highestLevel = d.hl || 1;
            } else {
                // Old format: cl was 0-based index, sl was starting offset
                const oldIdx = d.cl || 0;
                const oldStart = d.sl || 1;
                state.currentLevel = oldStart + oldIdx;
                state.highestLevel = oldStart + (d.hl || 0);
            }
            // Migration: old flow mode could leave currentLevel at a 100k+ flow level number.
            // Clamp it so completing a stale flow level can't poison highestLevel.
            if (state.currentLevel > state.highestLevel) {
                state.currentLevel = state.highestLevel;
            }
            // v4→v5 migration: levels were reshuffled, clear stale puzzle state
            if (d.v && d.v < 5) {
                state.foundWords = [];
                state.bonusFound = [];
                state.revealedCells = [];
                state.inProgress = {};
                state.standaloneFound = false;
            } else {
                state.foundWords = d.fw || [];
                state.bonusFound = d.bf || [];
                state.revealedCells = d.rc || [];
                state.inProgress = d.ip || {};
                state.standaloneFound = d.sf || false;
            }
            state.coins = d.co ?? 50;
            state.bonusCounter = d.bc || 0;
            state.freeHints = Math.min(d.fh || 0, MAX_FREE_HINTS);
            state.freeTargets = Math.min(d.ft || 0, MAX_FREE_TARGETS);
            state.freeRockets = Math.min(d.fr || 0, MAX_FREE_ROCKETS);
            state.levelsCompleted = d.lc || 0;
            state.lastDailyClaim = d.ldc || null;
            state.soundEnabled = d.se !== undefined ? d.se : true;
            state.layoutPref = d.lp || "auto";
            state.totalCoinsEarned = d.tce || 0;
            state.dailyPuzzle = d.dp || null;
            state.bonusPuzzle = d.bp || null;
            state.bonusHistory = d.bh || [];
            state.bonusStarsTotal = d.bst || 0;
            // Safety: if grand prize was earned but reset didn't persist, cash it in now
            if (state.bonusStarsTotal >= 9) {
                state.coins += 500;
                state.totalCoinsEarned += 500;
                state.bonusStarsTotal = 0;
            }
            state.speedLevels = d.sl || [];
            state.loginStreak = d.ls || 0;
            state.lastPlayDate = d.lpd || null;
            state.flowsCompleted = d.fc || 0;
            state.difficultyTier = d.dt !== undefined ? d.dt : -1;
            state.difficultyOffset = d.doff || 0;
            state.tierCeiling = d.tc !== undefined ? d.tc : -1;

            // v7→v8 migration: convert raw level numbers to display levels.
            // In v7, cl/hl included the tier offset. In v8, they store display
            // levels and the offset is applied only at data lookup time.
            if (d.v && d.v < 8) {
                const doff = d.doff || 0;
                if (doff > 0) {
                    d.cl = Math.max(1, (d.cl || 1) - doff);
                    d.hl = Math.max(1, (d.hl || 1) - doff);
                    state.currentLevel = d.cl;
                    state.highestLevel = d.hl;
                    // Convert inProgress keys from raw to display levels
                    if (d.ip && typeof d.ip === "object") {
                        const newIp = {};
                        for (const [key, val] of Object.entries(d.ip)) {
                            const displayKey = Number(key) - doff;
                            if (displayKey >= 1) newIp[displayKey] = val;
                        }
                        d.ip = newIp;
                        state.inProgress = newIp;
                    }
                }
                d.v = 8;
                localStorage.setItem("wordplay-save", JSON.stringify(d));
            }
            // Auto-detect tier for existing players who haven't been assigned one.
            // Existing players started from level 1 — keep offset 0, just assign the tier label.
            if (state.difficultyTier < 0) {
                const hl = state.highestLevel;
                if (hl >= 15001) state.difficultyTier = 4;
                else if (hl >= 5001) state.difficultyTier = 3;
                else if (hl >= 2001) state.difficultyTier = 2;
                else if (hl >= 251) state.difficultyTier = 1;
                else state.difficultyTier = 0;
                state.difficultyOffset = 0; // they started from 1, no offset
            }
            // Clear expired bonus puzzle (1-hour window)
            if (state.bonusPuzzle && state.bonusPuzzle.available && state.bonusPuzzle.awardedAt &&
                Date.now() - state.bonusPuzzle.awardedAt > 60 * 60 * 1000) {
                state.bonusPuzzle = null;
            }
            // Clear stale daily data
            if (state.dailyPuzzle && state.dailyPuzzle.date !== getTodayStr()) {
                state.dailyPuzzle = null;
            }
        }
    } catch (e) { /* ignore */ }
}

function saveProgress() {
    try {
        saveInProgressState();
        localStorage.setItem("wordplay-save", JSON.stringify({
            v: 8,  // format version
            cl: state.currentLevel,
            fw: state.foundWords,
            bf: state.bonusFound,
            co: state.coins,
            hl: state.highestLevel,
            bc: state.bonusCounter,
            rc: state.revealedCells,
            fh: state.freeHints,
            ft: state.freeTargets,
            fr: state.freeRockets,
            lc: state.levelsCompleted,
            ip: state.inProgress,
            ldc: state.lastDailyClaim,
            se: state.soundEnabled,
            lp: state.layoutPref,
            sf: state.standaloneFound,
            tce: state.totalCoinsEarned,
            dp: state.dailyPuzzle,
            bp: state.bonusPuzzle,
            bh: state.bonusHistory,
            bst: state.bonusStarsTotal,
            sl: state.speedLevels,
            ls: state.loginStreak,
            lpd: state.lastPlayDate,
            fc: state.flowsCompleted,
            dt: state.difficultyTier,
            doff: state.difficultyOffset,
            tc: state.tierCeiling,
            sa: Date.now(),  // savedAt — used by merge to resolve balance conflicts
        }));
        if (typeof scheduleSyncPush === "function") scheduleSyncPush();
    } catch (e) { /* ignore */ }
}

function saveInProgressState() {
    if (state.isDailyMode || state.isBonusMode) return;
    const lv = state.currentLevel;
    if (state.foundWords.length > 0 || state.revealedCells.length > 0 || state.bonusFound.length > 0 || state.standaloneFound) {
        state.inProgress[lv] = {
            fw: [...state.foundWords],
            bf: [...state.bonusFound],
            rc: [...state.revealedCells],
            sf: state.standaloneFound,
            wo: wheelLetters ? [...wheelLetters] : null,
            rsc: _regularStarCells.length > 0 ? [..._regularStarCells] : undefined,
            zen: _currentLayoutIsFlow || undefined,
        };
    }
}

function saveDailyState() {
    if (!state.dailyPuzzle) return;
    state.dailyPuzzle.fw = [...state.foundWords];
    state.dailyPuzzle.bf = [...state.bonusFound];
    state.dailyPuzzle.rc = [...state.revealedCells];
    state.dailyPuzzle.sf = state.standaloneFound;
    state.dailyPuzzle.wo = wheelLetters ? [...wheelLetters] : null;
    state.dailyPuzzle.zen = _currentLayoutIsFlow || undefined;
    saveProgress();
}

function restoreLevelState() {
    const lv = state.currentLevel;
    // Restore partial progress (e.g. restarted level)
    const ip = state.inProgress[lv];
    if (ip) {
        state.foundWords = (ip.fw || []).filter(w => placedWords.includes(w));
        state.bonusFound = (ip.bf || []).filter(w => !placedWords.includes(w));
        if (_bannedWords.size > 0) state.bonusFound = state.bonusFound.filter(w => !_bannedWords.has(w));
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
        // Restore regular star cells — if not saved, compute them fresh
        if (ip.rsc) {
            _regularStarCells = ip.rsc;
        } else if (!state.isDailyMode && !state.isBonusMode && shouldLevelHaveStars(lv)) {
            _regularStarCells = assignRegularStars(lv);
        } else {
            _regularStarCells = [];
        }
        _currentLayoutIsFlow = ip.zen || false;
        return;
    }
    // Completed level: all words found
    if (lv < state.highestLevel) {
        state.foundWords = [...placedWords];
        state.bonusFound = [];
        state.revealedCells = [];
        state.standaloneFound = !!standaloneWord;
    }
    // For fresh or completed levels, assign regular stars if applicable
    if (!state.isDailyMode && !state.isBonusMode && shouldLevelHaveStars(lv)) {
        _regularStarCells = assignRegularStars(lv);
    } else {
        _regularStarCells = [];
    }
}

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

function toggleLayout() {
    if (!crossword || !level) return;
    const oldPlacements = crossword.placements;
    const oldRevealedCells = [...state.revealedCells];
    const oldStarCells = state.isBonusMode ? [..._bonusStarCells] : [..._regularStarCells];
    const oldDailyCoinKey = _dailyCoinCellKey;

    // Toggle
    _currentLayoutIsFlow = !_currentLayoutIsFlow;

    // Regenerate grid — preserve standalone coin word across layout switches
    const gridWords = level.words;
    const prevStandalone = standaloneWord;
    const _fs = gridWords.length >= 6 && ((state.currentLevel * 2654435761) >>> 0) % 5 === 0;
    const extracted = extractStandaloneWord(gridWords, 12, _fs);
    // Use the same standalone word regardless of which layout we're switching to
    standaloneWord = prevStandalone || extracted.standalone;

    if (_currentLayoutIsFlow) {
        crossword = generateFlowGrid(gridWords);
        // Mark the coin word's placement in the flow grid so it shows coins
        if (standaloneWord) {
            for (const p of crossword.placements) {
                if (p.word === standaloneWord) { p.standalone = true; break; }
            }
        }
    } else {
        crossword = extracted.crossword;
    }
    placedWords = crossword.placements.map(p => p.word);
    bonusPool = [...(level.bonus || []), ...gridWords.filter(w => !placedWords.includes(w))];
    { const _gl = new Set(placedWords.map(w => w.length)); bonusPool = bonusPool.filter(w => _gl.has(w.length)); }
    if (standaloneWord) bonusPool = bonusPool.filter(w => w !== standaloneWord);
    totalRequired = placedWords.length;
    buildCellWordMaps();
    // Reconcile bonus words that are now grid words after layout change
    state.bonusFound = state.bonusFound.filter(w => !placedWords.includes(w));

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
    if (standaloneWord && state.foundWords.includes(standaloneWord)) {
        state.standaloneFound = true;
    }

    // Re-render
    renderAll();
    playSound("letterClick");
}

// ---- DAILY MODE ENTRY/EXIT ----
async function enterDailyMode() {
    if (applyPendingUpdate()) return;
    saveInProgressState();
    _savedRegularState = {
        currentLevel: state.currentLevel,
        foundWords: [...state.foundWords],
        bonusFound: [...state.bonusFound],
        revealedCells: [...state.revealedCells],
        standaloneFound: state.standaloneFound,
    };
    state.isDailyMode = true;
    _regularStarCells = [];
    const today = getTodayStr();
    if (!state.dailyPuzzle || state.dailyPuzzle.date !== today) {
        state.dailyPuzzle = {
            date: today,
            levelNum: getDailyLevelNum(),
            fw: [], bf: [], rc: [], sf: false,
            coinWordsFound: 0,
            completed: false,
            flow: (hashStr(today) % 10) < 3,
        };
    }
    if (!state.dailyPuzzle.hasOwnProperty('flow')) {
        state.dailyPuzzle.flow = (hashStr(state.dailyPuzzle.date) % 10) < 3;
    }
    state.currentLevel = state.dailyPuzzle.levelNum;
    _forceFlowLayout = !!state.dailyPuzzle.flow;
    await recompute();
    _forceFlowLayout = false;
    state.foundWords = (state.dailyPuzzle.fw || []).filter(w => placedWords.includes(w));
    state.bonusFound = (state.dailyPuzzle.bf || []).filter(w => !placedWords.includes(w));
    state.revealedCells = state.dailyPuzzle.rc || [];
    state.standaloneFound = state.dailyPuzzle.sf || false;
    if (state.standaloneFound && standaloneWord && !state.foundWords.includes(standaloneWord)) {
        state.foundWords.push(standaloneWord);
    }
    if (state.dailyPuzzle.wo && state.dailyPuzzle.wo.length === level.letters.length &&
        [...state.dailyPuzzle.wo].sort().join('') === level.letters.split('').sort().join('')) {
        wheelLetters = [...state.dailyPuzzle.wo];
    }
    while (checkAutoCompleteWords()) {}
    if (state.dailyPuzzle.zen !== undefined) {
        const savedFlow = state.dailyPuzzle.zen;
        if (savedFlow !== _currentLayoutIsFlow) {
            _currentLayoutIsFlow = savedFlow;
            const gridWords = level.words;
            if (_currentLayoutIsFlow) {
                crossword = generateFlowGrid(gridWords);
                if (standaloneWord) {
                    for (const p of crossword.placements) {
                        if (p.word === standaloneWord) { p.standalone = true; break; }
                    }
                }
            } else {
                const _fs = gridWords.length >= 6 && ((state.currentLevel * 2654435761) >>> 0) % 5 === 0;
                const extracted = extractStandaloneWord(gridWords, 12, _fs);
                crossword = extracted.crossword;
                standaloneWord = extracted.standalone;
            }
            placedWords = crossword.placements.map(p => p.word);
            bonusPool = [...(level.bonus || []), ...gridWords.filter(w => !placedWords.includes(w))];
            { const _gl = new Set(placedWords.map(w => w.length)); bonusPool = bonusPool.filter(w => _gl.has(w.length)); }
            if (standaloneWord) bonusPool = bonusPool.filter(w => w !== standaloneWord);
            totalRequired = placedWords.length;
            state.foundWords = (state.dailyPuzzle.fw || []).filter(w => placedWords.includes(w));
        }
    }
    _dailyCoinsEarned = 0;
    assignDailyCoinWord();
    state.showHome = false;
    const app = document.getElementById("app");
    app.innerHTML = "";
    renderAll();
    animateGridEntrance();
}

function exitDailyMode() {
    saveDailyState();
    if (applyPendingUpdate()) return;
    state.isDailyMode = false;
    state.showComplete = false;
    if (_savedRegularState) {
        state.currentLevel = _savedRegularState.currentLevel;
        state.foundWords = _savedRegularState.foundWords;
        state.bonusFound = _savedRegularState.bonusFound;
        state.revealedCells = _savedRegularState.revealedCells;
        state.standaloneFound = _savedRegularState.standaloneFound;
    }
    _dailyCoinWord = null;
    _dailyCoinCellKey = null;
    _dailyCoinsEarned = 0;
    _savedRegularState = null;
    // Save restored regular state to localStorage so sync/reload doesn't revert to daily level
    saveProgress();
    recompute().then(() => {
        restoreLevelState();
        state.showHome = true;
        const app = document.getElementById("app");
        app.innerHTML = "";
        renderHome();
    });
}

// ---- BONUS PUZZLE MODE ----
async function enterBonusMode() {
    if (applyPendingUpdate()) return;
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
    _regularStarCells = [];
    state.bonusPuzzle.available = false;
    state.currentLevel = state.bonusPuzzle.levelNum;
    await recompute();
    state.foundWords = (state.bonusPuzzle.fw || []).filter(w => placedWords.includes(w));
    state.bonusFound = (state.bonusPuzzle.bf || []).filter(w => !placedWords.includes(w));
    state.revealedCells = state.bonusPuzzle.rc || [];
    state.standaloneFound = state.bonusPuzzle.sf || false;
    if (state.bonusPuzzle.wo && state.bonusPuzzle.wo.length === level.letters.length &&
        [...state.bonusPuzzle.wo].sort().join('') === level.letters.split('').sort().join('')) {
        wheelLetters = [...state.bonusPuzzle.wo];
    }
    while (checkAutoCompleteWords()) {}
    _bonusCoinsEarned = state.bonusPuzzle.coinsEarned || 0;
    _bonusStarCells = state.bonusPuzzle.starCells || assignBonusStars();
    state.bonusPuzzle.starCells = _bonusStarCells;
    if (state.bonusPuzzle.zen !== undefined) {
        const savedFlow = state.bonusPuzzle.zen;
        if (savedFlow !== _currentLayoutIsFlow) {
            _currentLayoutIsFlow = savedFlow;
            const gridWords = level.words;
            if (_currentLayoutIsFlow) {
                crossword = generateFlowGrid(gridWords);
                if (standaloneWord) {
                    for (const p of crossword.placements) {
                        if (p.word === standaloneWord) { p.standalone = true; break; }
                    }
                }
            } else {
                const _fs = gridWords.length >= 6 && ((state.currentLevel * 2654435761) >>> 0) % 5 === 0;
                const extracted = extractStandaloneWord(gridWords, 12, _fs);
                crossword = extracted.crossword;
                standaloneWord = extracted.standalone;
            }
            placedWords = crossword.placements.map(p => p.word);
            bonusPool = [...(level.bonus || []), ...gridWords.filter(w => !placedWords.includes(w))];
            { const _gl = new Set(placedWords.map(w => w.length)); bonusPool = bonusPool.filter(w => _gl.has(w.length)); }
            if (standaloneWord) bonusPool = bonusPool.filter(w => w !== standaloneWord);
            totalRequired = placedWords.length;
            state.foundWords = (state.bonusPuzzle.fw || []).filter(w => placedWords.includes(w));
            _bonusStarCells = state.bonusPuzzle.starCells || assignBonusStars();
            state.bonusPuzzle.starCells = _bonusStarCells;
        }
    }
    state.bonusPuzzle.starPoints = Math.floor(state.bonusStarsTotal / 3);
    state.showHome = false;
    const app = document.getElementById("app");
    app.innerHTML = "";
    renderAll();
    animateGridEntrance();
}

function exitBonusMode(forfeited) {
    saveBonusState();
    if (applyPendingUpdate()) return;
    state.isBonusMode = false;
    state.showComplete = false;
    if (forfeited) {
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
    state.bonusPuzzle.wo = wheelLetters ? [...wheelLetters] : null;
    state.bonusPuzzle.coinsEarned = _bonusCoinsEarned;
    state.bonusPuzzle.starCells = _bonusStarCells;
    state.bonusPuzzle.zen = _currentLayoutIsFlow || undefined;
    saveProgress();
}

function assignBonusStars() {
    if (!crossword || !crossword.placements) return [];
    const words = crossword.placements.filter(p => !p.standalone);
    if (words.length === 0) return [];
    const starCells = [];
    const starCountOptions = [3, 4, 5];
    const starSeed = hashStr(state.bonusPuzzle.levelNum + ":starcount:" + (state.bonusPuzzle.awardedAt || 0));
    const starCount = starCountOptions[starSeed % 3];
    let remaining = starCount;
    const shuffled = [...words].sort((a, b) => {
        const ha = hashStr(state.bonusPuzzle.levelNum + ":" + a.word);
        const hb = hashStr(state.bonusPuzzle.levelNum + ":" + b.word);
        return ha - hb;
    });
    for (const w of shuffled) {
        if (remaining <= 0) break;
        const count = 1;
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

function shouldLevelHaveStars(levelNum) {
    // Seeded 35% chance — use integer mixing for uniform distribution
    let n = levelNum * 0x45d9f3b | 0;
    n = ((n >> 16) ^ n) * 0x45d9f3b | 0;
    n = ((n >> 16) ^ n) * 0x45d9f3b | 0;
    n = (n >> 16) ^ n;
    return (Math.abs(n) % 100) < 35;
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

function isStarCollected(cellKey) {
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

function triggerBonusPuzzle(trigger) {
    if (state.bonusPuzzle && state.bonusPuzzle.available) return;
    if (state.highestLevel <= 1) return;
    const max = state.highestLevel - 1;
    const history = new Set(state.bonusHistory);
    let pick;
    for (let attempt = 0; attempt < 50; attempt++) {
        // Bias toward upper half of completed levels for more variety
        const r = Math.random();
        const biased = r * r; // squares to bias toward 0, then invert
        pick = Math.floor((1 - biased) * max) + 1; // bias toward higher levels
        if (!history.has(pick)) break;
    }
    // Track last 50 bonus levels to prevent repeats
    state.bonusHistory.push(pick);
    if (state.bonusHistory.length > 50) state.bonusHistory.shift();
    state.bonusPuzzle = {
        available: true,
        trigger: trigger,
        levelNum: parseInt(pick) + state.difficultyOffset,  // raw data position for recompute()
        fw: [], bf: [], rc: [], sf: false,
        starsCollected: 0,
        starPoints: Math.floor(state.bonusStarsTotal / 3),
        coinsEarned: 0,
        completed: false,
        starCells: null,
        awardedAt: Date.now(),
    };
    saveProgress();
}

function isBonusPuzzleExpired() {
    if (!state.bonusPuzzle || !state.bonusPuzzle.available) return false;
    if (!state.bonusPuzzle.awardedAt) return false;
    return Date.now() - state.bonusPuzzle.awardedAt > 60 * 60 * 1000; // 1 hour
}

function clearExpiredBonusPuzzle() {
    if (isBonusPuzzleExpired()) {
        state.bonusPuzzle = null;
        saveProgress();
    }
}

// ---- FLOW LEVEL HELPER ----
function isFlowLevel(n) {
    return n > 0 && n % 5 === 0;
}



// ---- SPEED BONUS CHECK (7 sec per word) ----
function checkSpeedBonus() {
    if (!_speedTimerActive || state.isDailyMode || state.isBonusMode) return;
    const wordCount = totalRequired;
    if (wordCount < 5) { _speedTimerActive = false; return; } // too few words — skip
    const elapsed = (Date.now() - _speedTimerStart) / 1000;
    const timeLimit = wordCount * 7; // 7 seconds per word
    _speedBonusEarned = elapsed <= timeLimit;
    _speedBonusTime = elapsed;
    _speedSpinPending = _speedBonusEarned;
    _speedTimerActive = false;
}

function startSpeedTimer() {
    if (!_speedTimerActive && !state.isDailyMode && !state.isBonusMode) {
        // Don't start the timer if words have already been found —
        // prevents gaming via layout toggle or late first swipe
        if (state.foundWords.length > 0) return;
        _speedTimerStart = Date.now();
        _speedTimerActive = true;
    }
}

function resetSpeedTimer() {
    _speedTimerStart = 0;
    _speedTimerActive = false;
    _speedBonusEarned = false;
    _speedBonusTime = 0;
    _speedSpinPending = false;
}

function checkSpeedMilestone() {
    // Easy tier cannot trigger speed milestones
    if (state.difficultyTier === 0) return;
    const now = Date.now();
    state.speedLevels.push(now);
    const oneHourAgo = now - 60 * 60 * 1000;
    state.speedLevels = state.speedLevels.filter(t => t >= oneHourAgo);
    if (state.speedLevels.length >= 5) {
        state.speedLevels = [];
        triggerBonusPuzzle("speed");
    }
}

function checkLoginStreak() {
    const today = getTodayStr();
    if (state.lastPlayDate === today) return;
    if (state.lastPlayDate) {
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

// ---- TOAST ----
let toastTimer = null;
function showToast(msg, color, fast, bg) {
    if (toastTimer) clearTimeout(toastTimer);
    let el = document.getElementById("toast");
    if (!el) {
        el = document.createElement("div");
        el.id = "toast";
        el.className = "toast";
        el.style.display = "none";
        document.getElementById("app").appendChild(el);
    }
    el.textContent = msg;
    el.style.color = color || theme.accent;
    el.style.borderColor = (color || theme.accent) + "30";
    el.style.background = bg || "rgba(0,0,0,0.85)";
    el.className = "toast" + (fast ? " fast" : "");
    el.style.display = "block";
    // Force reflow to restart animation
    el.offsetHeight;
    el.className = "toast" + (fast ? " fast" : "");
    toastTimer = setTimeout(() => { el.style.display = "none"; }, fast ? 800 : 1500);
}

// ---- WORD HANDLING ----
function checkDailyCoinWord() {
    if (!state.isDailyMode || !_dailyCoinWord) return;
    if (state.foundWords.includes(_dailyCoinWord)) {
        const oldCellKey = _dailyCoinCellKey;
        state.coins += 25;
        state.totalCoinsEarned += 25;
        _dailyCoinsEarned += 25;
        if (state.dailyPuzzle) state.dailyPuzzle.coinWordsFound = (state.dailyPuzzle.coinWordsFound || 0) + 1;
        showToast("🪙 Coin Word! +25 🪙", "#22a866");
        assignDailyCoinWord();
        setTimeout(() => animateCoinFlyFromDailyCoin(oldCellKey), 200);
        setTimeout(() => renderGrid(), 350);
    } else if (_dailyCoinCellKey) {
        const revealed = new Set();
        for (const p of crossword.placements) {
            if (state.foundWords.includes(p.word)) {
                for (const c of p.cells) revealed.add(c.row + "," + c.col);
            }
        }
        for (const k of state.revealedCells) revealed.add(k);
        if (revealed.has(_dailyCoinCellKey)) {
            assignDailyCoinWord();
            renderGrid();
        }
    }
}

function handleDailyCompletion() {
    state.coins += 100;
    state.totalCoinsEarned += 100;
    _dailyCoinsEarned += 100;
    state.dailyPuzzle.completed = true;
    saveDailyState();
    triggerBonusPuzzle("daily");
    setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
}

function handleBonusCompletion() {
    if (!state.bonusPuzzle || state.bonusPuzzle.completed) return;
    state.bonusPuzzle.completed = true;
    if (state.bonusStarsTotal >= 9) {
        state.coins += 500;
        state.totalCoinsEarned += 500;
        _bonusCoinsEarned += 500;
        state.bonusPuzzle._grandPrizeAwarded = true;
        state.bonusStarsTotal = 0;
    }
    saveBonusState();
    saveProgress();
    setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
}

function handleWord(word) {
    const w = word.toUpperCase();

    // Standalone coin word check
    if (standaloneWord && w === standaloneWord) {
        if (state.standaloneFound) {
            showToast("Already found", "rgba(255,255,255,0.5)", true);
            return;
        }
        state.standaloneFound = true;
        if (!state.foundWords.includes(w)) state.foundWords.push(w);
        const coinWordReward = (!state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel)) ? 200 : 100;
        state.coins += coinWordReward;
        state.totalCoinsEarned += coinWordReward;
        if (state.isDailyMode) { _dailyCoinsEarned += coinWordReward; saveDailyState(); } else if (state.isBonusMode) { _bonusCoinsEarned += coinWordReward; saveBonusState(); } else saveProgress();
        renderGrid();
        highlightWord(w);
        renderCoins();
        playSound("bonusChime");
        showToast("🪙 Coin Word! +100 🪙", theme.accent);
        setTimeout(() => animateCoinFlyFromStandalone(), 200);
        checkBonusStars(w);
        if (state.foundWords.length === totalRequired) {
            if (state.isBonusMode) {
                handleBonusCompletion();
            } else if (state.isDailyMode) {
                handleDailyCompletion();
            } else {
                checkSpeedBonus();
                delete state.inProgress[state.currentLevel];
                saveProgress();
                setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
            }
        }
        return;
    }

    if (state.foundWords.includes(w)) {
        showToast("Already found", "rgba(255,255,255,0.5)", true);
        return;
    }
    // Grid words take priority — fix any word misclassified as bonus
    if (state.bonusFound.includes(w) && placedWords.includes(w)) {
        state.bonusFound = state.bonusFound.filter(x => x !== w);
    } else if (state.bonusFound.includes(w)) {
        showToast("Already found", "rgba(255,255,255,0.5)", true);
        return;
    }
    if (placedWords.includes(w)) {
        state.foundWords.push(w);
        // Auto-complete any crossing words whose cells are all now visible
        const beforeAuto = state.foundWords.length;
        while (checkAutoCompleteWords()) {}
        const wordReward = (!state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel)) ? 3 : 1;
        state.coins += wordReward;
        state.totalCoinsEarned += wordReward;
        if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();
        renderGrid();
        highlightWord(w);
        playSound("wordFound");
        renderCoins();
        renderHintBtn();
        renderTargetBtn();
        renderRocketBtn();
        renderSpinBtn();
        checkDailyCoinWord();
        checkBonusStars(w);
        // Check stars for any auto-completed words
        if (state.isBonusMode || _regularStarCells.length > 0) {
            for (let i = beforeAuto; i < state.foundWords.length; i++) {
                checkBonusStars(state.foundWords[i]);
            }
        }
        if (state.foundWords.length === totalRequired) {
            if (state.isBonusMode) {
                handleBonusCompletion();
            } else if (state.isDailyMode) {
                handleDailyCompletion();
            } else {
                checkSpeedBonus();
                delete state.inProgress[state.currentLevel];
                saveProgress();
                setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
            }
        }
        return;
    }
    if (bonusPool && bonusPool.includes(w)) {
        playSound("bonusChime");
        state.bonusFound.push(w);
        const bonusReward = (!state.isDailyMode && !state.isBonusMode && isFlowLevel(state.currentLevel)) ? 15 : 5;
        state.coins += bonusReward;
        state.totalCoinsEarned += bonusReward;
        state.bonusCounter++;
        if (state.bonusCounter >= 10) {
            state.bonusCounter = 0;
            renderBonusStar();
            // Auto-reveal a random letter as reward
            const cell = pickRandomUnrevealedCell();
            if (cell) {
                state.revealedCells.push(cell);
                checkAutoCompleteWords();
                if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();
                renderGrid();
                renderCoins();
                        renderHintBtn();
                renderTargetBtn();
                renderRocketBtn();
                renderSpinBtn();
                showToast("⭐ Bonus Reward! Free letter!", theme.accent);
                // Delayed flash so the grid renders first
                setTimeout(() => flashHintCell(cell), 100);
                checkDailyCoinWord();
                if (state.foundWords.length === totalRequired) {
                    if (state.isBonusMode) {
                        handleBonusCompletion();
                    } else if (state.isDailyMode) {
                        handleDailyCompletion();
                    } else {
                        checkSpeedBonus();
                        delete state.inProgress[state.currentLevel];
                        saveProgress();
                        setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 1200);
                    }
                }
            } else {
                if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();
                renderCoins();
                        showToast("⭐ All letters revealed!", theme.accent);
            }
        } else {
            if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();
            renderCoins();
                renderBonusStar();
            // Pulse animation on the star
            const starArea = document.getElementById("bonus-star-area");
            if (starArea) {
                starArea.style.animation = "none";
                starArea.offsetHeight;
                starArea.style.animation = "starPulse 0.5s ease";
            }
            showToast("✨ Bonus: " + w + "  +5 🪙");
        }
        return;
    }

    // Invalid — shake grid and show hint if no words of that length exist
    const gc = document.getElementById("grid-container");
    if (gc) {
        gc.style.animation = "none";
        gc.offsetHeight;
        gc.style.animation = "shake 0.35s ease";
    }
    const allWords = [...placedWords, ...(bonusPool || [])];
    const hasWordsOfLen = allWords.some(x => x.length === w.length);
    if (!hasWordsOfLen) {
        showToast("No " + w.length + "-letter words", "#fff", false, "rgba(180,60,60,0.85)");
    }
}

function pickRandomUnrevealedCell() {
    // Build set of all currently visible cells
    const visible = new Set();
    for (const p of crossword.placements) {
        if (state.foundWords.includes(p.word)) {
            for (const c of p.cells) visible.add(c.row + "," + c.col);
        }
    }
    for (const k of state.revealedCells) visible.add(k);

    // Collect all valid cells that are not visible (prefer non-standalone first)
    const candidates = [];
    const standaloneCandidates = [];
    for (const p of crossword.placements) {
        for (const c of p.cells) {
            const k = c.row + "," + c.col;
            if (!visible.has(k)) {
                if (p.standalone) standaloneCandidates.push(k);
                else candidates.push(k);
            }
        }
    }
    // Fall back to standalone cells if no regular cells remain
    let pool;
    const activeStarCells = state.isBonusMode ? _bonusStarCells : _regularStarCells;
    if (activeStarCells.length > 0 && candidates.length > 0) {
        // Prefer non-starred cells for hint reveals
        const nonStarred = candidates.filter(k => !activeStarCells.includes(k));
        pool = nonStarred.length > 0 ? nonStarred : candidates;
    } else {
        pool = candidates.length ? candidates : standaloneCandidates;
    }
    if (!pool.length) return null;
    // Deduplicate (cells shared by multiple words)
    const unique = [...new Set(pool)];
    return unique[Math.floor(Math.random() * unique.length)];
}

function checkAutoCompleteWords() {
    // After revealing individual cells, check if any word is now fully revealed
    const visible = new Set();
    for (const p of crossword.placements) {
        if (state.foundWords.includes(p.word)) {
            for (const c of p.cells) visible.add(c.row + "," + c.col);
        }
    }
    for (const k of state.revealedCells) visible.add(k);

    let changed = false;
    for (const p of crossword.placements) {
        if (state.foundWords.includes(p.word)) continue;
        const allRevealed = p.cells.every(c => visible.has(c.row + "," + c.col));
        if (allRevealed) {
            state.foundWords.push(p.word);
            if (p.standalone) state.standaloneFound = true;
            changed = true;
        }
    }
    return changed;
}

function renderBonusStar() {
    const gold = state.bonusCounter > 0 || state.bonusFound.length > 0;
    const el = document.getElementById("bonus-star-counter");
    if (el) el.textContent = state.bonusCounter || "";
    const fill = document.getElementById("bonus-star-fill");
    if (fill) {
        fill.style.stroke = gold ? "#f4d03f" : "rgba(255,255,255,0.35)";
        fill.style.fill = gold ? "rgba(244,208,63,0.15)" : "none";
    }
}

// ---- STAR FLY ANIMATION (spin wheel → specific star slot) ----
function animateStarFly() {
    // Animate toward the star display area (game or home screen)
    const target = document.getElementById("bonus-star-display")
                || document.getElementById("home-star-display");
    if (!target) return;
    const targetRect = target.getBoundingClientRect();
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    // Fly to the right edge of the display (where the new star will appear)
    const endX = targetRect.right || (targetRect.left + targetRect.width);
    const endY = targetRect.top + targetRect.height / 2;

    const star = document.createElement("div");
    star.textContent = "\u2B50";
    star.style.cssText = `position:fixed;left:${startX}px;top:${startY}px;font-size:36px;z-index:99999;pointer-events:none;transform:translate(-50%,-50%);transition:none;`;
    document.body.appendChild(star);

    let start = null;
    const duration = 800;
    function frame(ts) {
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const arcY = -80 * Math.sin(t * Math.PI);
        const x = startX + (endX - startX) * ease;
        const y = startY + (endY - startY) * ease + arcY;
        const scale = 1 + 0.5 * Math.sin(t * Math.PI);
        star.style.left = x + "px";
        star.style.top = y + "px";
        star.style.transform = `translate(-50%,-50%) scale(${scale})`;
        if (t < 1) {
            requestAnimationFrame(frame);
        } else {
            star.remove();
            // Append the filled star to the display
            const filledIdx = Math.floor(state.bonusStarsTotal / 3) - 1;
            const newSlot = document.createElement("span");
            newSlot.className = "bonus-star-slot filled";
            newSlot.id = (document.getElementById("bonus-star-display") ? "game" : "home") + "-star-slot-" + Math.max(0, filledIdx);
            newSlot.textContent = "\u2B50";
            target.appendChild(newSlot);
            // Pulse
            newSlot.style.animation = "starFillPulse 0.5s ease";
            playSound("spinPrize");
        }
    }
    requestAnimationFrame(frame);
}

// ---- COIN-SPEND ANIMATION ----
function animateCoinSpend(buttonId, amount) {
    const btn = document.getElementById(buttonId);
    const coinDisplay = document.getElementById("coin-display");
    if (!btn || !coinDisplay) return;

    const btnRect = btn.getBoundingClientRect();
    const coinRect = coinDisplay.getBoundingClientRect();
    // Coins fly FROM coin display TO button (money leaving wallet)
    const startX = coinRect.left + coinRect.width / 2;
    const startY = coinRect.top + coinRect.height / 2;
    const endX = btnRect.left + btnRect.width / 2;
    const endY = btnRect.top + btnRect.height / 2;

    // Pulse the target button
    btn.classList.add("btn-pulse");
    setTimeout(() => btn.classList.remove("btn-pulse"), 500);

    // Floating cost text at coin display (where money leaves)
    const costText = document.createElement("div");
    costText.className = "coin-spend-text";
    costText.textContent = "\u2212" + amount;
    costText.style.left = startX + "px";
    costText.style.top = startY + "px";
    document.body.appendChild(costText);
    setTimeout(() => costText.remove(), 900);

    // Coin particles
    playSound("coinSpend");
    const count = 5 + Math.floor(Math.random() * 4); // 5-8
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement("div");
            p.className = "coin-particle";
            p.textContent = "\uD83E\uDE99";
            p.style.left = startX + "px";
            p.style.top = startY + "px";
            document.body.appendChild(p);

            // Random curve offset
            const curveX = (Math.random() - 0.5) * 80;
            const curveY = (Math.random() - 0.5) * 40 - 30;
            const midX = (startX + endX) / 2 + curveX;
            const midY = (startY + endY) / 2 + curveY;
            const duration = 500 + Math.random() * 200;

            let start = null;
            function animate(ts) {
                if (!start) start = ts;
                const t = Math.min((ts - start) / duration, 1);
                // Quadratic bezier
                const u = 1 - t;
                const x = u * u * startX + 2 * u * t * midX + t * t * endX;
                const y = u * u * startY + 2 * u * t * midY + t * t * endY;
                const scale = 1 - t * 0.6;
                p.style.left = x + "px";
                p.style.top = y + "px";
                p.style.transform = `translate(-50%, -50%) scale(${scale})`;
                p.style.opacity = 1 - t * 0.7;
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    p.remove();
                }
            }
            requestAnimationFrame(animate);
        }, i * 80);
    }
}

// ---- SOUND ENGINE ----
let _audioCtx = null;
function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    return _audioCtx;
}

function playSound(name, vol) {
    if (!state.soundEnabled) return;
    try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;
        if (name === "letterClick") {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine"; o.frequency.value = 1200;
            g.gain.setValueAtTime(0.15, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            o.connect(g); g.connect(ctx.destination);
            o.start(now); o.stop(now + 0.03);
        } else if (name === "wordFound") {
            [523, 659, 784].forEach((f, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = "sine"; o.frequency.value = f;
                const t = now + i * 0.1;
                g.gain.setValueAtTime(0.18, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                o.connect(g); g.connect(ctx.destination);
                o.start(t); o.stop(t + 0.15);
            });
        } else if (name === "coinSpend") {
            [0, 60, 120, 180].forEach((d) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = "square"; o.frequency.value = 800 + Math.random() * 200;
                const t = now + d / 1000;
                g.gain.setValueAtTime(0.08, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
                o.connect(g); g.connect(ctx.destination);
                o.start(t); o.stop(t + 0.04);
            });
        } else if (name === "spinTick") {
            // Sharp mechanical click — sounds like a wheel peg hitting a flapper
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            const v = vol || 0.15;
            o.type = "triangle"; o.frequency.value = 1800;
            o.frequency.exponentialRampToValueAtTime(400, now + 0.025);
            g.gain.setValueAtTime(v, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
            o.connect(g); g.connect(ctx.destination);
            o.start(now); o.stop(now + 0.04);
        } else if (name === "spinPrize") {
            [523, 659, 784, 1047].forEach((f, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = "triangle"; o.frequency.value = f;
                const t = now + i * 0.12;
                g.gain.setValueAtTime(0.2, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                o.connect(g); g.connect(ctx.destination);
                o.start(t); o.stop(t + 0.2);
            });
        } else if (name === "hintReveal") {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine"; o.frequency.value = 880;
            o.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
            g.gain.setValueAtTime(0.18, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            o.connect(g); g.connect(ctx.destination);
            o.start(now); o.stop(now + 0.2);
        } else if (name === "bonusChime") {
            [659, 784].forEach((f, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = "sine"; o.frequency.value = f;
                const t = now + i * 0.12;
                g.gain.setValueAtTime(0.15, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                o.connect(g); g.connect(ctx.destination);
                o.start(t); o.stop(t + 0.18);
            });
        }
    } catch (e) { /* audio not available */ }
}

function animateCoinGain(amount, targetId) {
    const coinDisplay = document.getElementById(targetId || "coin-display");
    if (!coinDisplay) return;
    const coinRect = coinDisplay.getBoundingClientRect();
    const endX = coinRect.left + coinRect.width / 2;
    const endY = coinRect.top + coinRect.height / 2;
    // Start from center of screen
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    // Floating gain text
    const gainText = document.createElement("div");
    gainText.className = "coin-gain-text";
    gainText.textContent = "+" + amount;
    gainText.style.left = endX + "px";
    gainText.style.top = endY + "px";
    document.body.appendChild(gainText);
    setTimeout(() => gainText.remove(), 900);

    // Coin particles flying to coin display
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement("div");
            p.className = "coin-particle";
            p.textContent = "\uD83E\uDE99";
            // Scatter start positions around center
            const sx = startX + (Math.random() - 0.5) * 60;
            const sy = startY + (Math.random() - 0.5) * 60;
            p.style.left = sx + "px";
            p.style.top = sy + "px";
            document.body.appendChild(p);

            const curveX = (Math.random() - 0.5) * 80;
            const curveY = (Math.random() - 0.5) * 40 - 30;
            const midX = (sx + endX) / 2 + curveX;
            const midY = (sy + endY) / 2 + curveY;
            const duration = 500 + Math.random() * 200;

            let start = null;
            function animate(ts) {
                if (!start) start = ts;
                const t = Math.min((ts - start) / duration, 1);
                const u = 1 - t;
                const x = u * u * sx + 2 * u * t * midX + t * t * endX;
                const y = u * u * sy + 2 * u * t * midY + t * t * endY;
                const scale = 0.6 + t * 0.4;
                p.style.left = x + "px";
                p.style.top = y + "px";
                p.style.transform = `translate(-50%, -50%) scale(${scale})`;
                p.style.opacity = 0.4 + t * 0.6;
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    p.remove();
                }
            }
            requestAnimationFrame(animate);
        }, i * 60);
    }
}

function handleHint() {
    startSpeedTimer();
    const hasFree = state.freeHints > 0;
    if (!hasFree && state.coins < 100) return;
    const cell = pickRandomUnrevealedCell();
    if (!cell) return;
    if (hasFree) {
        state.freeHints--;
    } else {
        state.coins -= 100;
        animateCoinSpend('hint-btn', 100);
    }
    state.revealedCells.push(cell);
    checkAutoCompleteWords();
    if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();
    showToast(hasFree ? "💡 Free hint used!" : "💡 Letter revealed  −100 🪙");
    renderGrid();
    flashHintCell(cell);
    renderCoins();
    renderHintBtn();
    renderRocketBtn();
    renderSpinBtn();
    checkDailyCoinWord();
    if (state.foundWords.length === totalRequired) {
        if (state.isBonusMode) {
            handleBonusCompletion();
        } else if (state.isDailyMode) {
            handleDailyCompletion();
        } else {
            checkSpeedBonus();
            delete state.inProgress[state.currentLevel];
            saveProgress();
            setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
        }
    }
}

function handleTargetHint() {
    if (state.pickMode) { cancelPickMode(); return; }
    startSpeedTimer();
    const hasFree = state.freeTargets > 0;
    if (!hasFree && state.coins < 200) return;
    if (!pickRandomUnrevealedCell()) return; // nothing to reveal
    state.pickMode = true;
    state._targetFree = hasFree; // remember whether this pick is free
    showToast("Tap a cell to reveal it", theme.accent, true);
    renderGrid();
    renderTargetBtn();
}

function handlePickCell(key) {
    if (!state.pickMode) return;
    const wasFree = state._targetFree;
    state.pickMode = false;
    state._targetFree = false;
    if (wasFree) {
        state.freeTargets--;
    } else {
        state.coins -= 200;
        animateCoinSpend('target-btn', 200);
    }
    state.revealedCells.push(key);
    checkAutoCompleteWords();
    if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();
    showToast(wasFree ? "🎯 Free target used!" : "🎯 Letter placed!  −200 🪙");
    renderGrid();
    flashHintCell(key);
    renderCoins();
    renderHintBtn();
    renderTargetBtn();
    renderRocketBtn();
    renderSpinBtn();
    checkDailyCoinWord();
    if (state.foundWords.length === totalRequired) {
        if (state.isBonusMode) {
            handleBonusCompletion();
        } else if (state.isDailyMode) {
            handleDailyCompletion();
        } else {
            checkSpeedBonus();
            delete state.inProgress[state.currentLevel];
            saveProgress();
            setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
        }
    }
}

function cancelPickMode() {
    state.pickMode = false;
    renderGrid();
    renderTargetBtn();
}

function renderTargetBtn() {
    const btn = document.getElementById("target-btn");
    if (!btn) return;
    const canUse = state.freeTargets > 0 || state.coins >= 200;
    btn.style.opacity = canUse ? "1" : "0.55";
    btn.classList.toggle("active-pick", state.pickMode);
    const badge = document.getElementById("target-badge");
    if (badge) badge.textContent = state.freeTargets > 0 ? state.freeTargets : "";
}

function handleShuffle() {
    if (state.pickMode) cancelPickMode();
    state.shuffleKey++;
    const oldLetters = [...wheelLetters];
    rebuildWheelLetters();
    saveInProgressState();
    saveProgress();

    // Try to animate in-place if letter divs exist
    const lettersDiv = document.getElementById("wheel-letters");
    if (lettersDiv && lettersDiv.children.length === wheelLetters.length) {
        // Reuse the same sizing math as renderWheel()
        const gridRows = crossword && crossword.rows ? crossword.rows : 8;
        const maxByWidth = (window.innerWidth - 100) / 2.4;
        const maxByViewport = (window.innerHeight - gridRows * 22 - 120) / 2.6;
        const wheelR = Math.max(70, Math.min(116, maxByWidth, maxByViewport));
        const letterR = Math.min(28, Math.max(18, wheelR * 0.23));
        const pad = letterR + 16;
        const cx = wheelR + pad, cy = wheelR + pad;
        const count = wheelLetters.length;

        wheelPositions = wheelLetters.map((_, i) => {
            const a = (i / count) * Math.PI * 2 - Math.PI / 2;
            return { x: cx + Math.cos(a) * wheelR, y: cy + Math.sin(a) * wheelR };
        });

        // Spin letters to center first, then out to new positions
        for (let i = 0; i < wheelLetters.length; i++) {
            const el = document.getElementById("wl-" + i);
            if (!el) continue;
            // Phase 1: shrink toward center
            el.style.transition = "left 0.2s ease-in, top 0.2s ease-in, transform 0.2s ease-in, opacity 0.2s";
            el.style.transform = "scale(0.5) rotate(180deg)";
            el.style.opacity = "0.3";
            el.style.left = (cx - letterR) + "px";
            el.style.top = (cy - letterR) + "px";
        }

        // Phase 2: update text and fly out to new positions
        setTimeout(() => {
            for (let i = 0; i < wheelLetters.length; i++) {
                const el = document.getElementById("wl-" + i);
                if (!el) continue;
                const p = wheelPositions[i];
                el.textContent = wheelLetters[i];
                el.style.transition = "left 0.25s ease-out, top 0.25s ease-out, transform 0.25s ease-out, opacity 0.2s";
                el.style.left = (p.x - letterR) + "px";
                el.style.top = (p.y - letterR) + "px";
                el.style.transform = "scale(1) rotate(0deg)";
                el.style.opacity = "1";
            }
            // Reset transition after animation completes
            setTimeout(() => {
                for (let i = 0; i < wheelLetters.length; i++) {
                    const el = document.getElementById("wl-" + i);
                    if (el) el.style.transition = "transform 0.12s, background 0.12s, color 0.12s";
                }
            }, 300);
        }, 220);
    } else {
        renderWheel();
    }
}

async function advanceToNextLevel() {
    state._grandPrizeThisLevel = false;
    if (state.isDailyMode) { exitDailyMode(); return; }
    if (applyPendingUpdate()) return;
    // Advance level logic and return to home screen
    const maxLv = ((typeof getMaxLevel === "function") ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 999999)) - state.difficultyOffset;
    if (state.foundWords.length === totalRequired) {
        delete state.inProgress[state.currentLevel];
        // Check pack completion for bonus puzzle trigger
        if (typeof getLevelPacks === "function") {
            const rawCompleted = state.currentLevel + state.difficultyOffset;
            const packs = getLevelPacks();
            for (const p of packs) {
                if (rawCompleted >= p.start && rawCompleted <= p.end) {
                    if (state.highestLevel + state.difficultyOffset > p.end) triggerBonusPuzzle("pack");
                    break;
                }
            }
        }
    }
    const isReplay = state.currentLevel < state.highestLevel;
    const wasFlowLevel = !isReplay && isFlowLevel(state.currentLevel);
    if (wasFlowLevel) state.flowsCompleted++;
    let next;
    if (isReplay) {
        // Jump back to the frontier
        next = Math.min(state.highestLevel, maxLv);
    } else {
        next = Math.min(state.currentLevel + 1, maxLv);
    }
    state.currentLevel = next;
    state.highestLevel = Math.max(state.highestLevel, next);
    checkTierPromotion();
    state.foundWords = [];
    state.bonusFound = [];
    state.revealedCells = [];
    state.standaloneFound = false;
    state.showComplete = false;
    if (!isReplay) {
        const levelUpReward = wasFlowLevel ? 3 : 1;
        state.coins += levelUpReward;
        state.totalCoinsEarned += levelUpReward;
        state.levelsCompleted++;
        checkSpeedMilestone();
        if (state.levelsCompleted % 10 === 0) {
            if (state.freeHints < MAX_FREE_HINTS) state.freeHints++;
            else showToast("Hint bank full!", "rgba(255,255,255,0.5)", true);
        }
        if (state.levelsCompleted % 20 === 0) {
            if (state.freeTargets < MAX_FREE_TARGETS) state.freeTargets++;
            else showToast("Target bank full!", "rgba(255,255,255,0.5)", true);
        }
        if (state.levelsCompleted % 30 === 0) {
            if (state.freeRockets < MAX_FREE_ROCKETS) state.freeRockets++;
            else showToast("Rocket bank full!", "rgba(255,255,255,0.5)", true);
        }
    }
    state.shuffleKey = 0;
    saveProgress();
    // Return to home screen
    state.showHome = true;
    const app = document.getElementById("app");
    app.innerHTML = "";
    renderHome();
}

async function handleNextLevel() {
    if (state.isBonusMode) { exitBonusMode(false); return; }
    if (state.isDailyMode) { exitDailyMode(); return; }
    if (applyPendingUpdate()) return;
    const maxLv = ((typeof getMaxLevel === "function") ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 999999)) - state.difficultyOffset;
    if (state.foundWords.length === totalRequired) {
        delete state.inProgress[state.currentLevel];
    }
    const isReplay = state.currentLevel < state.highestLevel;
    const wasFlowLevel = !isReplay && isFlowLevel(state.currentLevel);
    if (wasFlowLevel) state.flowsCompleted++;
    let next;
    if (isReplay) {
        // Jump back to the frontier
        next = Math.min(state.highestLevel, maxLv);
    } else {
        next = Math.min(state.currentLevel + 1, maxLv);
    }
    state.currentLevel = next;
    state.highestLevel = Math.max(state.highestLevel, next);
    checkTierPromotion();
    state.foundWords = [];
    state.bonusFound = [];
    state.revealedCells = [];
    state.standaloneFound = false;
    state.showComplete = false;
    if (!isReplay) {
        const levelUpReward = wasFlowLevel ? 3 : 1;
        state.coins += levelUpReward;
        state.totalCoinsEarned += levelUpReward;
        state.levelsCompleted++;
        if (state.levelsCompleted % 10 === 0) {
            if (state.freeHints < MAX_FREE_HINTS) state.freeHints++;
            else showToast("Hint bank full!", "rgba(255,255,255,0.5)", true);
        }
        if (state.levelsCompleted % 20 === 0) {
            if (state.freeTargets < MAX_FREE_TARGETS) state.freeTargets++;
            else showToast("Target bank full!", "rgba(255,255,255,0.5)", true);
        }
        if (state.levelsCompleted % 30 === 0) {
            if (state.freeRockets < MAX_FREE_ROCKETS) state.freeRockets++;
            else showToast("Rocket bank full!", "rgba(255,255,255,0.5)", true);
        }
    }
    state.shuffleKey = 0;
    saveProgress();
    await recompute();
    restoreLevelState();
    renderAll();
    animateGridEntrance();
}

async function goToLevel(num) {
    if (applyPendingUpdate()) return;
    if (num < 1 || num > state.highestLevel) return;
    if (num === state.currentLevel) {
        state.showMap = false;
        state.showHome = false;
        renderMap();
        const app = document.getElementById("app");
        app.innerHTML = "";
        renderAll();
        return;
    }
    saveInProgressState();
    state.currentLevel = num;
    state.foundWords = [];
    state.bonusFound = [];
    state.revealedCells = [];
    state.standaloneFound = false;
    state.showMenu = false;
    state.showMap = false;
    state.showHome = false;
    state.shuffleKey = 0;
    await recompute();
    restoreLevelState();
    saveProgress();
    const app = document.getElementById("app");
    app.innerHTML = "";
    renderAll();
    animateGridEntrance();
}

// ============================================================
// RENDERING
// ============================================================

function renderAll() {
    const app = document.getElementById("app");
    app.style.color = theme.text;

    // Background image (with dark fallback)
    if (level && _bgManifest) {
        const key = getBgImageKey(level);
        if (_bgManifest.has(key)) {
            app.style.background = `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.35) 100%), url('images/bg/${key}.webp') center/cover no-repeat`;
        } else {
            app.style.background = '#0a0312';
        }
    } else {
        app.style.background = '#0a0312';
    }

    renderHeader();
    renderWheel(); // render wheel before grid so grid-area has correct height
    renderGrid();

    renderBonusStar();
    renderCompleteModal();
    renderMenu();
    renderMap();
    renderLeaderboard();
    renderGuide();
    renderContact();
    renderPrivacy();
    renderTerms();
    renderCookiePolicy();
}

function formatCompact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 100000) return (n / 1000).toFixed(0) + 'K';
    if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString();
}

function renderCurrentScreen() {
    const app = document.getElementById("app");
    if (state.showHome) {
        app.innerHTML = "";
        renderHome();
    } else {
        renderAll();
    }
}

// ---- HOME / OPENING SCREEN ----
let _homeBgKey = null;

// These images are pre-cached by the service worker for offline use
const OFFLINE_BG_KEYS = ["alpenglow-fire","boreal-glow","cosmos-drift","glacier-calve","nebula-arm","solstice-dawn"];

function pickRandomBgKey() {
    if (!_bgManifest || _bgManifest.size === 0) {
        // Manifest failed to load (offline, first visit) — use a pre-cached image
        return OFFLINE_BG_KEYS[Math.floor(Math.random() * OFFLINE_BG_KEYS.length)];
    }
    const keys = [..._bgManifest];
    return keys[Math.floor(Math.random() * keys.length)];
}

function renderHome() {
    const app = document.getElementById("app");
    // Pick a random background each time we visit the home screen
    _homeBgKey = pickRandomBgKey();
    let bgStyle;
    if (_homeBgKey) {
        bgStyle = `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%), url('images/bg/${_homeBgKey}.webp') center/cover no-repeat`;
    } else {
        bgStyle = 'linear-gradient(170deg, #0f0520, #2d1b4e, #8b2252)';
    }

    const claimed = state.lastDailyClaim === getTodayStr();

    app.innerHTML = `
        <div class="home-screen" id="home-screen" style="background:${bgStyle}">
            <div class="home-top-bar">
                <div class="home-top-right">
                    <div class="home-coin-display" id="home-coin-display">🪙 ${state.coins.toLocaleString()}</div>
                    <div class="home-star-display" id="home-star-display">${[0,1,2].map(i => `<span id="home-star-slot-${i}">${i < Math.floor(state.bonusStarsTotal / 3) ? '\u2B50' : ''}</span>`).join('')}</div>
                </div>
            </div>
            <div class="home-expertise-row">
                <div class="expertise-banner" id="home-expertise-btn">
                    <div class="expertise-title">Expertise</div>
                    <div class="expertise-bottom">
                        <span class="expertise-icon expertise-pulse">${["\uD83C\uDF31","\uD83C\uDFC5","\uD83D\uDD25","\uD83C\uDFC6","\uD83D\uDC51"][state.difficultyTier] || "\uD83C\uDFC6"}</span>
                        <span class="expertise-tier">${DIFFICULTY_TIERS[state.difficultyTier] ? DIFFICULTY_TIERS[state.difficultyTier].label : ''}</span>
                    </div>
                    <div class="expertise-row">
                        <span class="expertise-coin">\uD83E\uDE99</span>
                        <span class="expertise-value">${formatCompact(state.totalCoinsEarned)}</span>
                    </div>
                    <div class="expertise-lb-label">Leaderboard</div>
                </div>
            </div>
            ${(function() {
                const dp = state.dailyPuzzle;
                const completed = dp && dp.date === getTodayStr() && dp.completed;
                if (completed) return '';
                const inProgress = dp && dp.date === getTodayStr() && (dp.fw || []).length > 0 && !dp.completed;
                return '<div class="home-daily-puzzle-row"><button class="home-daily-puzzle-btn' + (inProgress ? ' in-progress' : '') + '" id="home-daily-puzzle-btn"><span class="daily-icon-pulse">\uD83D\uDCC5</span> ' + (inProgress ? 'Continue Daily Puzzle' : 'Daily Puzzle') + '</button></div>';
            })()}
            ${(function() {
                if (!state.bonusPuzzle || !state.bonusPuzzle.available || isBonusPuzzleExpired()) {
                    clearExpiredBonusPuzzle();
                    return '';
                }
                return '<div class="home-bonus-puzzle-row"><button class="home-bonus-puzzle-btn" id="home-bonus-puzzle-btn"><span style="font-size:22px;line-height:0;vertical-align:middle;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.4))">\u2B50</span> Bonus Puzzle</button></div>';
            })()}
            <div class="home-center">
                <div class="home-title">Word<br>Play</div>
                <button class="home-level-btn" id="home-play-btn">
                    <span class="home-level-label">Level</span>
                    <span class="home-level-num" style="font-size:${state.currentLevel >= 100000 ? 22 : state.currentLevel >= 10000 ? 26 : 36}px">${state.currentLevel.toLocaleString()}</span>
                </button>
                <button class="home-daily-btn" id="home-daily-btn" style="${claimed ? 'visibility:hidden;pointer-events:none' : ''}">
                    <span>FREE</span>
                    <svg class="daily-coins" width="13" height="18" viewBox="0 0 20 28">${[0,1,2,3,4].map(i=>{const y=24-i*4.5;return `<path d="M2,${y} v-2.5 a8,3 0 0,1 16,0 v2.5 a8,3 0 0,1 -16,0z" fill="#a07818"/><ellipse cx="10" cy="${y-2.5}" rx="8" ry="3" fill="#d4a51c"/><ellipse cx="10" cy="${y-2.5}" rx="5" ry="1.8" fill="#e8c640" opacity="0.35"/>`}).join('')}</svg>
                    <span>COINS</span>
                </button>
            </div>
            <div class="home-bottom">
                <div class="home-bottom-btns">
                    <button class="home-corner-btn" id="home-settings-btn" title="Settings">⚙️</button>
                    <button class="home-corner-btn home-info-corner" id="home-info-btn" title="How to Play"><i style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-style:italic;font-size:18px">i</i></button>
                </div>
                ${window._updatePending ? '<div class="home-update-nudge" id="home-update-nudge">Update available &mdash; tap to refresh</div>' : ''}
                <div class="home-version">v${APP_VERSION}</div>
            </div>
        </div>
    `;

    // Wire up event handlers
    document.getElementById("home-settings-btn").onclick = () => {
        state.showMenu = true;
        renderMenu();
    };
    document.getElementById("home-info-btn").onclick = () => {
        state.showGuide = true;
        renderGuide();
    };
    document.getElementById("home-expertise-btn").onclick = () => {
        state.showLeaderboard = true;
        renderLeaderboard();
    };
    const updateNudge = document.getElementById("home-update-nudge");
    if (updateNudge) updateNudge.onclick = () => window.location.reload();
    document.getElementById("home-play-btn").onclick = async () => {
        if (applyPendingUpdate()) return;
        state.showHome = false;
        await recompute();
        const recomputeFlow = _currentLayoutIsFlow;
        restoreLevelState();
        // If restored level was in a different layout than recompute generated, regenerate
        if (_currentLayoutIsFlow !== recomputeFlow) {
            const gridWords = level.words;
            if (_currentLayoutIsFlow) {
                crossword = generateFlowGrid(gridWords);
                if (standaloneWord) {
                    for (const p of crossword.placements) {
                        if (p.word === standaloneWord) { p.standalone = true; break; }
                    }
                }
            } else {
                const _fs = gridWords.length >= 6 && ((state.currentLevel * 2654435761) >>> 0) % 5 === 0;
                const extracted = extractStandaloneWord(gridWords, 12, _fs);
                crossword = extracted.crossword;
                standaloneWord = extracted.standalone;
            }
            placedWords = crossword.placements.map(p => p.word);
            bonusPool = [...(level.bonus || []), ...gridWords.filter(w => !placedWords.includes(w))];
            { const _gl = new Set(placedWords.map(w => w.length)); bonusPool = bonusPool.filter(w => _gl.has(w.length)); }
            if (standaloneWord) bonusPool = bonusPool.filter(w => w !== standaloneWord);
            totalRequired = placedWords.length;
            // Re-restore found words for new placements
            const ip2 = state.inProgress[state.currentLevel];
            if (ip2) {
                state.foundWords = (ip2.fw || []).filter(w => placedWords.includes(w));
                state.revealedCells = ip2.rc || [];
                state.standaloneFound = ip2.sf || false;
                _regularStarCells = ip2.rsc || [];
                if (state.standaloneFound && standaloneWord && !state.foundWords.includes(standaloneWord)) {
                    state.foundWords.push(standaloneWord);
                }
                while (checkAutoCompleteWords()) {}
            }
        }
        saveInProgressState();
        saveProgress();
        app.innerHTML = "";
        renderAll();
        animateGridEntrance();
    };

    // New players only: show tier chooser (existing players are auto-detected in loadProgress)
    if (state.highestLevel <= 1 && state.difficultyTier === 0 && !localStorage.getItem("wordplay-save")) {
        setTimeout(() => renderTierChooser(), 300);
    }

    const dailyBtn = document.getElementById("home-daily-btn");
    if (dailyBtn) {
        dailyBtn.onclick = () => renderDailyModal(true);
    }
    const dpBtn = document.getElementById("home-daily-puzzle-btn");
    if (dpBtn) {
        dpBtn.onclick = () => enterDailyMode();
    }
    const bpBtn = document.getElementById("home-bonus-puzzle-btn");
    if (bpBtn) {
        bpBtn.onclick = () => enterBonusMode();
    }
}

// ---- HEADER ----
function layoutIcon() {
    if (_currentLayoutIsFlow) return '<span style="font-size:14px;line-height:14px;vertical-align:-1px;margin-right:3px">\uD83C\uDF0A</span>';
    return '<svg width="14" height="14" viewBox="0 0 14 14" style="vertical-align:-2px;margin-right:3px;opacity:0.7;fill:currentColor"><path d="M4.375,1l0,2.375c0,.552-.448,1-1,1l-2.375,0c-.552,0-1-.448-1-1l0-2.375c0-.552.448-1 1-1l2.375,0c.552,0 1,.448 1,1Z"/><path d="M9.188,1l0,2.375c0,.552-.448,1-1,1l-2.375,0c-.552,0-1-.448-1-1l0-2.375c0-.552.448-1 1-1l2.375,0c.552,0 1,.448 1,1Z"/><path d="M14,1l0,2.375c0,.552-.448,1-1,1l-2.375,0c-.552,0-1-.448-1-1l0-2.375c0-.552.448-1 1-1l2.375,0c.552,0 1,.448 1,1Z"/><path d="M4.375,5.813l0,2.375c0,.552-.448,1-1,1l-2.375,0c-.552,0-1-.448-1-1l0-2.375c0-.552.448-1 1-1l2.375,0c.552,0 1,.448 1,1Z"/><path d="M9.188,5.813l0,2.375c0,.552-.448,1-1,1l-2.375,0c-.552,0-1-.448-1-1l0-2.375c0-.552.448-1 1-1l2.375,0c.552,0 1,.448 1,1Z"/><path d="M4.375,10.625l0,2.375c0,.552-.448,1-1,1l-2.375,0c-.552,0-1-.448-1-1l0-2.375c0-.552.448-1 1-1l2.375,0c.552,0 1,.448 1,1Z" fill-opacity=".4"/><path d="M9.188,10.625l0,2.375c0,.552-.448,1-1,1l-2.375,0c-.552,0-1-.448-1-1l0-2.375c0-.552.448-1 1-1l2.375,0c.552,0 1,.448 1,1Z"/><path d="M14,5.813l0,2.375c0,.552-.448,1-1,1l-2.375,0c-.552,0-1-.448-1-1l0-2.375c0-.552.448-1 1-1l2.375,0c.552,0 1,.448 1,1Z" fill-opacity=".4"/></svg>';
}

function renderHeader() {
    let hdr = document.getElementById("header");
    if (!hdr) {
        hdr = document.createElement("div");
        hdr.id = "header";
        hdr.className = "header";
        document.getElementById("app").prepend(hdr);
    }
    hdr.style.color = theme.text;
    if (state.isBonusMode) {
        const sp = state.bonusPuzzle ? state.bonusPuzzle.starPoints : 0;
        const starSlots = sp > 0 ? [0, 1, 2].filter(i => i < sp).map(i =>
            `<span class="bonus-star-slot filled" id="bonus-star-${i}">\u2B50</span>`
        ).join('') : '';
        hdr.innerHTML = `
            <button class="back-arrow-btn" id="back-home-btn" title="Back to Home">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="header-center">
                <div class="header-pack" style="color:#d4a51c">${layoutIcon()}\u2B50 Bonus Puzzle</div>
                <div class="header-level" style="color:#d4a51c">Bonus</div>
            </div>
            <div class="header-right">
                <div class="header-btn coin-display" style="color:${theme.text}" id="coin-display">\uD83E\uDE99 ${state.coins.toLocaleString()}</div>
                <div class="bonus-star-display" id="bonus-star-display">${starSlots}</div>
            </div>
        `;
        document.getElementById("back-home-btn").onclick = () => {
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
        hdr.innerHTML = `
            <button class="back-arrow-btn" id="back-home-btn" title="Back to Home">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="header-center">
                <div class="header-pack" style="color:#22a866">${layoutIcon()}\uD83D\uDCC5 Daily Puzzle</div>
                <div class="header-level" style="color:#22a866">${getTodayStr()}</div>
            </div>
            <div class="header-right">
                <div class="header-btn coin-display" style="color:${theme.text}" id="coin-display">\uD83E\uDE99 ${state.coins.toLocaleString()}</div>
            </div>
        `;
        document.getElementById("back-home-btn").onclick = () => exitDailyMode();
    } else {
        hdr.innerHTML = `
            <button class="back-arrow-btn" id="back-home-btn" title="Back to Home">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="header-center">
                <div class="header-pack">${layoutIcon()}${level.group} \u00B7 ${level.pack}</div>
                <div class="header-level" style="color:${theme.accent}">Level ${state.currentLevel}</div>
            </div>
            <div class="header-right">
                <div class="header-btn coin-display" style="color:${theme.text}" id="coin-display">\uD83E\uDE99 ${state.coins.toLocaleString()}</div>
                <div class="bonus-star-display" id="bonus-star-display">${(function() {
                    const sp = Math.floor(state.bonusStarsTotal / 3);
                    if (sp <= 0) return '';
                    return [0,1,2].filter(i => i < sp).map(i =>
                        '<span class="bonus-star-slot filled" id="game-star-slot-' + i + '">\u2B50</span>'
                    ).join('');
                })()}</div>
            </div>
        `;
        document.getElementById("back-home-btn").onclick = () => {
            if (applyPendingUpdate()) return;
            state.showHome = true;
            const app = document.getElementById("app");
            app.innerHTML = "";
            renderHome();
        };
    }
    const hdrCenter = document.querySelector(".header-center");
    if (hdrCenter) hdrCenter.onclick = toggleLayout;
}

function renderCoins() {
    const el = document.getElementById("coin-display");
    if (el) el.textContent = "🪙 " + state.coins.toLocaleString();
}

function getTodayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function renderDailyBtn() {
    const btn = document.getElementById("daily-btn");
    if (!btn) return;
    const claimed = state.lastDailyClaim === getTodayStr();
    btn.style.display = claimed ? "none" : "";
}

function renderDailyModal(show) {
    let overlay = document.getElementById("daily-modal");
    if (!show) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "daily-modal";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    overlay.innerHTML = `
        <div class="modal-box" style="border:2px solid ${theme.accent}50;box-shadow:0 0 40px ${theme.accent}20">
            <div class="modal-emoji">🪙</div>
            <h2 class="modal-title" style="color:${theme.accent}">Daily Bonus</h2>
            <p class="modal-coins" style="color:${theme.text}">+100 coins</p>
            <button class="modal-next-btn" id="daily-claim-btn"
                style="background:linear-gradient(180deg,${theme.accent} 0%,${theme.accentDark} 100%);border:2px solid ${theme.accent};border-bottom-color:${theme.accentDark};box-shadow:0 4px 14px ${theme.accent}60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">
                Claim
            </button>
        </div>
    `;
    document.getElementById("daily-claim-btn").onclick = () => {
        state.coins += 100;
        state.totalCoinsEarned += 100;
        state.lastDailyClaim = getTodayStr();
        saveProgress();
        renderDailyModal(false);
        renderHome();
        showToast("🪙 +100 daily coins!", theme.accent);
        playSound("spinPrize");
        setTimeout(() => animateCoinGain(100, "home-coin-display"), 200);
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) renderDailyModal(false);
    };
}

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

    const tierColors = ["#4CAF50", "#2196F3", "#FF9800", "#f44336", "#9C27B0"];
    const tierEmojis = ["\uD83C\uDF31", "\uD83D\uDCAA", "\uD83D\uDD25", "\uD83C\uDFC6", "\uD83D\uDC51"];

    let btnsHtml = "";
    DIFFICULTY_TIERS.forEach((t, i) => {
        btnsHtml += `
            <button class="tier-choice-btn" data-tier="${i}" style="border-color:${tierColors[i]}">
                <span class="tier-choice-emoji">${tierEmojis[i]}</span>
                <div>
                    <span class="tier-choice-label" style="color:${tierColors[i]}">${t.label}</span>
                    <span class="tier-choice-tagline">${t.tagline}</span>
                </div>
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
            state.currentLevel = 1;   // always start at display level 1
            state.highestLevel = 1;
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

    const tierColors = ["#4CAF50", "#2196F3", "#FF9800", "#f44336", "#9C27B0"];
    const tierEmojis = ["\uD83C\uDF31", "\uD83D\uDCAA", "\uD83D\uDD25", "\uD83C\uDFC6", "\uD83D\uDC51"];
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

    if (typeof playSound === "function") playSound("spinPrize");

    document.getElementById("tier-promo-btn").onclick = () => {
        overlay.style.display = "none";
    };
}

function renderBonusModal(show) {
    let overlay = document.getElementById("bonus-modal");
    if (!show) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "bonus-modal";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";

    let listHtml = "";
    const totalBonus = bonusPool ? bonusPool.length : 0;
    if (state.bonusFound.length === 0) {
        listHtml = `<p class="bonus-modal-empty">No bonus words found in this level</p>`;
    } else {
        listHtml = `<div class="bonus-modal-list">` +
            state.bonusFound.map(w => `<span class="bonus-modal-word">${w}</span>`).join("") +
            `</div>`;
    }

    overlay.innerHTML = `
        <div class="modal-box" style="border:2px solid ${theme.accent}50;box-shadow:0 0 40px ${theme.accent}20">
            <div class="modal-emoji">⭐</div>
            <h2 class="modal-title" style="color:${theme.accent}">Bonus Words</h2>
            <p class="modal-subtitle">${state.bonusFound.length} of ${totalBonus} in this level · ${state.bonusCounter}/10 to next reward</p>
            ${listHtml}
            <button class="modal-next-btn" id="bonus-modal-close"
                style="background:linear-gradient(180deg,${theme.accent} 0%,${theme.accentDark} 100%);border:2px solid ${theme.accent};border-bottom-color:${theme.accentDark};box-shadow:0 4px 14px ${theme.accent}60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">
                Close
            </button>
        </div>
    `;
    document.getElementById("bonus-modal-close").onclick = () => renderBonusModal(false);
    overlay.onclick = (e) => {
        if (e.target === overlay) renderBonusModal(false);
    };
}

// ---- DEFINITION MODAL ----
function showDefinition(word) {
    if (!DEFINITIONS) return;
    const entry = DEFINITIONS[word];
    if (!entry) {
        showToast("No definition available", "rgba(255,255,255,0.5)", true);
        return;
    }
    let overlay = document.getElementById("definition-modal");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "definition-modal";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";

    const defsHtml = entry.d.map((def, i) =>
        `<div class="def-entry"><span class="def-num" style="color:${theme.accent}">${i + 1}.</span> ${def}</div>`
    ).join("");

    overlay.innerHTML = `
        <div class="modal-box def-modal-box">
            <div class="def-close" id="def-close-x">&times;</div>
            <div class="def-title" style="color:${theme.accent}">${word}</div>
            <div class="def-panel">
                <div class="def-pos">${entry.p}</div>
                ${defsHtml}
            </div>
            ${typeof isSignedIn === "function" && isSignedIn() ? `
                <button class="def-flag-btn ${_myWordVotes.has(word) ? 'flagged' : ''}" id="def-flag-btn"
                    data-word="${word}">
                    🚩 ${_myWordVotes.has(word) ? 'Flagged' : 'Flag for Review'}
                </button>
            ` : ''}
            <button class="modal-next-btn" id="def-close-btn"
                style="background:linear-gradient(180deg,${theme.accent},${theme.accent}bb);border:2px solid ${theme.accent};box-shadow:0 4px 14px ${theme.accent}60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3);margin-top:16px">
                Close
            </button>
        </div>
    `;

    const close = () => { overlay.style.display = "none"; };
    document.getElementById("def-close-btn").onclick = close;
    document.getElementById("def-close-x").onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    const flagBtn = document.getElementById("def-flag-btn");
    if (flagBtn) {
        flagBtn.onclick = async () => {
            const w = flagBtn.dataset.word;
            const isFlagged = _myWordVotes.has(w);
            try {
                if (isFlagged) {
                    const resp = await fetch('/api/word-votes/' + encodeURIComponent(w), {
                        method: 'DELETE', headers: getAuthHeaders()
                    });
                    if (resp.ok) {
                        _myWordVotes.delete(w);
                        flagBtn.className = 'def-flag-btn';
                        flagBtn.textContent = '🚩 Flag for Review';
                    }
                } else {
                    const resp = await fetch('/api/word-votes', {
                        method: 'POST',
                        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                        body: JSON.stringify({ word: w })
                    });
                    if (resp.ok || resp.status === 409) {
                        _myWordVotes.add(w);
                        flagBtn.className = 'def-flag-btn flagged';
                        flagBtn.textContent = '🚩 Flagged';
                    }
                }
            } catch (e) {
                showToast("Couldn't save vote", "rgba(255,255,255,0.5)", true);
            }
        };
    }
}

// ---- GRID ----
function renderGrid() {
    let area = document.getElementById("grid-area");
    if (!area) {
        area = document.createElement("div");
        area.id = "grid-area";
        area.className = "grid-area";
        const app = document.getElementById("app");
        const hdr = document.getElementById("header");
        if (hdr && hdr.nextSibling) app.insertBefore(area, hdr.nextSibling);
        else app.appendChild(area);
    }

    let gc = document.getElementById("grid-container");
    if (!gc) {
        gc = document.createElement("div");
        gc.id = "grid-container";
        area.innerHTML = "";
        area.appendChild(gc);
    }

    const { grid, placements, rows, cols } = crossword;
    if (!grid || !grid.length) { gc.innerHTML = ""; return; }

    const revealed = new Set();
    const valid = new Set();
    const standaloneCells = new Set();
    for (const p of placements) {
        for (const c of p.cells) valid.add(c.row + "," + c.col);
        if (state.foundWords.includes(p.word)) {
            for (const c of p.cells) revealed.add(c.row + "," + c.col);
        }
        if (p.standalone) {
            for (const c of p.cells) standaloneCells.add(c.row + "," + c.col);
        }
    }
    // Include individually hinted cells
    for (const k of state.revealedCells) revealed.add(k);

    // Measure actual rendered dimensions via getBoundingClientRect
    const appEl = document.getElementById("app");
    const appW = appEl ? appEl.getBoundingClientRect().width : window.innerWidth;
    const areaRect = area.getBoundingClientRect();
    const availW = appW - 24; // subtract grid-area horizontal padding (12px each side)
    const availH = areaRect.height > 0 ? areaRect.height - 16 : window.innerHeight * 0.38;
    // Compute cell size first, then derive gap from it
    const rawCs = Math.min(Math.floor(availW / cols), Math.floor(availH / rows), 44);
    const gap = rawCs >= 30 ? 4 : 2;
    // Recompute with gap accounted for
    const vw = availW - gap * (cols - 1);
    const vh = availH - gap * (rows - 1);
    const cs = Math.min(Math.floor(vw / cols), Math.floor(vh / rows), 44);
    const fs = Math.max(cs * 0.55, 16);
    const br = cs >= 36 ? 6 : cs >= 26 ? 3 : 2;

    gc.className = "grid-container";
    gc.style.gridTemplateColumns = `repeat(${cols}, ${cs}px)`;
    gc.style.gridTemplateRows = `repeat(${rows}, ${cs}px)`;
    gc.style.gap = gap + "px";
    gc.style.display = "grid";

    // Build or update cells in-place (avoids flash from innerHTML rebuild)
    const totalCells = rows * cols;
    const needsRebuild = gc.children.length !== totalCells;
    if (needsRebuild) gc.innerHTML = "";

    let idx = 0;
    for (let ri = 0; ri < rows; ri++) {
        for (let ci = 0; ci < cols; ci++) {
            const cell = grid[ri][ci];
            const k = ri + "," + ci;
            let div;
            if (needsRebuild) {
                div = document.createElement("div");
                gc.appendChild(div);
            } else {
                div = gc.children[idx];
            }
            idx++;

            if (!valid.has(k)) {
                div.className = "";
                div.style.cssText = "";
                div.textContent = "";
                div.onclick = null;
                continue;
            }

            const isR = revealed.has(k);
            div.className = "grid-cell" + (isR ? " revealed" : "");
            div.setAttribute("data-key", k);
            div.style.width = cs + "px";
            div.style.height = cs + "px";
            div.style.borderRadius = br + "px";
            div.style.fontSize = fs + "px";

            if (state.isDailyMode && _dailyCoinCellKey === k && !state.foundWords.includes(_dailyCoinWord)) {
                // Daily coin cell — shown on unrevealed OR revealed cells
                div.className = "grid-cell daily-coin-cell";
                div.style.border = "2px solid rgba(34,168,102,0.6)";
                if (isR) {
                    div.style.background = theme.accent;
                    div.style.color = "#fff";
                    div.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";
                } else {
                    div.style.background = "rgba(220,215,230,1)";
                    div.style.color = "";
                    div.style.textShadow = "";
                }
                if (state.pickMode) {
                    div.textContent = "";
                    div.style.cursor = "pointer";
                    div.onclick = () => handlePickCell(k);
                } else {
                    const coinFs = Math.max(cs * 0.65, 10);
                    div.innerHTML = '<span class="daily-coin-icon" style="font-size:' + coinFs + 'px">\uD83E\uDE99</span>';
                    div.style.cursor = "";
                    div.onclick = null;
                }
            } else if (((state.isBonusMode && _bonusStarCells.includes(k)) || (!state.isBonusMode && !state.isDailyMode && _regularStarCells.includes(k))) && !isStarCollected(k)) {
                // Bonus star cell — show star overlay
                div.className = "grid-cell bonus-star-cell";
                if (isR) {
                    div.style.background = theme.accent;
                    div.style.color = "#fff";
                    div.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";
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
            } else if (isR) {
                div.style.background = theme.accent;
                div.style.border = "none";
                div.style.color = "#fff";
                div.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";
                div.textContent = cell;
                // Definition tap: non-intersection cells of fully found words
                const defWord = _cellToWord[k];
                if (defWord && !state.pickMode && DEFINITIONS && state.foundWords.includes(defWord)) {
                    div.style.cursor = "pointer";
                    div.onclick = () => showDefinition(defWord);
                } else {
                    div.style.cursor = "";
                    div.onclick = null;
                }
            } else if (standaloneCells.has(k)) {
                // Unsolved standalone coin cell
                div.style.background = state.pickMode ? "rgba(255,255,200,1)" : "rgba(220,215,230,1)";
                div.style.border = state.pickMode ? "2px solid " + theme.accent : "none";
                div.style.color = "";
                div.style.textShadow = "";
                if (state.pickMode) {
                    div.textContent = "";
                    div.style.cursor = "pointer";
                    div.onclick = () => handlePickCell(k);
                } else {
                    const coinFs = Math.max(cs * 0.7, 10);
                    div.innerHTML = '<span class="standalone-coin" style="font-size:' + coinFs + 'px">\uD83E\uDE99</span>';
                    div.style.cursor = "";
                    div.onclick = null;
                }
            } else {
                div.style.background = state.pickMode ? "rgba(255,255,200,1)" : "rgba(220,215,230,1)";
                div.style.border = state.pickMode ? "2px solid " + theme.accent : "none";
                div.style.color = "transparent";
                div.style.textShadow = "";
                div.textContent = "";
                if (state.pickMode) {
                    div.style.cursor = "pointer";
                    div.onclick = () => handlePickCell(k);
                } else {
                    div.style.cursor = "";
                    div.onclick = null;
                }
            }
        }
    }
}

function animateCoinFlyFromStandalone() {
    const gc = document.getElementById("grid-container");
    const coinDisplay = document.getElementById("coin-display");
    if (!gc || !coinDisplay) return;

    // Find standalone cells in the grid to use as animation source
    let startX = window.innerWidth / 2, startY = window.innerHeight / 2;
    for (const p of crossword.placements) {
        if (!p.standalone) continue;
        const firstIdx = p.cells[0].row * crossword.cols + p.cells[0].col;
        const lastIdx = p.cells[p.cells.length - 1].row * crossword.cols + p.cells[p.cells.length - 1].col;
        const firstEl = gc.children[firstIdx];
        const lastEl = gc.children[lastIdx];
        if (firstEl && lastEl) {
            const fr = firstEl.getBoundingClientRect();
            const lr = lastEl.getBoundingClientRect();
            startX = (fr.left + lr.right) / 2;
            startY = (fr.top + lr.bottom) / 2;
        }
        break;
    }

    const coinRect = coinDisplay.getBoundingClientRect();
    const endX = coinRect.left + coinRect.width / 2;
    const endY = coinRect.top + coinRect.height / 2;

    // Floating gain text
    const gainText = document.createElement("div");
    gainText.className = "coin-gain-text";
    gainText.textContent = "+100";
    gainText.style.left = endX + "px";
    gainText.style.top = endY + "px";
    document.body.appendChild(gainText);
    setTimeout(() => gainText.remove(), 900);

    const count = 8;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement("div");
            p.className = "coin-particle";
            p.textContent = "\uD83E\uDE99";
            const sx = startX + (Math.random() - 0.5) * 60;
            const sy = startY + (Math.random() - 0.5) * 30;
            p.style.left = sx + "px";
            p.style.top = sy + "px";
            document.body.appendChild(p);

            const curveX = (Math.random() - 0.5) * 80;
            const curveY = (Math.random() - 0.5) * 40 - 30;
            const midX = (sx + endX) / 2 + curveX;
            const midY = (sy + endY) / 2 + curveY;
            const duration = 500 + Math.random() * 200;

            let start = null;
            function animate(ts) {
                if (!start) start = ts;
                const t = Math.min((ts - start) / duration, 1);
                const u = 1 - t;
                const x = u * u * sx + 2 * u * t * midX + t * t * endX;
                const y = u * u * sy + 2 * u * t * midY + t * t * endY;
                const scale = 0.6 + t * 0.4;
                p.style.left = x + "px";
                p.style.top = y + "px";
                p.style.transform = `translate(-50%, -50%) scale(${scale})`;
                p.style.opacity = 0.4 + t * 0.6;
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    p.remove();
                }
            }
            requestAnimationFrame(animate);
        }, i * 60);
    }
}

function animateCoinFlyFromDailyCoin(cellKey) {
    const key = cellKey || _dailyCoinCellKey;
    const gc = document.getElementById("grid-container");
    const coinDisplay = document.getElementById("coin-display");
    if (!gc || !coinDisplay || !key) return;
    const [cr, cc] = key.split(",").map(Number);
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
    gainText.textContent = "+25";
    gainText.style.left = endX + "px";
    gainText.style.top = endY + "px";
    document.body.appendChild(gainText);
    setTimeout(() => gainText.remove(), 900);
    for (let i = 0; i < 5; i++) {
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
        if (inBonus) {
            state.bonusPuzzle.starPoints = newPoints;
        }
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
                state._grandPrizeThisLevel = true;
                saveProgress();
                renderCoins();
                // Only show celebration if level is still in progress;
                // if level just completed, the complete modal handles it
                if (!state.showComplete) {
                    showGrandPrizeCelebration();
                } else {
                    renderHeader();
                    playSound("bonusChime");
                }
            }, wordStarCells.length * 200 + 800);
        }
    }
}

function showGrandPrizeCelebration() {
    playSound("bonusChime");
    // Create non-blocking celebration overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:99998;pointer-events:none;
        display:flex;align-items:center;justify-content:center;
        animation:grandPrizeFadeIn 0.4s ease;
    `;
    // Coin shower particles
    const particleCount = 24;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement("div");
        const startX = 30 + Math.random() * 40;
        const drift = (Math.random() - 0.5) * 60;
        const delay = Math.random() * 0.6;
        const dur = 1.5 + Math.random() * 1;
        const size = 14 + Math.random() * 10;
        p.textContent = Math.random() > 0.3 ? "\uD83E\uDE99" : "\u2B50";
        p.style.cssText = `
            position:absolute;top:-20px;left:${startX}%;font-size:${size}px;
            opacity:0;pointer-events:none;
            animation:grandPrizeCoinFall ${dur}s ${delay}s ease-in forwards;
            --drift:${drift}px;
        `;
        overlay.appendChild(p);
    }
    // Center banner
    const banner = document.createElement("div");
    banner.innerHTML = `
        <div style="font-size:42px;letter-spacing:6px;margin-bottom:8px">\u2B50\u2B50\u2B50</div>
        <div style="font-size:22px;font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.5)">Grand Prize!</div>
        <div style="font-size:28px;font-weight:800;color:#ffd740;margin-top:4px;text-shadow:0 2px 8px rgba(0,0,0,0.5)">+500 \uD83E\uDE99</div>
    `;
    banner.style.cssText = `
        text-align:center;padding:28px 40px;
        background:radial-gradient(ellipse,rgba(212,165,28,0.25) 0%,rgba(0,0,0,0.6) 70%);
        border-radius:20px;border:2px solid rgba(255,215,0,0.4);
        backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
        animation:grandPrizeBannerPop 0.5s 0.2s ease both;
    `;
    overlay.appendChild(banner);
    document.body.appendChild(overlay);
    // Auto-dismiss after 2.5s
    setTimeout(() => {
        overlay.style.animation = "grandPrizeFadeOut 0.5s ease forwards";
        setTimeout(() => {
            overlay.remove();
            renderHeader();
        }, 500);
    }, 2500);
}

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

// Animate grid cells appearing when entering a new level
function animateGridEntrance() {
    const gc = document.getElementById("grid-container");
    if (!gc) return;
    const { rows, cols } = crossword;
    const cells = gc.children;

    // Pick a random entrance pattern
    const patterns = ["topLeft", "bottomRight", "leftRight", "rightLeft", "starburst"];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    const midR = (rows - 1) / 2;
    const midC = (cols - 1) / 2;

    function cellDist(ri, ci) {
        switch (pattern) {
            case "topLeft":     return ri + ci;
            case "bottomRight": return (rows - 1 - ri) + (cols - 1 - ci);
            case "leftRight":   return ci;
            case "rightLeft":   return cols - 1 - ci;
            case "starburst":   return Math.round(Math.sqrt((ri - midR) ** 2 + (ci - midC) ** 2));
        }
    }

    // Find max distance for this pattern
    let maxDist = 0;
    for (let ri = 0; ri < rows; ri++)
        for (let ci = 0; ci < cols; ci++)
            maxDist = Math.max(maxDist, cellDist(ri, ci));

    // Ascending scale notes — one per wave
    const scaleNotes = [262, 294, 330, 370, 415, 466, 523, 587, 659, 740, 831, 932, 1047];
    const playedDist = new Set();

    for (let ri = 0; ri < rows; ri++) {
        for (let ci = 0; ci < cols; ci++) {
            const div = cells[ri * cols + ci];
            if (!div || !div.classList.contains("grid-cell")) continue;
            const dist = cellDist(ri, ci);
            const delay = dist * 90;

            // Play a note for each new wave
            if (!playedDist.has(dist)) {
                playedDist.add(dist);
                const noteIdx = Math.min(dist, scaleNotes.length - 1);
                setTimeout(() => {
                    if (!state.soundEnabled) return;
                    try {
                        const ctx = getAudioCtx();
                        const now = ctx.currentTime;
                        const o = ctx.createOscillator();
                        const g = ctx.createGain();
                        o.type = "sine";
                        o.frequency.value = scaleNotes[noteIdx];
                        g.gain.setValueAtTime(0.1, now);
                        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                        o.connect(g); g.connect(ctx.destination);
                        o.start(now); o.stop(now + 0.25);
                    } catch (e) {}
                }, delay);
            }
            div.style.opacity = "0";
            div.style.transform = "scale(0)";
            div.style.transition = "none";
            div.offsetHeight;
            div.style.transition = `opacity 0.3s ease ${delay}ms, transform 0.35s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`;
            div.style.opacity = "1";
            div.style.transform = "scale(1)";
        }
    }
    // Clean up inline transitions after animation completes
    const totalTime = maxDist * 90 + 400;
    setTimeout(() => {
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].classList.contains("grid-cell")) {
                cells[i].style.transition = "";
            }
        }
    }, totalTime);
}

// Highlight cells of a just-found word
function highlightWord(word) {
    const placement = crossword.placements.find(p => p.word === word);
    if (!placement) return;
    for (const c of placement.cells) {
        const el = document.querySelector(`.grid-cell[data-key="${c.row},${c.col}"]`);
        if (el) {
            el.style.setProperty("--cell-found", theme.accent);
            el.classList.add("word-flash");
            setTimeout(() => el.classList.remove("word-flash"), 1400);
        }
    }
}

// Animate a hint-revealed cell so the player notices it
function flashHintCell(key) {
    const el = document.querySelector(`.grid-cell[data-key="${key}"]`);
    if (!el) return;
    playSound("hintReveal");
    el.classList.add("hint-flash");
    setTimeout(() => el.classList.remove("hint-flash"), 2500);
}


// ---- LETTER WHEEL ----
let wheelState = { sel: [], word: "", dragging: false, ptr: null };
let wheelPositions = [];

function renderWheel() {
    let section = document.getElementById("wheel-section");
    if (!section) {
        section = document.createElement("div");
        section.id = "wheel-section";
        section.className = "wheel-section";
        document.getElementById("app").appendChild(section);
    }

    const count = wheelLetters.length;
    // Scale wheel down for large grids so everything fits vertically
    const gridRows = crossword && crossword.rows ? crossword.rows : 8;
    const maxByWidth = (window.innerWidth - 100) / 2.4;
    // For grids with many rows, shrink the wheel to leave more vertical room
    const maxByViewport = (window.innerHeight - gridRows * 22 - 120) / 2.6;
    const wheelR = Math.max(70, Math.min(116, maxByWidth, maxByViewport));
    const letterR = Math.min(28, Math.max(18, wheelR * 0.23));
    const pad = letterR + 16;
    const cx = wheelR + pad, cy = wheelR + pad;
    const cW = (wheelR + pad) * 2;
    const discR = wheelR + letterR + 8;

    wheelPositions = wheelLetters.map((_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(a) * wheelR, y: cy + Math.sin(a) * wheelR };
    });

    // Reset wheel state
    wheelState = { sel: [], word: "", dragging: false, ptr: null };

    const hintCanUse = state.freeHints > 0 || state.coins >= 100;
    const targetCanUse = state.freeTargets > 0 || state.coins >= 200;
    const rocketCanUse = state.freeRockets > 0 || state.coins >= 300;
    // Button positions: upper pair flanks the current-word, lower pair below
    const upperBtnTop = 0;
    const lowerBtnTop = 72; // 52px button + 20px gap (room for centered badge above lower btns)
    section.innerHTML = `
        <div class="current-word" id="current-word" style="color:${theme.accent};text-shadow:0 1px 0 rgba(255,255,255,0.3),0 2px 0 rgba(0,0,0,0.3),0 3px 0 rgba(0,0,0,0.15),0 0 4px ${theme.accent}80">&nbsp;</div>
        <button class="circle-btn" id="shuffle-btn" title="Shuffle" style="left:4px;top:${upperBtnTop}px">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 3 21 3 21 8" stroke="#5bc0eb"/><line x1="4" y1="20" x2="21" y2="3" stroke="#5bc0eb"/>
                <polyline points="21 16 21 21 16 21" stroke="#f7b32b"/><line x1="15" y1="15" x2="21" y2="21" stroke="#f7b32b"/>
                <line x1="4" y1="4" x2="9" y2="9" stroke="#fc6471"/>
            </svg>
        </button>
        <button class="circle-btn" id="target-btn" title="Choose letter (200 coins)" style="left:4px;top:${lowerBtnTop}px;opacity:${targetCanUse ? '1' : '0.55'}">
            <span style="font-size:30px;line-height:1;padding-left:1px">🎯</span>
            <span class="circle-btn-badge" id="target-badge">${state.freeTargets > 0 ? state.freeTargets : ''}</span>
            <span class="circle-btn-price">200</span>
        </button>
        <button class="circle-btn" id="hint-btn" title="Hint (100 coins)" style="right:4px;top:${upperBtnTop}px;opacity:${hintCanUse ? '1' : '0.55'}">
            <span style="font-size:24px;line-height:1">💡</span>
            <span class="circle-btn-badge" id="hint-badge">${state.freeHints > 0 ? state.freeHints : ''}</span>
            <span class="circle-btn-price">100</span>
        </button>
        <button class="circle-btn" id="rocket-btn" title="Rocket hint (300 coins)" style="right:4px;top:${lowerBtnTop}px;opacity:${rocketCanUse ? '1' : '0.55'}">
            <span style="font-size:26px;line-height:1">🚀</span>
            <span class="circle-btn-badge" id="rocket-badge">${state.freeRockets > 0 ? state.freeRockets : ''}</span>
            <span class="circle-btn-price">300</span>
        </button>
        <div class="wheel-area" id="wheel-area" style="width:${cW}px;height:${cW}px">
            <svg id="wheel-svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
                <circle cx="${cx}" cy="${cy}" r="${discR}" fill="rgba(255,255,255,0.92)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            </svg>
            <div id="wheel-letters"></div>
        </div>
        <div class="bonus-star-area" id="bonus-star-area">
            <button class="star-btn" id="bonus-star-btn">
                <svg width="44" height="44" viewBox="0 0 24 24">
                    <polygon id="bonus-star-fill" points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        style="fill:${(state.bonusCounter > 0 || state.bonusFound.length > 0) ? 'rgba(244,208,63,0.15)' : 'none'};stroke:${(state.bonusCounter > 0 || state.bonusFound.length > 0) ? '#f4d03f' : 'rgba(255,255,255,0.35)'};stroke-width:1.5"/>
                    <text id="bonus-star-counter" x="12" y="14.5" text-anchor="middle"
                        style="font-size:7px;font-weight:700;font-family:Nunito,system-ui,sans-serif;fill:rgba(255,255,255,0.85)">${state.bonusCounter || ''}</text>
                </svg>
            </button>
        </div>
        <div class="spin-btn-area" id="spin-btn-area" style="display:none">
            <button class="spin-badge-btn" id="spin-btn" style="--accent:${theme.accent};--accent-dark:${theme.accentDark}"><span class="spin-gift">🎁</span><span class="spin-text">Spin</span></button>
        </div>
    `;

    // Render letter circles
    const lettersDiv = document.getElementById("wheel-letters");
    const letterFS = Math.min(letterR * 1.6, Math.max(28, wheelR * 0.36));
    for (let i = 0; i < wheelLetters.length; i++) {
        const p = wheelPositions[i];
        const div = document.createElement("div");
        div.className = "wheel-letter";
        div.id = "wl-" + i;
        div.style.left = (p.x - letterR) + "px";
        div.style.top = (p.y - letterR) + "px";
        div.style.width = (letterR * 2) + "px";
        div.style.height = (letterR * 2) + "px";
        div.style.fontSize = letterFS + "px";
        div.style.color = "#1a1a2e";
        div.style.background = "transparent";
        div.style.border = "3px solid transparent";
        div.textContent = wheelLetters[i];
        lettersDiv.appendChild(div);
    }

    // Toast element
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        toast.style.display = "none";
        document.getElementById("app").appendChild(toast);
    }

    // Event listeners
    const area = document.getElementById("wheel-area");
    area.addEventListener("touchstart", onWheelStart, { passive: false });
    area.addEventListener("touchmove", onWheelMove, { passive: false });
    area.addEventListener("touchend", onWheelEnd, { passive: false });
    area.addEventListener("mousedown", onWheelStart);
    area.addEventListener("mousemove", onWheelMove);
    area.addEventListener("mouseup", onWheelEnd);
    area.addEventListener("mouseleave", onWheelEnd);

    document.getElementById("shuffle-btn").onclick = handleShuffle;
    document.getElementById("hint-btn").onclick = handleHint;
    document.getElementById("target-btn").onclick = handleTargetHint;
    document.getElementById("rocket-btn").onclick = handleRocketHint;
    document.getElementById("bonus-star-btn").onclick = () => renderBonusModal(true);
    document.getElementById("spin-btn").onclick = () => openSpinModal();

    renderSpinBtn();

    // Show "Next Level" overlay on wheel when level is already complete
    if (state.foundWords.length === totalRequired && !state.showComplete) {
        const maxLv = ((typeof getMaxLevel === "function") ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 999999)) - state.difficultyOffset;
        const isLast = state.currentLevel >= maxLv;
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:5;border-radius:50%;background:rgba(0,0,0,0.35)";
        // Stop wheel touch/mouse handlers from intercepting
        const stopWheel = (e) => { e.stopPropagation(); };
        overlay.addEventListener("touchstart", stopWheel, { passive: false });
        overlay.addEventListener("touchmove", stopWheel, { passive: false });
        overlay.addEventListener("touchend", stopWheel, { passive: false });
        overlay.addEventListener("mousedown", stopWheel);
        overlay.addEventListener("mousemove", stopWheel);
        overlay.addEventListener("mouseup", stopWheel);
        const btn = document.createElement("button");
        btn.innerHTML = isLast ? "All Done!" : `Next Level <svg width="18" height="18" viewBox="0 0 24 24" style="vertical-align:middle;margin-left:4px"><path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        btn.style.cssText = `background:linear-gradient(180deg,${theme.accent},${theme.accentDark});color:#000;border:1px solid rgba(255,255,255,0.3);border-bottom-color:rgba(0,0,0,0.15);padding:10px 20px;border-radius:24px;font-size:15px;font-weight:700;font-family:Nunito,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 12px ${theme.accent}40,inset 0 1px 0 rgba(255,255,255,0.3);display:flex;align-items:center`;
        btn.onclick = () => { playSound("wordFound"); handleNextLevel(); };
        overlay.appendChild(btn);
        document.getElementById("wheel-area").appendChild(overlay);
    }

}

function renderHintBtn() {
    const btn = document.getElementById("hint-btn");
    if (!btn) return;
    const canUse = state.freeHints > 0 || state.coins >= 100;
    btn.style.opacity = canUse ? "1" : "0.55";
    const badge = document.getElementById("hint-badge");
    if (badge) badge.textContent = state.freeHints > 0 ? state.freeHints : "";
}

function handleRocketHint() {
    startSpeedTimer();
    const hasFree = state.freeRockets > 0;
    if (!hasFree && state.coins < 300) return;
    const firstCell = pickRandomUnrevealedCell();
    if (!firstCell) return;
    if (hasFree) {
        state.freeRockets--;
    } else {
        state.coins -= 300;
        animateCoinSpend('rocket-btn', 300);
    }
    const revealed = [firstCell];
    state.revealedCells.push(firstCell);
    checkAutoCompleteWords();
    for (let i = 1; i < 5; i++) {
        const cell = pickRandomUnrevealedCell();
        if (!cell) break;
        revealed.push(cell);
        state.revealedCells.push(cell);
        checkAutoCompleteWords();
    }
    if (state.isDailyMode) saveDailyState(); else if (state.isBonusMode) saveBonusState(); else saveProgress();
    showToast(hasFree ? "🚀 Free rocket used! " + revealed.length + " letters!" : "🚀 " + revealed.length + " letters revealed  −300 🪙");
    renderGrid();
    revealed.forEach((cell, i) => setTimeout(() => flashHintCell(cell), i * 400));
    renderCoins();
    renderHintBtn();
    renderTargetBtn();
    renderRocketBtn();
    renderSpinBtn();
    checkDailyCoinWord();
    if (state.foundWords.length === totalRequired) {
        if (state.isBonusMode) {
            handleBonusCompletion();
        } else if (state.isDailyMode) {
            handleDailyCompletion();
        } else {
            checkSpeedBonus();
            delete state.inProgress[state.currentLevel];
            saveProgress();
            setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700 + revealed.length * 400);
        }
    }
}

function renderRocketBtn() {
    const btn = document.getElementById("rocket-btn");
    if (!btn) return;
    const canUse = state.freeRockets > 0 || state.coins >= 300;
    btn.style.opacity = canUse ? "1" : "0.55";
    const badge = document.getElementById("rocket-badge");
    if (badge) badge.textContent = state.freeRockets > 0 ? state.freeRockets : "";
}

function renderSpinBtn() {
    const el = document.getElementById("spin-btn-area");
    if (!el) return;
    const stuck = state.freeHints === 0 && state.freeTargets === 0 && state.freeRockets === 0 && state.coins < 100;
    el.style.display = stuck ? "" : "none";
}

// ---- RESCUE SPIN WHEEL ----
let _spinAngle = 0;
let _spinAnimating = false;
const SPIN_SLICES = [
    { label: "Hint",      emoji: "💡", color: "#4CAF50" },
    { label: "Rocket",    emoji: "🚀", color: "#9C27B0" },
    { label: "Target",    emoji: "🎯", color: "#2196F3" },
    { label: "Star",      emoji: "⭐", color: "#FFC107" },
    { label: "Hint",      emoji: "💡", color: "#66BB6A" },
    { label: "Rocket",    emoji: "🚀", color: "#7B1FA2" },
    { label: "Target",    emoji: "🎯", color: "#42A5F5" },
    { label: "100 Coins", emoji: "🪙", color: "#FF9800" },
];

function drawSpinWheel(canvas, angle) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size / 2 - 4;
    const sliceAngle = (Math.PI * 2) / SPIN_SLICES.length;

    ctx.clearRect(0, 0, size, size);

    // Outer glow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.shadowColor = "rgba(255,200,60,0.5)";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "rgba(255,220,100,0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < SPIN_SLICES.length; i++) {
        const startA = angle + i * sliceAngle;
        const endA = startA + sliceAngle;

        // Slice fill with radial gradient
        const mid = startA + sliceAngle / 2;
        const gx = cx + Math.cos(mid) * r * 0.5;
        const gy = cy + Math.sin(mid) * r * 0.5;
        const baseColor = SPIN_SLICES[i].color;

        // Base slice fill
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startA, endA);
        ctx.closePath();
        ctx.fillStyle = baseColor;
        ctx.fill();

        // Pillow/3D effect — clip to slice, then layer highlights and shadows
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startA, endA);
        ctx.closePath();
        ctx.clip();

        // Bright center highlight (raised center)
        const hlX = cx + Math.cos(mid) * r * 0.45;
        const hlY = cy + Math.sin(mid) * r * 0.45;
        const hlGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, r * 0.6);
        hlGrad.addColorStop(0, "rgba(255,255,255,0.35)");
        hlGrad.addColorStop(0.5, "rgba(255,255,255,0.1)");
        hlGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = hlGrad;
        ctx.fill();

        // Dark edges — inner shadow along divider lines
        const edgeShadow = (edgeAngle) => {
            const ex = cx + Math.cos(edgeAngle) * r * 0.5;
            const ey = cy + Math.sin(edgeAngle) * r * 0.5;
            const perpX = -Math.sin(edgeAngle);
            const perpY = Math.cos(edgeAngle);
            const sg = ctx.createLinearGradient(ex - perpX * 20, ey - perpY * 20, ex + perpX * 20, ey + perpY * 20);
            sg.addColorStop(0, "rgba(0,0,0,0)");
            sg.addColorStop(0.35, "rgba(0,0,0,0)");
            sg.addColorStop(0.5, "rgba(0,0,0,0.2)");
            sg.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = sg;
            ctx.fill();
        };
        edgeShadow(startA);
        edgeShadow(endA);

        // Darken outer rim edge
        const rimGrad = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
        rimGrad.addColorStop(0, "rgba(0,0,0,0)");
        rimGrad.addColorStop(0.7, "rgba(0,0,0,0)");
        rimGrad.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.fillStyle = rimGrad;
        ctx.fill();

        // Darken center edge
        const ctrGrad = ctx.createRadialGradient(cx, cy, 18, cx, cy, 35);
        ctrGrad.addColorStop(0, "rgba(0,0,0,0.2)");
        ctrGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ctrGrad;
        ctx.fill();

        ctx.restore();

        // Slice divider lines
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(startA) * r, cy + Math.sin(startA) * r);
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text label ABOVE, emoji BELOW — pushed toward edge
        const tx = cx + Math.cos(mid) * (r * 0.68);
        const ty = cy + Math.sin(mid) * (r * 0.68);
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(mid + Math.PI / 2);
        // Label on top
        ctx.font = "bold 13px Nunito, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillText(SPIN_SLICES[i].label, 0.5, -13.5);
        ctx.fillStyle = "#fff";
        ctx.fillText(SPIN_SLICES[i].label, 0, -14);
        // Emoji below
        ctx.font = "30px sans-serif";
        ctx.fillText(SPIN_SLICES[i].emoji, 0, 12);
        ctx.restore();
    }

    // Outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Tick marks on rim
    for (let i = 0; i < SPIN_SLICES.length; i++) {
        const a = angle + i * sliceAngle;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
    }

    // Center hub — metallic style
    const hubGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 22);
    hubGrad.addColorStop(0, "#ffd54f");
    hubGrad.addColorStop(0.5, "#f9a825");
    hubGrad.addColorStop(1, "#e65100");
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner hub circle
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();
    ctx.font = "bold 11px Nunito, system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);
}

function openSpinModal() {
    if (_spinAnimating) return;
    let overlay = document.getElementById("spin-modal");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "spin-modal";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    overlay.innerHTML = `
        <div class="spin-modal-box" style="border:2px solid ${theme.accent}50;box-shadow:0 0 40px ${theme.accent}20">
            <h2 class="modal-title" style="color:${theme.accent}">Spin of Shame!</h2>
            <p class="modal-subtitle">Spin the wheel for a free prize</p>
            <div class="spin-wheel-container">
                <canvas id="spin-canvas" width="280" height="280"></canvas>
                <div class="spin-pointer"></div>
            </div>
            <div class="spin-result" id="spin-result" style="display:none">
                <div class="spin-result-emoji" id="spin-result-emoji"></div>
                <div class="spin-result-text" id="spin-result-text"></div>
            </div>
            <button class="modal-next-btn" id="spin-go-btn"
                style="background:linear-gradient(180deg,${theme.accent} 0%,${theme.accentDark} 100%);border:2px solid ${theme.accent};border-bottom-color:${theme.accentDark};box-shadow:0 4px 14px ${theme.accent}60,inset 0 1px 1px rgba(255,255,255,0.4);font-size:20px;letter-spacing:3px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">
                SPIN!
            </button>
        </div>
    `;
    const canvas = document.getElementById("spin-canvas");
    _spinAngle = Math.random() * Math.PI * 2;
    drawSpinWheel(canvas, _spinAngle);
    document.getElementById("spin-go-btn").onclick = startSpin;
    overlay.onclick = (e) => {
        if (e.target === overlay && !_spinAnimating) closeSpinModal();
    };
}

function closeSpinModal() {
    const overlay = document.getElementById("spin-modal");
    if (overlay) overlay.style.display = "none";
}

function startSpin() {
    if (_spinAnimating) return;
    _spinAnimating = true;
    const btn = document.getElementById("spin-go-btn");
    if (btn) { btn.textContent = "Spinning..."; btn.onclick = null; }
    const result = document.getElementById("spin-result");
    if (result) result.style.display = "none";

    const canvas = document.getElementById("spin-canvas");
    const startVel = 15 + Math.random() * 10; // 15-25 rad/s
    let velocity = startVel;
    const friction = 0.97;
    let lastSlice = -1;
    const sliceAngle = (Math.PI * 2) / SPIN_SLICES.length;

    function frame() {
        _spinAngle += velocity * 0.016; // ~60fps
        velocity *= friction;
        drawSpinWheel(canvas, _spinAngle);

        // Click sound on segment boundary — gets louder as wheel slows
        const normalAngle = ((-_spinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const currentSlice = Math.floor(normalAngle / sliceAngle);
        if (currentSlice !== lastSlice && lastSlice !== -1) {
            const vol = 0.08 + 0.22 * (1 - velocity / startVel);
            playSound("spinTick", vol);
        }
        lastSlice = currentSlice;

        if (velocity > 0.002) {
            requestAnimationFrame(frame);
        } else {
            onSpinComplete();
        }
    }
    requestAnimationFrame(frame);
}

function getWinningSlice() {
    // The pointer is at the top (angle = -PI/2 or 3PI/2)
    // Normalize angle to find which slice is at top
    const pointerAngle = -Math.PI / 2;
    const normalAngle = ((pointerAngle - _spinAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const sliceAngle = (Math.PI * 2) / SPIN_SLICES.length;
    const idx = Math.floor(normalAngle / sliceAngle) % SPIN_SLICES.length;
    return idx;
}

function onSpinComplete() {
    const winIdx = getWinningSlice();
    const winner = SPIN_SLICES[winIdx];
    playSound("spinPrize");

    const result = document.getElementById("spin-result");
    const emoji = document.getElementById("spin-result-emoji");
    const text = document.getElementById("spin-result-text");
    if (result && emoji && text) {
        emoji.textContent = winner.emoji;
        text.textContent = "You won: " + winner.label + "!";
        result.style.display = "block";
        result.style.animation = "none";
        result.offsetHeight;
        result.style.animation = "pop 0.4s ease";
    }
    const btn = document.getElementById("spin-go-btn");
    if (btn) {
        btn.textContent = "Claim!";
        btn.onclick = () => claimSpinPrize(winner);
    }
}

function claimSpinPrize(winner) {
    if (winner.label === "Hint") {
        if (state.freeHints < MAX_FREE_HINTS) state.freeHints++;
        else showToast("Hint bank full!", "rgba(255,255,255,0.5)", true);
    } else if (winner.label === "Star") {
        state.bonusStarsTotal = Math.min(state.bonusStarsTotal + 3, 9);
    } else if (winner.label === "Target") {
        if (state.freeTargets < MAX_FREE_TARGETS) state.freeTargets++;
        else showToast("Target bank full!", "rgba(255,255,255,0.5)", true);
    } else if (winner.label === "Rocket") {
        if (state.freeRockets < MAX_FREE_ROCKETS) state.freeRockets++;
        else showToast("Rocket bank full!", "rgba(255,255,255,0.5)", true);
    } else if (winner.label === "100 Coins") {
        state.coins += 100;
        state.totalCoinsEarned += 100;
    }
    saveProgress();
    _spinAnimating = false;
    closeSpinModal();
    renderCoins();
    renderHintBtn();
    renderTargetBtn();
    renderRocketBtn();
    renderSpinBtn();
    showToast("🎁 " + winner.emoji + " " + winner.label + "!", theme.accent);
    // Coin gain animation for coin prizes
    if (winner.label === "100 Coins") {
        setTimeout(() => animateCoinGain(100), 200);
    }
    // Star fly animation + bonus trigger
    if (winner.label === "Star") {
        setTimeout(() => animateStarFly(), 200);
        if (state.bonusStarsTotal >= 9) {
            setTimeout(() => triggerBonusPuzzle("stars"), 1200);
        }
        return;
    }
    // Pulse the relevant element after a brief delay so it's visible
    let targetId = null;
    if (winner.label === "Hint") targetId = "hint-btn";
    else if (winner.label === "Target") targetId = "target-btn";
    else if (winner.label === "Rocket") targetId = "rocket-btn";
    else if (winner.label === "100 Coins") targetId = "coin-display";
    if (targetId) {
        setTimeout(() => {
            const el = document.getElementById(targetId);
            if (!el) return;
            playSound("spinPrize");
            el.classList.remove("prize-pulse");
            el.offsetHeight;
            el.classList.add("prize-pulse");
            setTimeout(() => el.classList.remove("prize-pulse"), 700);
        }, 300);
    }
}

// ---- SPEED BONUS SPIN MODAL ----
function openSpeedSpinModal() {
    if (_speedSpinAnimating) return;
    let overlay = document.getElementById("speed-spin-modal");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "speed-spin-modal";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    overlay.innerHTML = `
        <div class="modal-box" style="padding:20px;border:2px solid rgba(255,200,0,0.4);box-shadow:0 0 40px rgba(255,200,0,0.15)">
            <h2 class="modal-title" style="color:#ffd740;font-size:18px">\u26A1 Speed Bonus</h2>
            <div class="spin-wheel-container">
                <canvas id="speed-spin-canvas" width="280" height="280"></canvas>
                <div class="spin-pointer"></div>
            </div>
            <div id="speed-spin-result" style="display:none;text-align:center;margin:8px 0">
                <span id="speed-spin-result-emoji" style="font-size:32px"></span>
                <span id="speed-spin-result-text" style="color:#fff;font-size:16px;font-weight:700;margin-left:8px"></span>
            </div>
            <button class="modal-next-btn" id="speed-spin-go-btn"
                style="background:linear-gradient(180deg,#ffc107 0%,#e6a800 100%);border:2px solid #ffc107;border-bottom-color:#cc9600;box-shadow:0 4px 14px rgba(255,193,7,0.5),inset 0 1px 1px rgba(255,255,255,0.4);color:#000;text-shadow:0 1px 1px rgba(255,255,255,0.3);font-weight:800">
                SPIN!
            </button>
        </div>
    `;
    const canvas = document.getElementById("speed-spin-canvas");
    drawSpinWheel(canvas, _speedSpinAngle);
    document.getElementById("speed-spin-go-btn").onclick = startSpeedSpin;
}

function closeSpeedSpinModal() {
    const overlay = document.getElementById("speed-spin-modal");
    if (overlay) overlay.style.display = "none";
}

function startSpeedSpin() {
    if (_speedSpinAnimating) return;
    _speedSpinAnimating = true;
    const btn = document.getElementById("speed-spin-go-btn");
    if (btn) { btn.textContent = "Spinning..."; btn.onclick = null; }
    const result = document.getElementById("speed-spin-result");
    if (result) result.style.display = "none";

    const canvas = document.getElementById("speed-spin-canvas");
    const startVel = 15 + Math.random() * 10;
    let velocity = startVel;
    const friction = 0.97;
    let lastSlice = -1;
    const sliceAngle = (Math.PI * 2) / SPIN_SLICES.length;

    function frame() {
        _speedSpinAngle += velocity * 0.016;
        velocity *= friction;
        drawSpinWheel(canvas, _speedSpinAngle);

        const normalAngle = ((-_speedSpinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const currentSlice = Math.floor(normalAngle / sliceAngle);
        if (currentSlice !== lastSlice && lastSlice !== -1) {
            const vol = 0.08 + 0.22 * (1 - velocity / startVel);
            playSound("spinTick", vol);
        }
        lastSlice = currentSlice;

        if (velocity > 0.002) {
            requestAnimationFrame(frame);
        } else {
            onSpeedSpinComplete();
        }
    }
    requestAnimationFrame(frame);
}

function getSpeedWinningSlice() {
    const pointerAngle = -Math.PI / 2;
    const normalAngle = ((pointerAngle - _speedSpinAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const sliceAngle = (Math.PI * 2) / SPIN_SLICES.length;
    return Math.floor(normalAngle / sliceAngle) % SPIN_SLICES.length;
}

function onSpeedSpinComplete() {
    const winIdx = getSpeedWinningSlice();
    const winner = SPIN_SLICES[winIdx];
    playSound("spinPrize");

    const result = document.getElementById("speed-spin-result");
    const emoji = document.getElementById("speed-spin-result-emoji");
    const text = document.getElementById("speed-spin-result-text");
    if (result && emoji && text) {
        emoji.textContent = winner.emoji;
        text.textContent = "You won: " + winner.label + "!";
        result.style.display = "block";
        result.style.animation = "none";
        result.offsetHeight;
        result.style.animation = "pop 0.4s ease";
    }
    const btn = document.getElementById("speed-spin-go-btn");
    if (btn) {
        btn.textContent = "Claim!";
        btn.onclick = () => claimSpeedSpinPrize(winner);
    }
}

function claimSpeedSpinPrize(winner) {
    if (winner.label === "Hint") {
        if (state.freeHints < MAX_FREE_HINTS) state.freeHints++;
        else showToast("Hint bank full!", "rgba(255,255,255,0.5)", true);
    } else if (winner.label === "Star") {
        state.bonusStarsTotal = Math.min(state.bonusStarsTotal + 3, 9);
    } else if (winner.label === "Target") {
        if (state.freeTargets < MAX_FREE_TARGETS) state.freeTargets++;
        else showToast("Target bank full!", "rgba(255,255,255,0.5)", true);
    } else if (winner.label === "Rocket") {
        if (state.freeRockets < MAX_FREE_ROCKETS) state.freeRockets++;
        else showToast("Rocket bank full!", "rgba(255,255,255,0.5)", true);
    } else if (winner.label === "100 Coins") {
        state.coins += 100;
        state.totalCoinsEarned += 100;
    }
    saveProgress();
    _speedSpinAnimating = false;
    closeSpeedSpinModal();
    showToast("\u26A1 " + winner.emoji + " " + winner.label + "!", "#ffd740");
    if (winner.label === "100 Coins") {
        setTimeout(() => animateCoinGain(100), 200);
    }
    if (winner.label === "Star") {
        setTimeout(() => animateStarFly(), 200);
        if (state.bonusStarsTotal >= 9) {
            setTimeout(() => triggerBonusPuzzle("stars"), 1200);
            return;
        }
    }
    // Advance to next level after a brief pause for the toast
    setTimeout(() => advanceToNextLevel(), 1200);
}

function hitTestWheel(px, py) {
    const gridRows = crossword && crossword.rows ? crossword.rows : 8;
    const maxByWidth = (window.innerWidth - 100) / 2.4;
    const maxByViewport = (window.innerHeight - gridRows * 22 - 120) / 2.6;
    const wheelR = Math.max(70, Math.min(116, maxByWidth, maxByViewport));
    const letterR = Math.min(28, Math.max(18, wheelR * 0.23));
    for (let i = 0; i < wheelPositions.length; i++) {
        const dx = px - wheelPositions[i].x, dy = py - wheelPositions[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < letterR + 12) return i;
    }
    return -1;
}

function relPos(e) {
    const area = document.getElementById("wheel-area");
    if (!area) return null;
    const rect = area.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

function onWheelStart(e) {
    e.preventDefault();
    const p = relPos(e);
    if (!p) return;
    const i = hitTestWheel(p.x, p.y);
    if (i >= 0) {
        // Start speed timer on first wheel interaction this level
        startSpeedTimer();
        wheelState.dragging = true;
        wheelState.sel = [i];
        wheelState.word = wheelLetters[i];
        wheelState.ptr = p;
        playSound("letterClick");
        updateWheelVisuals();
    }
}

function onWheelMove(e) {
    e.preventDefault();
    if (!wheelState.dragging) return;
    const p = relPos(e);
    if (!p) return;
    wheelState.ptr = p;
    const i = hitTestWheel(p.x, p.y);
    if (i >= 0) {
        if (!wheelState.sel.includes(i)) {
            wheelState.sel.push(i);
            wheelState.word += wheelLetters[i];
            playSound("letterClick");
        } else if (wheelState.sel.length > 1 && i === wheelState.sel[wheelState.sel.length - 2]) {
            wheelState.sel.pop();
            wheelState.word = wheelState.word.slice(0, -1);
        }
    }
    updateWheelVisuals();
}

function onWheelEnd(e) {
    e.preventDefault();
    if (wheelState.dragging && wheelState.word.length >= 3) {
        handleWord(wheelState.word);
    } else if (wheelState.dragging && wheelState.word.length > 0 && wheelState.word.length < 3) {
        showToast("Too short", "rgba(255,255,255,0.5)", true);
    }
    wheelState.dragging = false;
    wheelState.sel = [];
    wheelState.word = "";
    wheelState.ptr = null;
    updateWheelVisuals();
}

function updateWheelVisuals() {
    // Update current word display
    const cw = document.getElementById("current-word");
    if (cw) {
        cw.textContent = wheelState.word || "\u00A0";
        if (wheelState.word) {
            cw.style.background = theme.accent + "90";
            cw.style.border = "1px solid " + theme.accent;
            cw.style.borderRadius = "999px";
            cw.style.padding = "0 20px";
            cw.style.color = "#fff";
        } else {
            cw.style.background = "";
            cw.style.border = "";
            cw.style.borderRadius = "";
            cw.style.padding = "";
            cw.style.color = theme.accent;
        }
    }

    // Update letter highlighting
    for (let i = 0; i < wheelLetters.length; i++) {
        const el = document.getElementById("wl-" + i);
        if (!el) continue;
        const active = wheelState.sel.includes(i);
        el.style.color = active ? "#fff" : "#1a1a2e";
        el.style.background = active ? theme.accent : "transparent";
        el.style.border = "3px solid " + (active ? theme.accent : "transparent");
        el.style.boxShadow = active ? "0 0 16px " + theme.accent + "60" : "none";
        el.className = "wheel-letter" + (active ? " active" : "");
    }

    // Update SVG lines
    const svg = document.getElementById("wheel-svg");
    if (!svg) return;
    // Remove old lines (keep the circle)
    while (svg.children.length > 1) svg.removeChild(svg.lastChild);

    // Draw selection lines
    for (let i = 1; i < wheelState.sel.length; i++) {
        const a = wheelPositions[wheelState.sel[i - 1]];
        const b = wheelPositions[wheelState.sel[i]];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
        line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
        line.setAttribute("stroke", theme.accent);
        line.setAttribute("stroke-width", "8");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("opacity", "0.75");
        svg.appendChild(line);
    }

    // Trailing line to pointer
    if (wheelState.dragging && wheelState.sel.length > 0 && wheelState.ptr) {
        const last = wheelPositions[wheelState.sel[wheelState.sel.length - 1]];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", last.x); line.setAttribute("y1", last.y);
        line.setAttribute("x2", wheelState.ptr.x); line.setAttribute("y2", wheelState.ptr.y);
        line.setAttribute("stroke", theme.accent);
        line.setAttribute("stroke-width", "5");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("opacity", "0.3");
        line.setAttribute("stroke-dasharray", "6,6");
        svg.appendChild(line);
    }
}

// ---- KEYBOARD INPUT FOR WHEEL ----
function isWheelReady() {
    if (state.showHome || state.showComplete || state.showMenu || state.showMap ||
        state.showGuide || state.showLeaderboard || state.showContact ||
        state.showPrivacy || state.showTerms || state.showCookiePolicy || state.showAdmin)
        return false;
    if (state.pickMode) return false;
    const modals = document.querySelectorAll(".modal-overlay");
    for (const m of modals) if (m.style.display !== "none") return false;
    if (!wheelLetters || wheelLetters.length === 0) return false;
    return true;
}

function onKeyDown(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (!isWheelReady()) return;
    // Don't intercept if user is mid-drag with mouse/touch
    if (wheelState.dragging) return;

    const key = e.key;

    if (key === "Enter") {
        if (wheelState.sel.length === 0) return;
        e.preventDefault();
        if (wheelState.word.length >= 3) {
            handleWord(wheelState.word);
        } else {
            showToast("Too short", "rgba(255,255,255,0.5)", true);
        }
        wheelState.sel = [];
        wheelState.word = "";
        wheelState.ptr = null;
        updateWheelVisuals();
        return;
    }

    if (key === "Escape") {
        if (wheelState.sel.length === 0) return;
        e.preventDefault();
        wheelState.sel = [];
        wheelState.word = "";
        wheelState.ptr = null;
        updateWheelVisuals();
        return;
    }

    if (key === "Backspace") {
        if (wheelState.sel.length === 0) return;
        e.preventDefault();
        wheelState.sel.pop();
        wheelState.word = wheelState.word.slice(0, -1);
        updateWheelVisuals();
        return;
    }

    // Letter keys
    if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        const letter = key.toUpperCase();
        // Find first unselected wheel index matching this letter
        const idx = wheelLetters.findIndex((l, i) => l.toUpperCase() === letter && !wheelState.sel.includes(i));
        if (idx < 0) return; // letter not available
        if (wheelState.sel.length === 0) startSpeedTimer();
        wheelState.sel.push(idx);
        wheelState.word += wheelLetters[idx];
        playSound("letterClick");
        updateWheelVisuals();
    }
}

document.addEventListener("keydown", onKeyDown);

// ---- COMPLETE MODAL ----
function renderCompleteModal() {
    let overlay = document.getElementById("complete-modal");
    if (!state.showComplete) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "complete-modal";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    if (state.isBonusMode) {
        const bp = state.bonusPuzzle;
        const grandPrize = bp && bp._grandPrizeAwarded;
        const totalStars = grandPrize ? 9 : state.bonusStarsTotal;
        const starSlots = [0, 1, 2].map(i => i < Math.floor(totalStars / 3) ? '\u2B50' : '\u2606').join(' ');
        const roundStars = bp ? bp.starsCollected : 0;
        overlay.innerHTML = `
            <div class="modal-box" style="border:2px solid #d4a51c50;box-shadow:0 0 40px #d4a51c20">
                <div class="modal-emoji">${grandPrize ? '\uD83C\uDF1F' : '\u2B50'}</div>
                <h2 class="modal-title" style="color:#d4a51c">${grandPrize ? 'Grand Prize!' : 'Bonus Round Done'}</h2>
                <p class="modal-subtitle" style="font-size:24px">${starSlots}</p>
                <p class="modal-subtitle">${roundStars} star${roundStars !== 1 ? 's' : ''} found this round</p>
                ${!grandPrize ? '<p class="modal-subtitle" style="font-size:13px;opacity:0.7">' + totalStars + '/9 total stars</p>' : ''}
                ${grandPrize ? '<p class="modal-coins" style="color:#d4a51c;font-size:18px;font-weight:700">Grand Prize: +500 \uD83E\uDE99</p>' : ''}
                <p class="modal-coins" style="color:${theme.text}">+${_bonusCoinsEarned} \uD83E\uDE99 total earned</p>
                <button class="modal-next-btn" id="next-btn"
                    style="background:linear-gradient(180deg,#d4a51c 0%,#a07818 100%);border:2px solid #d4a51c;border-bottom-color:#a07818;box-shadow:0 4px 14px #d4a51c60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">
                    Collect & Return Home
                </button>
            </div>
        `;
        document.getElementById("next-btn").onclick = () => exitBonusMode(false);
    } else if (state.isDailyMode) {
        overlay.innerHTML = `
            <div class="modal-box" style="border:2px solid #22a86650;box-shadow:0 0 40px #22a86620">
                <div class="modal-emoji">\uD83D\uDCC5</div>
                <h2 class="modal-title" style="color:#22a866">Daily Puzzle Complete!</h2>
                <p class="modal-subtitle">${getTodayStr()}</p>
                <p class="modal-coins" style="color:${theme.text}">+${_dailyCoinsEarned} \uD83E\uDE99 earned</p>
                <button class="modal-next-btn" id="next-btn"
                    style="background:linear-gradient(180deg,#22a866 0%,#158040 100%);border:2px solid #22a866;border-bottom-color:#158040;box-shadow:0 4px 14px #22a86660,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">
                    Done \u2713
                </button>
            </div>
        `;
        document.getElementById("next-btn").onclick = () => exitDailyMode();
    } else {
        const maxLv = ((typeof getMaxLevel === "function" && getMaxLevel() > 0) ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 999999)) - state.difficultyOffset;
        const isLast = state.currentLevel >= maxLv;
        const bonusCount = state.bonusFound.length;
        const speedTime = _speedBonusEarned ? _speedBonusTime.toFixed(1) : null;
        const flowLevel = isFlowLevel(state.currentLevel);
        overlay.innerHTML = `
            <div class="modal-box" style="border:2px solid ${theme.accent}50;box-shadow:0 0 40px ${theme.accent}20">
                <div class="modal-emoji">\uD83C\uDF89</div>
                <h2 class="modal-title" style="color:${theme.accent}">Level Complete!</h2>
                <p class="modal-subtitle">${flowLevel ? '\uD83C\uDF0A Flow Level \u00B7 ' : ''}${level.group} \u00B7 ${level.pack} \u00B7 Level ${state.currentLevel}</p>
                ${flowLevel ? '<p class="modal-coins" style="color:#5b8def;font-size:13px;font-weight:700">\uD83C\uDF0A 3x Rewards</p>' : ''}
                <p class="modal-coins" style="color:${theme.text}">+${flowLevel ? 3 : 1} \uD83E\uDE99${bonusCount > 0 ? " \u00B7 +" + bonusCount + " bonus" : ""}</p>
                ${state._grandPrizeThisLevel ? '<p class="modal-coins" style="color:#d4a51c;font-size:16px;font-weight:700">\u2B50\u2B50\u2B50 Grand Prize! +500 \uD83E\uDE99</p>' : ''}
                ${_speedSpinPending ? `
                    <div style="margin:12px 0 4px;padding:10px 16px;background:linear-gradient(135deg,rgba(255,200,0,0.15),rgba(255,140,0,0.1));border:1px solid rgba(255,200,0,0.3);border-radius:12px">
                        <p style="color:#ffd740;font-size:14px;font-weight:700;margin:0 0 2px">\u26A1 Speed Bonus!</p>
                        <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:0">${speedTime}s — you beat the clock!</p>
                    </div>
                    <button class="modal-next-btn" id="speed-spin-btn"
                        style="background:linear-gradient(180deg,#ffc107 0%,#e6a800 100%);border:2px solid #ffc107;border-bottom-color:#cc9600;box-shadow:0 4px 14px rgba(255,193,7,0.5),inset 0 1px 1px rgba(255,255,255,0.4);color:#000;text-shadow:0 1px 1px rgba(255,255,255,0.3);font-weight:800;font-size:16px;margin-top:8px">
                        \uD83C\uDF1F Free Spin!
                    </button>
                ` : ''}
                <button class="modal-next-btn" id="next-btn"
                    style="background:linear-gradient(180deg,${theme.accent} 0%,${theme.accentDark} 100%);border:2px solid ${theme.accent};border-bottom-color:${theme.accentDark};box-shadow:0 4px 14px ${theme.accent}60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)${_speedSpinPending ? ';margin-top:6px' : ''}">
                    ${isLast ? "\uD83C\uDFC6 All Done!" : "Next Level \u2192"}
                </button>
            </div>
        `;
        if (_speedSpinPending) {
            document.getElementById("speed-spin-btn").onclick = () => {
                _speedSpinPending = false;
                state.showComplete = false;
                renderCompleteModal();
                openSpeedSpinModal();
            };
        }
        document.getElementById("next-btn").onclick = () => {
            if (_speedSpinPending) {
                // Confirm leaving without using free spin
                if (!confirm("You have a free Speed Bonus spin! Leave without using it?")) return;
                _speedSpinPending = false;
            }
            advanceToNextLevel();
        };
    }
}

// ---- Settings MENU ----
function renderMenu() {
    let overlay = document.getElementById("menu-overlay");
    if (!state.showMenu) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "menu-overlay";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "menu-overlay";
    overlay.style.display = "flex";

    const maxLv = ((typeof getMaxLevel === "function" && getMaxLevel() > 0) ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 0)) - state.difficultyOffset;

    let html = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="menu-close-btn" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${theme.accent}">⚙️ Settings</h2>
            <button class="back-arrow-btn" id="sound-toggle-btn" title="Toggle sound" style="position:absolute;right:12px;font-size:20px">${state.soundEnabled ? '🔊' : '🔇'}</button>
        </div>
        <div class="menu-scroll">
    `;

    // Account section
    if (typeof isSignedIn === "function" && isSignedIn()) {
        const user = getUser();
        html += `
            <div class="menu-setting" style="text-align:center">
                <div id="menu-profile-edit" style="display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;margin-bottom:8px">
                    ${renderAvatar(user.avatarData, user.displayName, 60)}
                    <div style="font-size:15px;margin-top:8px">${escapeHtml(user.displayName || "Player")} <span style="font-size:11px">✏️</span></div>
                </div>
                <label style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;font-size:13px;cursor:pointer;opacity:0.7">
                    <input type="checkbox" id="menu-lb-checkbox" ${user.showOnLeaderboard !== false ? "checked" : ""} style="width:18px;height:18px;accent-color:${theme.accent};cursor:pointer">
                    Show me on leaderboard
                </label>
                <div style="margin-top:10px"></div>
                <div style="display:flex;gap:8px;margin-top:10px;justify-content:center">
                    <button class="menu-setting-btn" id="menu-signout-btn" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3);flex:1;padding:8px 0;font-size:13px">Sign Out</button>
                </div>
                <button class="menu-setting-btn" id="menu-delete-account-btn" style="background:rgba(255,50,50,0.15);color:#ff6666;border:1px solid rgba(255,50,50,0.25);width:100%;padding:8px 0;font-size:12px;margin-top:8px">Delete Account</button>
            </div>
        `;
    } else if (typeof isSignedIn === "function") {
        html += `
            <div class="menu-setting" style="text-align:center">
                <div style="font-size:13px;opacity:0.6;margin-bottom:10px">🔒 Sign in to sync across devices</div>
                <div style="display:flex;flex-direction:column;gap:8px">
                    <button class="auth-btn auth-btn-google" id="menu-google-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:8px"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Sign in with Google
                    </button>
                    <button class="auth-btn auth-btn-microsoft" id="menu-microsoft-btn">
                        <svg width="18" height="18" viewBox="0 0 21 21" style="vertical-align:middle;margin-right:8px"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>
                        Sign in with Microsoft
                    </button>
                </div>
            </div>
        `;
    }

    // Stats + Current Level side by side
    html += `
        <div class="menu-top-row">
            <div class="menu-top-col" id="menu-stats-card" style="cursor:default">
                <div class="menu-current-label">Stats</div>
                <div class="menu-stat">Highest Level: <span style="color:${theme.accent}">${state.highestLevel.toLocaleString()}</span></div>
                <div class="menu-stat">Coins: <span style="color:${theme.accent}">🪙 ${state.coins}</span></div>
                <div class="menu-stat">Levels Available: <span style="color:${theme.accent}">${maxLv.toLocaleString()}</span></div>
            </div>
            <div class="menu-top-col" id="menu-current-level-card" style="cursor:default">
                <div class="menu-current-label">Current Level</div>
                <div class="menu-current-num" style="color:${theme.accent}">${state.currentLevel.toLocaleString()}</div>
                <div class="menu-current-info">${level ? level.group + " \u00b7 " + level.pack : ""}</div>
                <div class="menu-current-progress">${state.foundWords.length} of ${totalRequired} words found</div>
            </div>
        </div>
    `;

    // Quick navigation
    html += `
        <div class="menu-nav-row">
            <button class="menu-nav-btn" id="menu-prev" style="border-color:${theme.accent}40">◀ Prev</button>
            <button class="menu-nav-btn" id="menu-restart" style="border-color:${theme.accent}40">↺ Restart Level</button>
            <button class="menu-nav-btn" id="menu-next" style="border-color:${theme.accent}40" ${state.currentLevel >= state.highestLevel ? "disabled" : ""}>Next ▶</button>
        </div>
    `;

    // Level Map button
    html += `
        <button class="menu-map-btn" id="menu-map-btn" style="background:linear-gradient(135deg,${theme.accent},${theme.accentDark});color:#000">
            <span style="font-size:24px;vertical-align:middle">🗺️</span> Level Map
        </button>
    `;

    // Difficulty Tier
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

    // Set progress + Reset (hidden until easter egg)
    html += `<div id="menu-secret-section" style="display:${_menuSecretTaps >= 8 ? 'block' : 'none'}">`;

    // Compute current monthly display values from stored baselines
    const _msRaw = parseInt(localStorage.getItem("wordplay-monthly-start") || "0");
    const _mcsRaw = parseInt(localStorage.getItem("wordplay-monthly-coins-start") || "0");
    const _monthlyLevels = Math.max(0, state.highestLevel - _msRaw);
    const _monthlyPoints = Math.max(0, state.totalCoinsEarned - _mcsRaw);

    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Game State:</label>
            <div class="menu-setting-row" style="margin-bottom:8px">
                <span style="font-size:13px;opacity:0.6;width:60px;flex-shrink:0">🪙 Coins</span>
                <input type="number" id="seed-coins-input" value="${state.coins}" min="0" class="menu-setting-input">
            </div>
            <div class="menu-setting-row" style="margin-bottom:8px">
                <span style="font-size:13px;opacity:0.6;width:60px;flex-shrink:0">💡 Hints</span>
                <input type="number" id="seed-hints-input" value="${state.freeHints}" min="0" class="menu-setting-input">
            </div>
            <div class="menu-setting-row" style="margin-bottom:8px">
                <span style="font-size:13px;opacity:0.6;width:60px;flex-shrink:0">🎯 Target</span>
                <input type="number" id="seed-targets-input" value="${state.freeTargets}" min="0" class="menu-setting-input">
            </div>
            <div class="menu-setting-row" style="margin-bottom:8px">
                <span style="font-size:13px;opacity:0.6;width:60px;flex-shrink:0">🚀 Rocket</span>
                <input type="number" id="seed-rockets-input" value="${state.freeRockets}" min="0" class="menu-setting-input">
            </div>
            <button class="menu-setting-btn" id="seed-state-btn" style="background:${theme.accent};color:#000;width:100%;padding:10px 0;margin-top:4px">Set Game State</button>
        </div>
    `;

    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Leaderboard:</label>
            <div class="menu-setting-row" style="margin-bottom:8px">
                <span style="font-size:13px;opacity:0.6;width:90px;flex-shrink:0">All-Time Levels</span>
                <input type="number" id="seed-level-input" value="${state.highestLevel}" min="1" max="${maxLv}" class="menu-setting-input">
            </div>
            <div class="menu-setting-row" style="margin-bottom:8px">
                <span style="font-size:13px;opacity:0.6;width:90px;flex-shrink:0">All-Time Points</span>
                <input type="number" id="seed-tce-input" value="${state.totalCoinsEarned}" min="0" class="menu-setting-input">
            </div>
            <div class="menu-setting-row" style="margin-bottom:8px">
                <span style="font-size:13px;opacity:0.6;width:90px;flex-shrink:0">Monthly Levels</span>
                <input type="number" id="seed-monthly-levels-input" value="${_monthlyLevels}" min="0" class="menu-setting-input">
            </div>
            <div class="menu-setting-row" style="margin-bottom:8px">
                <span style="font-size:13px;opacity:0.6;width:90px;flex-shrink:0">Monthly Points</span>
                <input type="number" id="seed-monthly-points-input" value="${_monthlyPoints}" min="0" class="menu-setting-input">
            </div>
            <button class="menu-setting-btn" id="seed-level-btn" style="background:${theme.accent};color:#000;width:100%;padding:10px 0;margin-top:4px">Set Progress</button>
            <div class="menu-setting-hint">Values map directly to leaderboard display</div>
        </div>
    `;

    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Reset</label>
            <button class="menu-setting-btn" id="reset-progress-btn" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3)">Reset All Progress</button>
            <button class="menu-setting-btn" id="reset-daily-btn" style="background:rgba(80,200,120,0.2);color:#66dd99;border:1px solid rgba(80,200,120,0.3);margin-top:8px">Reset Daily Puzzle</button>
        </div>
    `;

    html += `</div>`;

    // Contact Support
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Support</label>
            <button class="menu-setting-btn" id="contact-support-btn" style="background:${theme.accent};color:#000;width:100%;padding:10px 0;font-size:14px"><span style="font-size:24px;vertical-align:middle;margin-right:6px">✉️</span>Contact Support</button>
        </div>
    `;

    // Legal
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Legal</label>
            <button class="menu-setting-btn" id="menu-privacy-btn" style="background:rgba(255,255,255,0.08);color:${theme.text};border:1px solid rgba(255,255,255,0.12);width:100%;padding:10px 0;font-size:14px">🔒 Privacy Policy</button>
            <button class="menu-setting-btn" id="menu-terms-btn" style="background:rgba(255,255,255,0.08);color:${theme.text};border:1px solid rgba(255,255,255,0.12);width:100%;padding:10px 0;font-size:14px;margin-top:8px">📜 Terms of Service</button>
            <button class="menu-setting-btn" id="menu-cookie-btn" style="background:rgba(255,255,255,0.08);color:${theme.text};border:1px solid rgba(255,255,255,0.12);width:100%;padding:10px 0;font-size:14px;margin-top:8px">🍪 Cookie & Data Notice</button>
        </div>
    `;

    // App card (Install / Check for Updates / Uninstall)
    html += `<div class="menu-setting"><label class="menu-setting-label">App</label>`;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
        html += `<div style="text-align:center;opacity:0.4;font-size:14px;padding:4px 0">Installed \u2713</div>`;
    } else if (window._inAppBrowser) {
        html += `<div style="text-align:center;opacity:0.5;font-size:13px;padding:4px 0">Open in your browser to install</div>`;
    } else if (window._installPrompt) {
        html += `<button class="menu-setting-btn" id="install-app-btn" style="background:${theme.accent};color:#000;width:100%;padding:10px 0;font-size:14px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M12 3v12"/><polyline points="8 11 12 15 16 11"/><path d="M20 21H4"/></svg>Install App</button>`;
    } else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
        html += `<div style="font-size:14px;opacity:0.7;line-height:1.5">Tap Share (\u25A1\u2191) then &ldquo;Add to Home Screen&rdquo;</div>`;
    } else {
        html += `<div style="text-align:center;opacity:0.4;font-size:14px;padding:4px 0">Installed \u2713</div>`;
    }
    html += `<button class="menu-setting-btn" id="check-update-btn" style="background:rgba(80,200,80,0.2);color:#66dd88;border:1px solid rgba(80,200,80,0.35);width:100%;padding:10px 0;font-size:14px;margin-top:8px"><span style="font-size:24px;vertical-align:middle;margin-right:6px">✨</span>Check for Updates</button>`;
    html += `<button class="menu-setting-btn" id="uninstall-app-btn" style="background:rgba(255,50,50,0.15);color:#ff6666;border:1px solid rgba(255,50,50,0.25);width:100%;padding:10px 0;font-size:14px;margin-top:8px">Uninstall App</button>`;
    html += `</div>`;

    // Admin panel (visible only to admins)
    if (typeof isAdmin === "function" && isAdmin()) {
        html += `
            <div class="menu-setting">
                <label class="menu-setting-label">Administration</label>
                <button class="menu-setting-btn" id="admin-panel-btn" style="background:linear-gradient(135deg,#ff6b35,#d63384);color:#fff;width:100%;padding:10px 0;font-size:14px;border:none"><span style="font-size:20px;vertical-align:middle;margin-right:6px">🛡️</span>Admin Panel</button>
            </div>
        `;
    }

    html += `
        <div class="guide-legal-row">
            <a href="#" id="menu-legal-privacy">Privacy Policy</a>
            <a href="#" id="menu-legal-terms">Terms of Service</a>
            <a href="#" id="menu-legal-cookie">Cookie & Data</a>
        </div>
    `;

    html += `</div>`; // close menu-scroll
    overlay.innerHTML = html;

    // Wire up event handlers
    document.getElementById("menu-close-btn").onclick = () => {
        _menuSecretTaps = 0;
        state.showMenu = false;
        if (state.showHome) {
            renderMenu();
            renderHome();
        } else {
            renderAll();
        }
    };

    // Easter egg: tap stats card 8 times to reveal hidden options
    document.getElementById("menu-stats-card").onclick = () => {
        _menuSecretTaps++;
        if (_menuSecretTaps === 8) {
            const sec = document.getElementById("menu-secret-section");
            if (sec) sec.style.display = "block";
        }
    };

    // Auth button handlers — shared post-sign-in logic
    async function handlePostSignIn() {
        const newUid = getUser()?.id;
        const lastUid = localStorage.getItem("wordplay-last-uid");

        // Stash anonymous progress before sign-in overwrites it.
        // Only stash if there's no uid marker — meaning the current wordplay-save
        // belongs to an anonymous session, not a signed-in user's cloud data.
        const currentUid = localStorage.getItem("wordplay-uid");
        if (!currentUid) {
            saveInProgressState();
            const anonRaw = localStorage.getItem("wordplay-save");
            if (anonRaw) localStorage.setItem("wordplay-anon-save", anonRaw);
        }

        // Flush any in-game partial progress to localStorage before we read it
        saveInProgressState();
        // Write current state so localStorage is fully up-to-date
        try {
            const save = localStorage.getItem("wordplay-save");
            if (save) {
                const obj = JSON.parse(save);
                // Patch in-progress into the saved blob
                obj.ip = state.inProgress;
                localStorage.setItem("wordplay-save", JSON.stringify(obj));
            }
        } catch (e) { /* ignore */ }

        // Switching users: push anonymous progress to old user first, then clear
        if (lastUid && String(lastUid) !== String(newUid)) {
            const stashedJwt = localStorage.getItem("wordplay-last-jwt");
            const localRaw = localStorage.getItem("wordplay-save");
            if (stashedJwt && localRaw) {
                try {
                    await fetch("/api/progress", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: "Bearer " + stashedJwt },
                        body: JSON.stringify({ progress: JSON.parse(localRaw) }),
                    });
                } catch (e) { /* best effort */ }
            }
            localStorage.removeItem("wordplay-save");
            localStorage.removeItem("wordplay-last-jwt");

            // Reset in-memory state to defaults so stale data from the previous
            // user can't bleed through if syncPull fails or returns empty
            resetStateToDefaults();
        }
        if (newUid) localStorage.setItem("wordplay-last-uid", String(newUid));

        if (!getUser().displayName) renderDisplayNamePrompt();
        if (typeof syncPull === "function") {
            await syncPull();
            loadProgress();
            await recompute();
            if (typeof restoreLevelState === "function") restoreLevelState();
        }
        state.showMenu = false;
        state.showHome = true;
        const app = document.getElementById("app");
        app.innerHTML = "";
        renderHome();
        showToast("Signed in as " + (getUser()?.displayName || ""));
    }

    const googleBtn = document.getElementById("menu-google-btn");
    if (googleBtn) {
        googleBtn.onclick = async () => {
            try {
                googleBtn.disabled = true;
                googleBtn.textContent = "Signing in\u2026";
                await signInWithGoogle();
                await handlePostSignIn();
            } catch (e) {
                showToast("Sign-in failed", "#ff8888");
                renderMenu();
            }
        };
    }
    const msBtn = document.getElementById("menu-microsoft-btn");
    if (msBtn) {
        msBtn.onclick = async () => {
            try {
                msBtn.disabled = true;
                msBtn.textContent = "Signing in\u2026";
                await signInWithMicrosoft();
                await handlePostSignIn();
            } catch (e) {
                showToast("Sign-in failed", "#ff8888");
                renderMenu();
            }
        };
    }
    const signOutBtn = document.getElementById("menu-signout-btn");
    if (signOutBtn) {
        signOutBtn.onclick = () => {
            const authRaw = localStorage.getItem("wordplay-auth");
            if (authRaw) localStorage.setItem("wordplay-last-jwt", JSON.parse(authRaw).jwt);
            signOut();

            // Clear signed-in user's data and tracking
            localStorage.removeItem("wordplay-save");
            localStorage.removeItem("wordplay-uid");

            // Restore anonymous progress that was stashed before sign-in
            const anonSave = localStorage.getItem("wordplay-anon-save");
            if (anonSave) {
                // Sanitize: if the stashed save has a tier offset that doesn't
                // match the anonymous user's level, reset tier to let auto-detect
                // assign the correct one based on their actual highestLevel.
                try {
                    const anonObj = JSON.parse(anonSave);
                    if (anonObj.doff > 0 && anonObj.hl && anonObj.hl < anonObj.doff + 1) {
                        anonObj.dt = -1;
                        anonObj.doff = 0;
                        localStorage.setItem("wordplay-save", JSON.stringify(anonObj));
                    } else {
                        localStorage.setItem("wordplay-save", anonSave);
                    }
                } catch (e) {
                    localStorage.setItem("wordplay-save", anonSave);
                }
                localStorage.removeItem("wordplay-anon-save");
                loadProgress();
            } else {
                resetStateToDefaults();
            }

            state.showMenu = false;
            state.showHome = true;
            const app = document.getElementById("app");
            app.innerHTML = "";
            renderHome();
            showToast("Signed out");
        };
    }
    const deleteAccountBtn = document.getElementById("menu-delete-account-btn");
    if (deleteAccountBtn) {
        deleteAccountBtn.onclick = () => {
            const modal = document.createElement("div");
            modal.className = "modal-overlay";
            modal.style.display = "flex";
            modal.style.zIndex = "9999";
            modal.innerHTML = `
                <div class="modal-box" style="border:2px solid rgba(255,50,50,0.5);box-shadow:0 0 40px rgba(255,50,50,0.2)">
                    <div class="modal-emoji">\u26A0\uFE0F</div>
                    <h2 class="modal-title" style="color:#ff6666">Delete Account?</h2>
                    <p class="modal-subtitle" style="opacity:1;font-size:14px;color:#ffbbbb">This will permanently delete your account and all progress, including levels, coins, and scores. This cannot be undone.</p>
                    <div style="display:flex;gap:10px;margin-top:12px">
                        <button class="modal-next-btn" id="delete-cancel-btn"
                            style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;flex:1">
                            Cancel
                        </button>
                        <button class="modal-next-btn" id="delete-confirm-btn"
                            style="background:rgba(255,50,50,0.3);border:1px solid rgba(255,50,50,0.5);color:#ff6666;flex:1">
                            Delete
                        </button>
                    </div>
                </div>
            `;
            document.getElementById("app").appendChild(modal);
            document.getElementById("delete-cancel-btn").onclick = () => modal.remove();
            document.getElementById("delete-confirm-btn").onclick = async () => {
                try {
                    const res = await fetch("/api/auth/delete-account", {
                        method: "DELETE",
                        headers: getAuthHeaders(),
                    });
                    if (!res.ok) throw new Error("Delete failed");
                } catch (e) {
                    modal.remove();
                    showToast("Failed to delete account", "#ff8888");
                    return;
                }
                modal.remove();
                signOut();
                // Clear all wordplay localStorage keys
                Object.keys(localStorage).filter(k => k.startsWith("wordplay-")).forEach(k => localStorage.removeItem(k));
                resetStateToDefaults();
                state.showMenu = false;
                state.showHome = true;
                const app = document.getElementById("app");
                app.innerHTML = "";
                renderHome();
                showToast("Account deleted");
            };
        };
    }
    const profileEditEl = document.getElementById("menu-profile-edit");
    if (profileEditEl) {
        profileEditEl.onclick = () => renderProfileEditChooser();
    }
    const lbCheckbox = document.getElementById("menu-lb-checkbox");
    if (lbCheckbox) {
        lbCheckbox.onchange = async () => {
            try {
                await setLeaderboardVisibility(lbCheckbox.checked);
                showToast(lbCheckbox.checked ? "Shown on leaderboard" : "Hidden from leaderboard");
            } catch (e) {
                lbCheckbox.checked = !lbCheckbox.checked;
                showToast("Failed to update", "#ff8888");
            }
        };
    }

    document.getElementById("sound-toggle-btn").onclick = () => {
        state.soundEnabled = !state.soundEnabled;
        saveProgress();
        renderMenu();
    };

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

    const layoutSelect = document.getElementById("menu-layout-select");
    if (layoutSelect) {
        layoutSelect.onchange = () => {
            state.layoutPref = layoutSelect.value;
            saveProgress();
            showToast("Layout set to " + state.layoutPref);
        };
    }

    document.getElementById("menu-map-btn").onclick = () => {
        state.showMenu = false;
        state.showMap = true;
        _mapAutoExpanded = false;
        _mapHasScrolled = false;
        renderMenu();
        renderMap();
    };

    document.getElementById("menu-prev").onclick = async () => {
        if (applyPendingUpdate()) return;
        if (state.currentLevel <= 1) return;
        saveInProgressState();
        state.currentLevel--;
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        state.standaloneFound = false;
        state.shuffleKey = 0;
        await recompute();
        restoreLevelState();
        saveProgress();
        renderMenu();
    };
    document.getElementById("menu-next").onclick = async () => {
        if (applyPendingUpdate()) return;
        if (state.currentLevel >= state.highestLevel) return;
        saveInProgressState();
        state.currentLevel++;
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        state.standaloneFound = false;
        state.shuffleKey = 0;
        await recompute();
        restoreLevelState();
        saveProgress();
        renderMenu();
    };
    document.getElementById("menu-restart").onclick = async () => {
        if (applyPendingUpdate()) return;
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        state.inProgress[state.currentLevel] = { fw: [], bf: [], rc: [], sf: false };
        state.shuffleKey = 0;
        await recompute();
        saveProgress();
        state.showMenu = false;
        state.showHome = false;
        const app = document.getElementById("app");
        app.innerHTML = "";
        renderAll();
        showToast("Level restarted");
    };
    
    document.getElementById("check-update-btn").onclick = function() {
        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<span class="update-spinner"></span> Checking\u2026';
        btn.style.opacity = '0.7';
        if (window._swReg) {
            window._swReg.update().then(() => {
                setTimeout(() => window.location.reload(), 2000);
            }).catch(() => {
                setTimeout(() => window.location.reload(), 2000);
            });
        } else {
            setTimeout(() => window.location.reload(), 2000);
        }
    };

    const installBtn = document.getElementById("install-app-btn");
    if (installBtn) {
        installBtn.onclick = () => {
            if (window._installPrompt) {
                window._installPrompt.prompt();
                window._installPrompt.userChoice.then(result => {
                    if (result.outcome === 'accepted') {
                        showToast("App installed!", theme.accent);
                    }
                    window._installPrompt = null;
                });
            }
        };
    }

    document.getElementById("contact-support-btn").onclick = () => {
        state.showMenu = false;
        state.showContact = true;
        renderMenu();
        renderContact();
    };

    document.getElementById("menu-privacy-btn").onclick = () => {
        state.showMenu = false;
        state.showPrivacy = true;
        renderMenu();
        renderPrivacy();
    };
    document.getElementById("menu-terms-btn").onclick = () => {
        state.showMenu = false;
        state.showTerms = true;
        renderMenu();
        renderTerms();
    };
    document.getElementById("menu-cookie-btn").onclick = () => {
        state.showMenu = false;
        state.showCookiePolicy = true;
        renderMenu();
        renderCookiePolicy();
    };

    // Footer legal links (same actions as the buttons above)
    document.getElementById("menu-legal-privacy").onclick = (e) => { e.preventDefault(); document.getElementById("menu-privacy-btn").click(); };
    document.getElementById("menu-legal-terms").onclick = (e) => { e.preventDefault(); document.getElementById("menu-terms-btn").click(); };
    document.getElementById("menu-legal-cookie").onclick = (e) => { e.preventDefault(); document.getElementById("menu-cookie-btn").click(); };

    document.getElementById("uninstall-app-btn").onclick = () => {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";
        modal.style.display = "flex";
        modal.style.zIndex = "9999";
        modal.innerHTML = `
            <div class="modal-box" style="border:2px solid rgba(255,50,50,0.5);box-shadow:0 0 40px rgba(255,50,50,0.2)">
                <div class="modal-emoji">\u26A0\uFE0F</div>
                <h2 class="modal-title" style="color:#ff6666">Uninstall App?</h2>
                <p class="modal-subtitle" style="opacity:1;font-size:14px;color:#ffbbbb">This will clear all local app data including cached levels, service workers, and saved preferences.</p>
                <div style="display:flex;gap:10px;margin-top:12px">
                    <button class="modal-next-btn" id="uninstall-cancel-btn"
                        style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;flex:1">
                        Cancel
                    </button>
                    <button class="modal-next-btn" id="uninstall-confirm-btn"
                        style="background:rgba(255,50,50,0.3);border:1px solid rgba(255,50,50,0.5);color:#ff6666;flex:1">
                        Uninstall
                    </button>
                </div>
            </div>
        `;
        document.getElementById("app").appendChild(modal);
        document.getElementById("uninstall-cancel-btn").onclick = () => modal.remove();
        document.getElementById("uninstall-confirm-btn").onclick = async () => {
            try {
                // Unregister all service workers
                if ("serviceWorker" in navigator) {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(regs.map(r => r.unregister()));
                }
                // Clear all caches
                if ("caches" in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(k => caches.delete(k)));
                }
            } catch (e) { /* best effort */ }
            // Clear all wordplay localStorage and sessionStorage
            Object.keys(localStorage).filter(k => k.startsWith("wordplay-")).forEach(k => localStorage.removeItem(k));
            Object.keys(sessionStorage).filter(k => k.startsWith("wordplay-")).forEach(k => sessionStorage.removeItem(k));

            // Detect platform for removal instructions
            const ua = navigator.userAgent;
            let instructions;
            if (/iPad|iPhone|iPod/.test(ua)) {
                instructions = "Long-press the app icon on your home screen, then tap <b>Remove App</b>.";
            } else if (/Android/.test(ua)) {
                instructions = "Open your browser menu \u2192 <b>App info</b> \u2192 <b>Uninstall</b>.";
            } else {
                instructions = "The app data has been cleared. You can remove the shortcut from your desktop.";
            }

            modal.innerHTML = `
                <div class="modal-box" style="border:2px solid rgba(255,50,50,0.5);box-shadow:0 0 40px rgba(255,50,50,0.2)">
                    <div class="modal-emoji">\u2705</div>
                    <h2 class="modal-title" style="color:#ff6666">App Data Cleared</h2>
                    <p class="modal-subtitle" style="opacity:1;font-size:14px;color:#ffbbbb">${instructions}</p>
                    <button class="modal-next-btn" id="uninstall-done-btn"
                        style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;width:100%;margin-top:12px">
                        OK
                    </button>
                </div>
            `;
            document.getElementById("uninstall-done-btn").onclick = () => {
                modal.remove();
                // Reset state and go home
                signOut();
                resetStateToDefaults();
                state.showMenu = false;
                state.showHome = true;
                const app = document.getElementById("app");
                app.innerHTML = "";
                renderHome();
            };
        };
    };

    const adminPanelBtn = document.getElementById("admin-panel-btn");
    if (adminPanelBtn) {
        adminPanelBtn.onclick = () => {
            state.showMenu = false;
            state.showAdmin = true;
            renderMenu();
            renderAdmin();
        };
    }

    document.getElementById("seed-state-btn").onclick = () => {
        const coins = parseInt(document.getElementById("seed-coins-input").value);
        const hints = parseInt(document.getElementById("seed-hints-input").value);
        const targets = parseInt(document.getElementById("seed-targets-input").value);
        const rockets = parseInt(document.getElementById("seed-rockets-input").value);
        if (!isNaN(coins) && coins >= 0) state.coins = coins;
        if (!isNaN(hints) && hints >= 0) state.freeHints = hints;
        if (!isNaN(targets) && targets >= 0) state.freeTargets = targets;
        if (!isNaN(rockets) && rockets >= 0) state.freeRockets = rockets;
        saveProgress();
        renderMenu();
        if (state.showHome) renderHome();
        showToast("Game state updated");
    };

    document.getElementById("seed-level-btn").onclick = async () => {
        const input = document.getElementById("seed-level-input");
        const val = parseInt(input.value);
        const coins = parseInt(document.getElementById("seed-coins-input").value);
        const hints = parseInt(document.getElementById("seed-hints-input").value);
        const targets = parseInt(document.getElementById("seed-targets-input").value);
        const rockets = parseInt(document.getElementById("seed-rockets-input").value);
        const tce = parseInt(document.getElementById("seed-tce-input").value);
        const monthlyLevels = parseInt(document.getElementById("seed-monthly-levels-input").value);
        const monthlyPoints = parseInt(document.getElementById("seed-monthly-points-input").value);
        if (val >= 1 && val <= maxLv && !isNaN(val)) {
            state.highestLevel = val;
            state.currentLevel = val;
            state.foundWords = [];
            state.bonusFound = [];
            state.revealedCells = [];
            state.shuffleKey = 0;
            if (!isNaN(coins) && coins >= 0) state.coins = coins;
            if (!isNaN(hints) && hints >= 0) state.freeHints = hints;
            if (!isNaN(targets) && targets >= 0) state.freeTargets = targets;
            if (!isNaN(rockets) && rockets >= 0) state.freeRockets = rockets;
            if (!isNaN(tce) && tce >= 0) state.totalCoinsEarned = tce;
            // Clear any in-progress entries at or above the new level
            for (const key of Object.keys(state.inProgress)) {
                if (parseInt(key) >= val) delete state.inProgress[key];
            }
            saveProgress();
            // Push immediately so server gets the exact values
            if (isSignedIn()) {
                clearTimeout(_syncPushTimer);
                try {
                    const raw = localStorage.getItem("wordplay-save");
                    if (raw) {
                        const payload = { progress: JSON.parse(raw) };
                        // Convert display values to server baselines:
                        // MonthlyStart = HighestLevel - monthlyLevels displayed
                        // MonthlyCoinsStart = TotalCoinsEarned - monthlyPoints displayed
                        if (!isNaN(monthlyLevels)) payload.monthlyStart = state.highestLevel - monthlyLevels;
                        if (!isNaN(monthlyPoints)) payload.monthlyCoinsStart = state.totalCoinsEarned - monthlyPoints;
                        await fetch("/api/progress", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                            body: JSON.stringify(payload),
                        });
                    }
                } catch (e) { /* best effort */ }
            }
            // Update local monthly baselines so settings re-renders correctly
            if (!isNaN(monthlyLevels)) localStorage.setItem("wordplay-monthly-start", String(state.highestLevel - monthlyLevels));
            if (!isNaN(monthlyPoints)) localStorage.setItem("wordplay-monthly-coins-start", String(state.totalCoinsEarned - monthlyPoints));
            _menuSecretTaps = 0;
            state.showMenu = false;
            state.showHome = true;
            renderMenu();
            renderHome();
            showToast("Progress updated");
        } else {
            showToast("Invalid level number", "#ff8888");
        }
    };

    document.getElementById("reset-daily-btn").onclick = () => {
        if (!confirm("Reset today's Daily Puzzle?")) return;
        state.dailyPuzzle = null;
        saveProgress();
        state.showMenu = false;
        state.showHome = true;
        renderMenu();
        renderHome();
    };

    document.getElementById("reset-progress-btn").onclick = () => {
        if (!confirm("Reset all progress? This cannot be undone.")) return;
        localStorage.removeItem("wordplay-save");
        resetStateToDefaults();
        state.soundEnabled = true;
        state.showMenu = false;
        state.showHome = true;
        saveProgress();
        recompute().then(() => {
            renderMenu();
            renderHome();
        });
    };
}

// ---- CONTACT FORM ----
function renderContact() {
    let overlay = document.getElementById("contact-overlay");
    if (!state.showContact) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "contact-overlay";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "menu-overlay";
    overlay.style.display = "flex";

    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="contact-close-btn" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${theme.accent}">✉️ Contact Support</h2>
        </div>
        <div class="menu-scroll">
            <div class="menu-setting">
                <label class="menu-setting-label">Name</label>
                <input type="text" id="contact-name" class="menu-setting-input" placeholder="Your name" style="width:100%">
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Email</label>
                <input type="email" id="contact-email" class="menu-setting-input" placeholder="Your email address" style="width:100%">
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Subject</label>
                <input type="text" id="contact-subject" class="menu-setting-input" placeholder="What is this about?" style="width:100%">
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Message</label>
                <textarea id="contact-message" class="contact-textarea" placeholder="Describe your issue or question..."></textarea>
            </div>
            <div class="contact-hp" aria-hidden="true">
                <label>Leave this empty</label>
                <input type="text" id="contact-website" name="website" autocomplete="off" tabindex="-1">
            </div>
            <input type="hidden" id="contact-token" value="">
            <input type="hidden" id="contact-ts" value="">
            <div class="menu-setting" style="border:none;background:none;padding-top:0">
                <button class="menu-setting-btn" id="contact-send-btn" style="background:${theme.accent};color:#000;width:100%;padding:12px 0;font-size:15px">Send Message</button>
                <div id="contact-status" style="text-align:center;margin-top:10px;font-size:13px"></div>
            </div>
        </div>
    `;

    // Anti-spam: generate JS token and record open timestamp
    const contactOpenTime = Date.now();
    document.getElementById("contact-ts").value = String(contactOpenTime);
    const tokenBase = "wp" + contactOpenTime + navigator.userAgent.length;
    let hash = 0;
    for (let i = 0; i < tokenBase.length; i++) {
        hash = ((hash << 5) - hash + tokenBase.charCodeAt(i)) | 0;
    }
    document.getElementById("contact-token").value = "wp-" + Math.abs(hash).toString(36) + "-" + contactOpenTime.toString(36);

    // Pre-fill email if signed in
    if (typeof isSignedIn === "function" && isSignedIn()) {
        const user = getUser();
        if (user?.email) document.getElementById("contact-email").value = user.email;
    }

    document.getElementById("contact-close-btn").onclick = () => {
        state.showContact = false;
        renderContact();
    };

    document.getElementById("contact-send-btn").onclick = async () => {
        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const subject = document.getElementById("contact-subject").value.trim();
        const message = document.getElementById("contact-message").value.trim();
        const statusEl = document.getElementById("contact-status");
        const btn = document.getElementById("contact-send-btn");

        if (!name || !email || !subject || !message) {
            statusEl.style.color = "#ff8888";
            statusEl.textContent = "Please fill in all fields.";
            return;
        }

        btn.disabled = true;
        btn.textContent = "Sending\u2026";
        btn.style.opacity = "0.7";
        statusEl.textContent = "";

        try {
            const hp = document.getElementById("contact-website").value;
            const token = document.getElementById("contact-token").value;
            const ts = document.getElementById("contact-ts").value;
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message, website: hp, token, ts })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                statusEl.style.color = "#66dd99";
                statusEl.textContent = "Message sent! We'll get back to you soon.";
                btn.textContent = "Sent \u2713";
                // Clear form after brief delay
                setTimeout(() => {
                    state.showContact = false;
                    renderContact();
                    showToast("Message sent!", theme.accent);
                }, 1500);
            } else {
                statusEl.style.color = "#ff8888";
                statusEl.textContent = data.error || "Failed to send. Please try again.";
                btn.disabled = false;
                btn.textContent = "Send Message";
                btn.style.opacity = "1";
            }
        } catch (err) {
            statusEl.style.color = "#ff8888";
            statusEl.textContent = "Network error. Please try again.";
            btn.disabled = false;
            btn.textContent = "Send Message";
            btn.style.opacity = "1";
        }
    };
}

// ---- LEGAL OVERLAYS ----
function renderLegalOverlay(id, flag, emoji, title, bodyHtml) {
    let overlay = document.getElementById(id);
    if (!state[flag]) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = id;
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "guide-overlay";
    overlay.style.display = "flex";
    overlay.innerHTML = `
        <div class="guide-header">
            <button class="back-arrow-btn" id="${id}-close-btn" title="Back" style="position:absolute;left:16px;top:20px;z-index:10">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="guide-icon">${emoji}</div>
            <h2 class="guide-title" style="color:${theme.accent}">${title}</h2>
            <div class="guide-subtitle">wordplay.illustrate.net</div>
        </div>
        <div class="menu-scroll" style="padding:0 20px 40px;font-size:14px;line-height:1.7;opacity:0.85">
            ${bodyHtml}
        </div>
    `;
    document.getElementById(`${id}-close-btn`).onclick = () => {
        state[flag] = false;
        renderLegalOverlay(id, flag, emoji, title, bodyHtml);
    };
    // Legal page live links (e.g. Contact Support)
    overlay.addEventListener("click", (e) => {
        const link = e.target.closest(".legal-link");
        if (!link) return;
        e.preventDefault();
        const action = link.dataset.action;
        state[flag] = false;
        renderLegalOverlay(id, flag, emoji, title, bodyHtml);
        if (action === "contact") { state.showContact = true; renderContact(); }
        else if (action === "settings") { state.showMenu = true; renderMenu(); }
    });
}

function renderPrivacy() {
    renderLegalOverlay("privacy-overlay", "showPrivacy", "🔒", "Privacy Policy", `
        <p style="opacity:0.5;font-size:13px">Effective March 2026</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Who We Are</h3>
        <p>WordPlay is a free word puzzle game by <b>Illustrate</b>, available at <b>wordplay.illustrate.net</b>.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">What We Collect</h3>
        <ul style="padding-left:20px">
            <li><b>Account info</b> — Email address, display name, and avatar (provided when you sign in with Google or Microsoft).</li>
            <li><b>Game data</b> — Level progress, coins earned, scores, and leaderboard entries stored on our server.</li>
            <li><b>Local data</b> — Game state, preferences, and auth tokens saved in your browser's localStorage.</li>
        </ul>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">How We Use Your Data</h3>
        <p>Your data is used solely to operate the game: saving progress, syncing across devices, and displaying leaderboards. We do not profile you or make automated decisions based on your data.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Authentication Providers</h3>
        <p>We use <b>Google Sign-In</b> and <b>Microsoft (MSAL)</b> for authentication. We receive only your email and basic profile information — we never see your password.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">No Tracking or Analytics</h3>
        <p>We do not use any third-party analytics, advertising networks, or tracking pixels. No data is sold or shared with third parties.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Data Sharing</h3>
        <p>We do not sell, rent, or share your personal data with anyone. Your information stays with WordPlay.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Data Retention & Deletion</h3>
        <p>We keep your data as long as your account exists. You can <b>delete your account</b> at any time in <a href="#" class="legal-link guide-link" data-action="settings">Settings</a> — this permanently removes all your server-side data (profile, progress, scores). Local data can be cleared by uninstalling the app or clearing your browser data.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Your Rights (GDPR)</h3>
        <p>If you are in the EU/EEA, you have the right to access, correct, delete, or export your personal data. You can exercise these rights via the in-app <a href="#" class="legal-link guide-link" data-action="contact">Contact Support</a> form or by deleting your account in <a href="#" class="legal-link guide-link" data-action="settings">Settings</a>.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Children</h3>
        <p>WordPlay is not directed at children under 13. We do not knowingly collect data from children under 13.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Contact</h3>
        <p>Questions about your privacy? Use the <a href="#" class="legal-link guide-link" data-action="contact">Contact Support</a> form, or reach us through the <a href="#" class="legal-link guide-link" data-action="settings">Settings</a> menu.</p>
    `);
}

function renderTerms() {
    renderLegalOverlay("terms-overlay", "showTerms", "📜", "Terms of Service", `
        <p style="opacity:0.5;font-size:13px">Effective March 2026</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Acceptance</h3>
        <p>By using WordPlay you agree to these terms. If you do not agree, please stop using the app.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Service Description</h3>
        <p>WordPlay is a free word puzzle game provided by Illustrate. The game is offered "as is" with no guarantees of availability, uptime, or fitness for any particular purpose.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">User Accounts</h3>
        <p>Sign-in is optional. You may sign in with multiple providers (Google, Microsoft) and switch between accounts. You are responsible for keeping your sign-in credentials secure.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Acceptable Use</h3>
        <p>You agree not to:</p>
        <ul style="padding-left:20px">
            <li>Cheat, exploit bugs, or manipulate game mechanics.</li>
            <li>Scrape, crawl, or use automated tools to access the app.</li>
            <li>Reverse engineer, decompile, or disassemble any part of the app.</li>
            <li>Impersonate others or submit false information.</li>
            <li>Use the app for any unlawful purpose.</li>
        </ul>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Intellectual Property</h3>
        <p>All game content — including puzzles, code, design, and artwork — is owned by Illustrate. You may not copy, modify, or redistribute any part of the game without permission.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Termination</h3>
        <p>We may suspend or terminate accounts that violate these terms. You can delete your account at any time through <a href="#" class="legal-link guide-link" data-action="settings">Settings</a>.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Limitation of Liability</h3>
        <p>To the fullest extent permitted by law, Illustrate is not liable for any indirect, incidental, or consequential damages arising from your use of WordPlay. The game is provided "as is" without warranties of any kind.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Changes to Terms</h3>
        <p>We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the updated terms.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Governing Law</h3>
        <p>These terms are governed by the laws of the United States. Any disputes will be resolved in accordance with applicable U.S. law.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Contact</h3>
        <p>Questions about these terms? Use the <a href="#" class="legal-link guide-link" data-action="contact">Contact Support</a> form.</p>
    `);
}

function renderCookiePolicy() {
    renderLegalOverlay("cookie-overlay", "showCookiePolicy", "🍪", "Cookie & Data Notice", `
        <p style="opacity:0.5;font-size:13px">Effective March 2026</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">No Cookies</h3>
        <p>WordPlay does <b>not</b> use HTTP cookies. We rely on <b>localStorage</b> and service worker caches instead.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">What We Store Locally</h3>
        <ul style="padding-left:20px">
            <li><b>Game saves</b> — Your level progress, coins, hints, and game state.</li>
            <li><b>Preferences</b> — Sound settings and display options.</li>
            <li><b>Auth tokens</b> — Session tokens for signed-in users (stored in localStorage).</li>
        </ul>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Service Worker</h3>
        <p>WordPlay uses a service worker to cache app assets and level data for offline play. This lets you play without an internet connection after the initial load.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Third-Party Scripts</h3>
        <p>We load <b>Google Sign-In</b> and <b>Microsoft MSAL</b> libraries for authentication. These scripts only run when you use the sign-in buttons and do not set tracking cookies.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Consent</h3>
        <p>By using WordPlay, you consent to the use of localStorage for game functionality. This data stays on your device and is essential for the game to work.</p>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Your Rights</h3>
        <p>EU/EEA users have GDPR rights including access, deletion, and data portability. You can:</p>
        <ul style="padding-left:20px">
            <li>Use <a href="#" class="legal-link guide-link" data-action="contact">Contact Support</a> to request your data or ask questions.</li>
            <li>Use <b>Delete Account</b> in <a href="#" class="legal-link guide-link" data-action="settings">Settings</a> to remove all server-side data.</li>
            <li>Use <b>Uninstall App</b> in <a href="#" class="legal-link guide-link" data-action="settings">Settings</a> to clear all local data.</li>
            <li>Clear your browser's localStorage manually at any time.</li>
        </ul>

        <h3 style="color:${theme.accent};margin:18px 0 8px;font-size:16px">Contact</h3>
        <p>Questions about data storage? Use the <a href="#" class="legal-link guide-link" data-action="contact">Contact Support</a> form.</p>
    `);
}

// ---- ADMIN PANEL ----
let _adminUsers = [];
let _adminSearch = "";
let _adminSelectedUser = null;
let _adminRabbits = [];
let _adminView = "users"; // "users" | "user-detail" | "rabbits" | "flagged-words"
let _adminPage = 1;
let _adminTotal = 0;
let _adminHasMore = true;
let _adminLoading = false;
let _adminSearchTimer = null;
let _adminObserver = null;

function renderAdmin() {
    let overlay = document.getElementById("admin-overlay");
    if (!state.showAdmin) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "admin-overlay";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "menu-overlay";
    overlay.style.display = "flex";

    if (_adminView === "user-detail" && _adminSelectedUser) {
        renderAdminUserDetail(overlay);
        return;
    }
    if (_adminView === "rabbits") {
        renderAdminRabbits(overlay);
        return;
    }
    if (_adminView === "flagged-words") {
        renderAdminFlaggedWords(overlay);
        return;
    }

    const accent = theme.accent;
    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="admin-close-btn" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${accent}">Admin Panel</h2>
        </div>
        <div class="menu-scroll">
            <div class="admin-toolbar" style="flex-wrap:wrap;gap:8px">
                <div style="display:flex;width:100%;gap:8px;align-items:center">
                    <input type="text" id="admin-search" class="menu-setting-input" placeholder="Search users..." value="${escapeHtml(_adminSearch)}" style="flex:1;font-size:15px;padding:8px 12px">
                    <button class="menu-setting-btn" id="admin-search-clear" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);padding:8px 12px;border:1px solid rgba(255,255,255,0.15);font-size:14px;display:${_adminSearch ? 'block' : 'none'}">✕</button>
                </div>
                <div style="display:flex;width:100%;gap:8px;justify-content:center">
                    <button class="menu-setting-btn" id="admin-create-bot-btn" style="background:${accent};color:#000;white-space:nowrap;padding:8px 14px;font-size:14px">+ Bot</button>
                    <button class="menu-setting-btn" id="admin-rabbits-btn" style="background:rgba(255,255,255,0.15);color:#fff;white-space:nowrap;padding:8px 14px;border:1px solid rgba(255,255,255,0.3);font-size:14px">Rabbits</button>
                    <button class="menu-setting-btn" id="admin-flagged-btn" style="background:rgba(255,80,80,0.25);color:#ff6b6b;white-space:nowrap;padding:8px 14px;border:1px solid rgba(255,80,80,0.4);font-size:14px">🚩 Flagged</button>
                </div>
            </div>
            <div id="admin-user-list" style="padding:0 4px">
                <div style="text-align:center;padding:30px;opacity:0.5">Loading...</div>
            </div>
        </div>
    `;

    document.getElementById("admin-close-btn").onclick = () => {
        state.showAdmin = false;
        _adminView = "users";
        renderAdmin();
        state.showMenu = true;
        renderMenu();
    };

    document.getElementById("admin-search").oninput = (e) => {
        _adminSearch = e.target.value;
        const clearBtn = document.getElementById("admin-search-clear");
        if (clearBtn) clearBtn.style.display = _adminSearch ? 'block' : 'none';
        clearTimeout(_adminSearchTimer);
        _adminSearchTimer = setTimeout(() => {
            _adminPage = 1;
            _adminUsers = [];
            _adminHasMore = true;
            loadAdminUsers();
        }, 250);
    };

    document.getElementById("admin-search-clear").onclick = () => {
        _adminSearch = "";
        document.getElementById("admin-search").value = "";
        document.getElementById("admin-search-clear").style.display = "none";
        _adminPage = 1;
        _adminUsers = [];
        _adminHasMore = true;
        loadAdminUsers();
    };

    document.getElementById("admin-create-bot-btn").onclick = () => {
        const name = prompt("Bot display name (3-20 chars):");
        if (!name || name.trim().length < 3) return;
        fetch("/api/admin/bots", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ displayName: name.trim() }),
        }).then(r => {
            if (!r.ok) throw new Error("Failed");
            return r.json();
        }).then(bot => {
            showToast("Bot created");
            _adminSelectedUser = {
                id: bot.id ?? bot.Id,
                displayName: bot.displayName ?? bot.DisplayName ?? name.trim(),
                role: bot.role ?? bot.Role ?? "bot",
                avatarData: null,
                highestLevel: 0,
                totalCoinsEarned: 0,
                monthlyGain: 0,
                showOnLeaderboard: true,
            };
            _adminView = "user-detail";
            renderAdmin();
            _adminPage = 1; _adminUsers = []; _adminHasMore = true;
            loadAdminUsers();
        }).catch(() => showToast("Failed to create bot", "#ff8888"));
    };

    document.getElementById("admin-rabbits-btn").onclick = () => {
        _adminView = "rabbits";
        renderAdmin();
    };

    document.getElementById("admin-flagged-btn").onclick = () => {
        _adminView = "flagged-words";
        renderAdmin();
    };

    _adminPage = 1; _adminUsers = []; _adminHasMore = true;
    loadAdminUsers();
}

function loadAdminUsers(opts) {
    const append = opts && opts.append;
    _adminLoading = true;
    if (!append) renderAdminUserList();

    const url = `/api/admin/users?page=${_adminPage}&pageSize=30&search=${encodeURIComponent(_adminSearch)}`;
    fetch(url, { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(data => {
            if (append) {
                _adminUsers = _adminUsers.concat(data.users);
            } else {
                _adminUsers = data.users;
            }
            _adminTotal = data.total;
            _adminHasMore = _adminUsers.length < data.total;
            _adminLoading = false;
            renderAdminUserList();
        })
        .catch(() => {
            _adminLoading = false;
            const list = document.getElementById("admin-user-list");
            if (list) list.innerHTML = '<div style="text-align:center;padding:30px;opacity:0.5">Failed to load users</div>';
        });
}

function renderAdminUserList() {
    const list = document.getElementById("admin-user-list");
    if (!list) return;

    if (_adminObserver) { _adminObserver.disconnect(); _adminObserver = null; }

    if (_adminUsers.length === 0 && !_adminLoading) {
        list.innerHTML = '<div style="text-align:center;padding:30px;opacity:0.5">No users found</div>';
        return;
    }

    const roleBadge = (role, paceMode) => {
        if (role === "admin") return '<span class="admin-badge admin-badge-admin">admin</span>';
        if (role === "bot") {
            if (paceMode === "leading") return '<span class="admin-badge admin-badge-admin">\u{1F407} rabbit</span>';
            if (paceMode === "trailing") return '<span class="admin-badge admin-badge-bot">\u{1F422} turtle</span>';
            return '<span class="admin-badge admin-badge-bot">bot</span>';
        }
        return '';
    };

    const countLabel = _adminTotal > 0
        ? `<div style="text-align:center;padding:4px 0 8px;opacity:0.45;font-size:12px">${_adminUsers.length} of ${_adminTotal} users</div>`
        : '';

    const rows = _adminUsers.map(u => `
        <div class="admin-user-row" data-uid="${u.id}">
            <div class="admin-user-info">
                <div class="admin-user-name" style="display:flex;align-items:center;gap:6px">${renderAvatar(u.avatarData, u.displayName, 24)} ${escapeHtml(u.displayName || "\u2014")} ${roleBadge(u.role, u.paceMode)}</div>
                <div class="admin-user-meta">Lv ${u.highestLevel.toLocaleString()} \u00b7 ${u.totalCoinsEarned.toLocaleString()} pts \u00b7 +${u.monthlyGain} this mo</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.4;flex-shrink:0"><path d="M9 18l6-6-6-6"/></svg>
        </div>
    `).join("");

    const sentinel = _adminHasMore
        ? `<div id="admin-load-more" style="text-align:center;padding:20px;opacity:0.5">${_adminLoading ? 'Loading...' : ''}</div>`
        : '';

    list.innerHTML = countLabel + rows + sentinel;

    list.querySelectorAll(".admin-user-row").forEach(row => {
        row.onclick = () => {
            const uid = parseInt(row.dataset.uid);
            _adminSelectedUser = _adminUsers.find(u => u.id === uid);
            _adminView = "user-detail";
            renderAdmin();
        };
    });

    const sentinelEl = document.getElementById("admin-load-more");
    if (sentinelEl) {
        _adminObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !_adminLoading && _adminHasMore) {
                _adminPage++;
                loadAdminUsers({ append: true });
            }
        });
        _adminObserver.observe(sentinelEl);
    }
}

function renderAdminUserDetail(overlay) {
    const u = _adminSelectedUser;
    const accent = theme.accent;

    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="admin-detail-back" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${accent}">${escapeHtml(u.displayName || "User #" + u.id)}</h2>
        </div>
        <div class="menu-scroll">
            <div class="menu-setting" style="display:flex;align-items:center;gap:14px;padding:12px">
                <div id="admin-profile-avatar" style="position:relative;cursor:pointer;flex-shrink:0" title="Change avatar">
                    ${renderAvatar(u.avatarData, u.displayName, 60)}
                    <div style="position:absolute;bottom:-2px;right:-2px;width:22px;height:22px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </div>
                </div>
                <div style="flex:1;min-width:0;display:flex;gap:6px;align-items:center">
                    <input type="text" id="admin-profile-name" class="menu-setting-input" value="${escapeHtml(u.displayName || "")}" maxlength="20" placeholder="Display name" style="flex:1;min-width:0;padding:8px 10px;font-size:15px">
                    <button class="menu-setting-btn" id="admin-save-name" style="background:${accent};color:#000;padding:8px 14px;font-size:13px;font-weight:700;white-space:nowrap;flex-shrink:0">Save</button>
                </div>
            </div>
            <div class="menu-setting">
                <div class="admin-detail-field">
                    <label>Role</label>
                    <select id="admin-role-select">
                        <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
                        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
                        <option value="bot" ${u.role === "bot" ? "selected" : ""}>Bot</option>
                    </select>
                </div>
                <div class="admin-detail-field">
                    <label>Leaderboard Visibility</label>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
                        <input type="checkbox" id="admin-vis-cb" ${u.showOnLeaderboard ? "checked" : ""} style="width:18px;height:18px;accent-color:${accent}">
                        Show on leaderboard
                    </label>
                </div>
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Leaderboard Scores${u.difficultyTier >= 0 ? ' <span style="opacity:0.5;font-size:12px;font-weight:400">' + (["Easy","Medium","Hard","Expert","Master"][u.difficultyTier] || "Tier " + u.difficultyTier) + (u.difficultyOffset ? " (offset " + u.difficultyOffset.toLocaleString() + ")" : "") + '</span>' : ''}</label>
                <div class="admin-detail-field">
                    <label>All-Time Levels</label>
                    <input type="number" id="admin-hl" value="${u.highestLevel}" min="0">
                </div>
                <div class="admin-detail-field">
                    <label>All-Time Points</label>
                    <input type="number" id="admin-tce" value="${u.totalCoinsEarned}" min="0">
                </div>
                <div class="admin-detail-field">
                    <label>Monthly Levels</label>
                    <input type="number" id="admin-ml" value="${Math.max(0, u.highestLevel - (u.monthlyStart || 0))}" min="0">
                </div>
                <div class="admin-detail-field">
                    <label>Monthly Points</label>
                    <input type="number" id="admin-mp" value="${Math.max(0, u.totalCoinsEarned - (u.monthlyCoinsStart || 0))}" min="0">
                </div>
                <button class="menu-setting-btn" id="admin-save-progress" style="background:${accent};color:#000;width:100%;padding:10px 0;margin:8px 12px">Save Scores</button>
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Rabbit Assignment</label>
                <div id="admin-rabbit-section" style="padding:4px 12px;font-size:13px;opacity:0.5">Loading...</div>
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Recent History</label>
                <div id="admin-snapshot-section" style="padding:4px 12px;font-size:14px;opacity:0.5">Loading...</div>
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Danger Zone</label>
                <button class="menu-setting-btn" id="admin-delete-user" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3);width:100%;padding:10px 0;margin:0 12px">Delete User</button>
            </div>
        </div>
    `;

    document.getElementById("admin-detail-back").onclick = () => {
        _adminView = "users";
        _adminSelectedUser = null;
        renderAdmin();
    };

    document.getElementById("admin-profile-avatar").onclick = () => {
        renderAvatarEditor({
            targetUser: { displayName: u.displayName, avatarData: u.avatarData },
            onSave: async (avatarData) => {
                const res = await fetch("/api/admin/users/" + u.id + "/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                    body: JSON.stringify({ avatarData: avatarData }),
                });
                if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed"); }
                const data = await res.json();
                u.avatarData = data.avatarData ?? data.AvatarData ?? avatarData;
            },
            onClose: () => { renderAdmin(); },
        });
    };

    document.getElementById("admin-save-name").onclick = async () => {
        const name = document.getElementById("admin-profile-name").value.trim();
        if (name.length < 3 || name.length > 20) { showToast("Name must be 3-20 characters", "#ff8888"); return; }
        try {
            const res = await fetch("/api/admin/users/" + u.id + "/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ displayName: name }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); showToast(d.error || "Failed", "#ff8888"); return; }
            u.displayName = name;
            showToast("Name saved");
            renderAdmin();
        } catch (err) { showToast("Failed", "#ff8888"); }
    };

    document.getElementById("admin-role-select").onchange = async (e) => {
        try {
            await fetch("/api/admin/users/" + u.id + "/role", {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ role: e.target.value }),
            });
            u.role = e.target.value;
            showToast("Role updated");
        } catch (err) { showToast("Failed", "#ff8888"); }
    };

    document.getElementById("admin-vis-cb").onchange = async (e) => {
        try {
            await fetch("/api/admin/users/" + u.id + "/visibility", {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ show: e.target.checked }),
            });
            u.showOnLeaderboard = e.target.checked;
            showToast("Visibility updated");
        } catch (err) { showToast("Failed", "#ff8888"); }
    };

    document.getElementById("admin-save-progress").onclick = async () => {
        const hl = parseInt(document.getElementById("admin-hl").value);
        const tce = parseInt(document.getElementById("admin-tce").value);
        const ml = parseInt(document.getElementById("admin-ml").value);
        const mp = parseInt(document.getElementById("admin-mp").value);
        const ms = hl - ml;  // monthly start = all-time minus monthly gain
        const mcs = tce - mp;
        try {
            await fetch("/api/admin/users/" + u.id + "/progress", {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ highestLevel: hl, totalCoinsEarned: tce, monthlyStart: ms, monthlyCoinsStart: mcs }),
            });
            u.highestLevel = hl;
            u.totalCoinsEarned = tce;
            u.monthlyStart = ms;
            u.monthlyCoinsStart = mcs;
            // If editing our own account, update local state too so sync doesn't revert
            const currentUser = typeof getUser === "function" && getUser();
            if (currentUser && currentUser.id === u.id) {
                state.highestLevel = hl;
                state.currentLevel = Math.min(state.currentLevel, hl);
                state.totalCoinsEarned = tce;
                state.levelsCompleted = hl;
                saveProgress();
            }
            showToast("Scores saved");
            renderAdmin();
        } catch (err) { showToast("Failed", "#ff8888"); }
    };

    // Fetch and render snapshot history
    fetch("/api/admin/users/" + u.id + "/snapshots", { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(snapshots => {
            const section = document.getElementById("admin-snapshot-section");
            if (!section) return;
            if (!snapshots || snapshots.length === 0) {
                section.innerHTML = '<div style="opacity:0.7">No history yet</div>';
                return;
            }
            const tierNames = ["Easy","Medium","Hard","Expert","Master"];
            section.innerHTML = snapshots.map(s => {
                const d = new Date(s.createdAt);
                const dateStr = d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
                const tier = tierNames[s.difficultyTier] || "\u2014";
                return '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.06)">' +
                    '<span>Lv ' + s.highestLevel.toLocaleString() + ' \u00b7 ' + s.totalCoinsEarned.toLocaleString() + ' pts \u00b7 ' + tier + '</span>' +
                    '<span style="opacity:0.5">' + dateStr + '</span>' +
                    '</div>';
            }).join("");
        })
        .catch(() => {
            const section = document.getElementById("admin-snapshot-section");
            if (section) section.innerHTML = '<div style="opacity:0.7">Failed to load</div>';
        });

    document.getElementById("admin-delete-user").onclick = async () => {
        if (!confirm("Delete " + (u.displayName || "User #" + u.id) + "? All progress, scores, and data for this user will be permanently removed. This cannot be undone.")) return;
        try {
            const res = await fetch("/api/admin/users/" + u.id, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                showToast("User deleted");
                _adminView = "users";
                _adminSelectedUser = null;
                loadAdminUsers();
                renderAdmin();
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.error || "Failed", "#ff8888");
            }
        } catch (err) { showToast("Failed", "#ff8888"); }
    };

    // Load rabbit assignment for this user
    fetch("/api/admin/rabbits", { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(rabbits => {
            const section = document.getElementById("admin-rabbit-section");
            if (!section) return;
            const activeRabbits = rabbits.filter(r => r.targetUserId === u.id && r.isActive);
            const bots = _adminUsers.filter(x => x.role === "bot");
            let html = '';

            // Show existing assignments
            activeRabbits.forEach(a => {
                const modeLabel = a.paceMode === "trailing" ? "trailing" : "leading";
                html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;font-size:14px;opacity:1">' +
                    '<span><strong>' + escapeHtml(a.botName || "Bot #" + a.botUserId) + '</strong> <span class="admin-badge admin-badge-' + (a.paceMode === "trailing" ? "bot" : "admin") + '">' + modeLabel + '</span></span>' +
                    '<button class="admin-remove-rabbit-btn" data-rid="' + a.id + '" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3);padding:3px 10px;border-radius:6px;font-size:11px;cursor:pointer">Remove</button>' +
                    '</div>';
            });

            // Add new assignment form — only show unassigned bots
            const assignedBotIds = new Set(activeRabbits.map(a => a.botUserId));
            const availableBots = bots.filter(b => !assignedBotIds.has(b.id));
            if (availableBots.length > 0) {
                let botOpts = '<option value="">Add a rabbit...</option>';
                availableBots.forEach(b => { botOpts += '<option value="' + b.id + '">' + escapeHtml(b.displayName || "Bot #" + b.id) + '</option>'; });
                html += '<div style="display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap">' +
                    '<select id="admin-rabbit-select" style="flex:1 1 0;min-width:0;padding:6px;background:#1a1030;border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:#f0e8ff;font-size:13px">' + botOpts + '</select>' +
                    '<select id="admin-rabbit-mode" style="width:auto;padding:6px;background:#1a1030;border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:#f0e8ff;font-size:13px"><option value="leading">Leading</option><option value="trailing">Trailing</option></select>' +
                    '<button id="admin-assign-rabbit" style="background:' + accent + ';color:#000;border:none;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer;white-space:nowrap">Assign</button>' +
                    '</div>';
            } else if (activeRabbits.length === 0) {
                html += '<div>No bots available. Create a bot first.</div>';
            }
            section.innerHTML = html;

            // Wire remove buttons
            section.querySelectorAll(".admin-remove-rabbit-btn").forEach(btn => {
                btn.onclick = async () => {
                    await fetch("/api/admin/rabbits/" + btn.dataset.rid, { method: "DELETE", headers: getAuthHeaders() });
                    showToast("Rabbit removed");
                    renderAdmin();
                };
            });

            // Wire assign button
            const assignBtn = document.getElementById("admin-assign-rabbit");
            if (assignBtn) {
                assignBtn.onclick = async () => {
                    const botId = parseInt(document.getElementById("admin-rabbit-select").value);
                    if (!botId) { showToast("Select a bot", "#ff8888"); return; }
                    const mode = document.getElementById("admin-rabbit-mode").value;
                    try {
                        const res = await fetch("/api/admin/rabbits", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                            body: JSON.stringify({ botUserId: botId, targetUserId: u.id, paceMode: mode }),
                        });
                        if (res.ok) { showToast("Rabbit assigned"); renderAdmin(); }
                        else { const d = await res.json().catch(() => ({})); showToast(d.error || "Failed", "#ff8888"); }
                    } catch (err) { showToast("Failed", "#ff8888"); }
                };
            }
        });
}

function renderAdminRabbits(overlay) {
    const accent = theme.accent;

    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="admin-rabbits-back" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${accent}">Rabbit Assignments</h2>
        </div>
        <div class="menu-scroll">
            <div id="admin-rabbit-list" style="padding:0 4px">
                <div style="text-align:center;padding:30px;opacity:0.5">Loading...</div>
            </div>
            <div class="menu-setting" style="border-top:1px solid rgba(255,255,255,0.08)">
                <label class="menu-setting-label">New Assignment</label>
                <div class="admin-detail-field">
                    <label>Bot</label>
                    <select id="admin-new-rabbit-bot" style="width:100%;padding:8px;background:#1a1030;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#f0e8ff;font-size:14px">
                        <option value="">Select bot...</option>
                    </select>
                </div>
                <div class="admin-detail-field">
                    <label>Target Player</label>
                    <select id="admin-new-rabbit-target" style="width:100%;padding:8px;background:#1a1030;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#f0e8ff;font-size:14px">
                        <option value="">Select player...</option>
                    </select>
                </div>
                <div class="admin-detail-field">
                    <label>Pace Mode</label>
                    <select id="admin-new-rabbit-mode" style="width:100%;padding:8px;background:#1a1030;border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#f0e8ff;font-size:14px">
                        <option value="leading">Leading (ahead of player)</option>
                        <option value="trailing">Trailing (behind player)</option>
                    </select>
                </div>
                <button class="menu-setting-btn" id="admin-new-rabbit-btn" style="background:${accent};color:#000;width:100%;padding:10px 0;margin:8px 12px">Assign Rabbit</button>
            </div>
        </div>
    `;

    document.getElementById("admin-rabbits-back").onclick = () => {
        _adminView = "users";
        renderAdmin();
    };

    // Load rabbits and populate
    Promise.all([
        fetch("/api/admin/rabbits", { headers: getAuthHeaders() }).then(r => r.json()),
        _adminUsers.length ? Promise.resolve(_adminUsers) : fetch("/api/admin/users", { headers: getAuthHeaders() }).then(r => r.json()),
    ]).then(([rabbits, users]) => {
        _adminUsers = users;
        _adminRabbits = rabbits;

        // Render assignment list
        const list = document.getElementById("admin-rabbit-list");
        if (!list) return;
        if (rabbits.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5">No rabbit assignments</div>';
        } else {
            list.innerHTML = rabbits.map(r => `
                <div class="admin-rabbit-row">
                    <div class="admin-rabbit-info">
                        <strong>${escapeHtml(r.botName || "Bot #" + r.botUserId)}</strong>
                        <span style="opacity:0.5;margin:0 6px">\u2192</span>
                        ${escapeHtml(r.targetName || "User #" + r.targetUserId)}
                        <span style="background:${r.paceMode === 'trailing' ? '#ff6644' : '#44cc88'};color:#000;padding:1px 6px;border-radius:4px;font-size:11px;margin-left:6px">${r.paceMode || 'leading'}</span>
                        ${r.isActive ? '' : '<span style="opacity:0.4;margin-left:6px">(paused)</span>'}
                    </div>
                    <button data-pause="${r.id}" data-active="${r.isActive}">${r.isActive ? '\u23F8 Pause' : '\u25B6 Resume'}</button>
                    <button data-rid="${r.id}">Remove</button>
                </div>
            `).join("");

            list.querySelectorAll("button[data-pause]").forEach(btn => {
                btn.onclick = async () => {
                    const newActive = btn.dataset.active !== "true";
                    await fetch("/api/admin/rabbits/" + btn.dataset.pause + "/active", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                        body: JSON.stringify({ isActive: newActive }),
                    });
                    showToast(newActive ? "Resumed" : "Paused");
                    _adminView = "rabbits";
                    renderAdmin();
                };
            });

            list.querySelectorAll("button[data-rid]").forEach(btn => {
                btn.onclick = async () => {
                    if (!confirm("Remove this rabbit assignment?")) return;
                    await fetch("/api/admin/rabbits/" + btn.dataset.rid, { method: "DELETE", headers: getAuthHeaders() });
                    showToast("Removed");
                    _adminView = "rabbits";
                    renderAdmin();
                };
            });
        }

        // Populate dropdowns — only show bots not already assigned
        const assignedBotIds = new Set(rabbits.map(r => r.botUserId));
        const botSelect = document.getElementById("admin-new-rabbit-bot");
        const targetSelect = document.getElementById("admin-new-rabbit-target");
        users.filter(u => u.role === "bot" && !assignedBotIds.has(u.id)).forEach(b => {
            botSelect.innerHTML += '<option value="' + b.id + '">' + escapeHtml(b.displayName || "Bot #" + b.id) + '</option>';
        });
        users.filter(u => u.role !== "bot").forEach(u => {
            targetSelect.innerHTML += '<option value="' + u.id + '">' + escapeHtml(u.displayName || "User #" + u.id) + '</option>';
        });
    });

    document.getElementById("admin-new-rabbit-btn").onclick = async () => {
        const botId = parseInt(document.getElementById("admin-new-rabbit-bot").value);
        const targetId = parseInt(document.getElementById("admin-new-rabbit-target").value);
        const paceMode = document.getElementById("admin-new-rabbit-mode").value;
        if (!botId || !targetId) { showToast("Select both bot and target", "#ff8888"); return; }
        try {
            const res = await fetch("/api/admin/rabbits", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ botUserId: botId, targetUserId: targetId, paceMode }),
            });
            if (res.ok) { showToast("Rabbit assigned"); _adminView = "rabbits"; renderAdmin(); }
            else { const d = await res.json().catch(() => ({})); showToast(d.error || "Failed", "#ff8888"); }
        } catch (err) { showToast("Failed", "#ff8888"); }
    };
}

// ---- LEVEL MAP ----
// Multiple winding trail patterns (x%, y%) — cycle to keep scenes feeling fresh
const TRAIL_PATTERNS = [
    // Pattern 0: Classic S-curve, left start
    [
        [22, 3], [42, 6], [65, 9], [80, 13], [68, 17],
        [45, 19], [22, 22], [15, 26], [32, 30], [55, 32],
        [75, 35], [82, 39], [62, 42], [38, 44], [18, 47],
        [15, 51], [35, 55], [55, 57], [75, 60], [78, 64],
        [58, 67], [35, 69], [18, 73], [32, 77], [50, 80],
    ],
    // Pattern 1: Right start, wider meander
    [
        [78, 3], [60, 7], [38, 9], [20, 13], [15, 17],
        [30, 21], [52, 23], [75, 26], [82, 30], [65, 34],
        [42, 36], [20, 39], [15, 43], [35, 47], [58, 49],
        [78, 52], [80, 56], [60, 60], [38, 62], [18, 66],
        [22, 70], [45, 73], [68, 76], [75, 80], [50, 83],
    ],
    // Pattern 2: Zigzag down the center
    [
        [50, 3], [72, 7], [28, 11], [68, 15], [32, 19],
        [65, 23], [35, 27], [62, 31], [38, 35], [60, 39],
        [40, 43], [58, 47], [42, 51], [65, 55], [35, 59],
        [70, 63], [30, 67], [62, 71], [38, 75], [55, 79],
        [45, 83], [70, 87], [30, 91], [55, 94], [50, 97],
    ],
    // Pattern 3: Cascade from top-left
    [
        [15, 3], [35, 5], [55, 9], [75, 12], [82, 16],
        [68, 20], [48, 22], [28, 25], [15, 29], [25, 33],
        [48, 35], [70, 38], [82, 42], [65, 46], [42, 48],
        [22, 51], [15, 55], [30, 59], [52, 61], [72, 64],
        [80, 68], [62, 72], [40, 74], [20, 78], [38, 82],
    ],
    // Pattern 4: Tight switchbacks
    [
        [20, 3], [55, 5], [80, 8], [60, 12], [25, 15],
        [15, 19], [45, 22], [78, 25], [72, 29], [38, 32],
        [18, 35], [25, 39], [58, 42], [82, 45], [68, 49],
        [35, 52], [15, 55], [28, 59], [60, 62], [80, 65],
        [70, 69], [42, 72], [18, 75], [35, 79], [58, 83],
    ],
    // Pattern 5: River meander
    [
        [40, 3], [25, 7], [18, 11], [28, 15], [50, 18],
        [72, 21], [82, 25], [70, 29], [50, 32], [30, 35],
        [18, 39], [22, 43], [42, 46], [65, 49], [80, 53],
        [75, 57], [55, 60], [32, 63], [18, 67], [25, 71],
        [48, 74], [70, 77], [78, 81], [58, 85], [40, 88],
    ],
];

async function renderAdminFlaggedWords(overlay) {
    const accent = theme.accent;
    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="admin-flagged-back" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${accent}">🚩 Flagged Words</h2>
        </div>
        <div class="menu-scroll" id="flagged-content">
            <div style="text-align:center;padding:30px;opacity:0.5">Loading...</div>
        </div>
    `;

    document.getElementById("admin-flagged-back").onclick = () => {
        _adminView = "users";
        renderAdmin();
    };

    try {
        const [votesResp, bannedResp, auditResp] = await Promise.all([
            fetch('/api/admin/word-votes', { headers: getAuthHeaders() }),
            fetch('/api/admin/banned-words', { headers: getAuthHeaders() }),
            fetch('/api/admin/word-audit-log', { headers: getAuthHeaders() })
        ]);
        const votes = votesResp.ok ? await votesResp.json() : [];
        const banned = bannedResp.ok ? await bannedResp.json() : [];
        const auditLog = auditResp.ok ? await auditResp.json() : [];

        let html = '';

        if (votes.length > 0) {
            html += `<div class="menu-setting"><label class="menu-setting-label">Words Flagged by Players</label></div>`;
            for (const v of votes) {
                const def = DEFINITIONS && DEFINITIONS[v.word] ? DEFINITIONS[v.word].d[0] : 'No definition available';
                const truncDef = def.length > 60 ? def.substring(0, 57) + '...' : def;
                html += `
                    <div class="flagged-word-row">
                        <div class="flagged-word-info">
                            <span class="flagged-word-name">${v.word}</span>
                            <span class="flagged-word-votes">${v.votes} vote${v.votes !== 1 ? 's' : ''}</span>
                            <div class="flagged-word-def">${truncDef}</div>
                        </div>
                        <div class="flagged-word-actions">
                            <button class="flagged-ban-btn" data-word="${v.word}">Ban</button>
                            <button class="flagged-dismiss-btn" data-word="${v.word}">Dismiss</button>
                        </div>
                    </div>
                `;
            }
        } else {
            html += `<div style="text-align:center;padding:30px;opacity:0.5">No flagged words</div>`;
        }

        html += `<div class="menu-setting" style="margin-top:20px"><label class="menu-setting-label">Banned Words</label></div>`;
        if (banned.length > 0) {
            for (const b of banned) {
                const date = new Date(b.bannedAt).toLocaleDateString();
                html += `
                    <div class="flagged-word-row">
                        <div class="flagged-word-info">
                            <span class="flagged-word-name">${b.word}</span>
                            <div class="flagged-word-def">Banned ${date}</div>
                        </div>
                        <div class="flagged-word-actions">
                            <button class="flagged-unban-btn" data-word="${b.word}">Unban</button>
                        </div>
                    </div>
                `;
            }
        } else {
            html += `<div style="text-align:center;padding:20px;opacity:0.5">No banned words</div>`;
        }

        // Audit log section
        const bannedSet = new Set(banned.map(b => b.word));
        if (auditLog.length > 0) {
            html += `<div class="menu-setting" style="margin-top:20px"><label class="menu-setting-label">Recent Activity</label></div>`;
            for (const entry of auditLog) {
                const date = new Date(entry.createdAt).toLocaleDateString();
                const actionLabel = entry.action === 'ban' ? 'Banned' : entry.action === 'unban' ? 'Unbanned' : 'Dismissed';
                const actionColor = entry.action === 'ban' ? '#ff6b6b' : entry.action === 'unban' ? accent : '#888';
                const canReban = entry.action === 'unban' && !bannedSet.has(entry.word);
                html += `
                    <div class="flagged-word-row">
                        <div class="flagged-word-info">
                            <span class="flagged-word-name">${entry.word}</span>
                            <div class="flagged-word-def"><span style="color:${actionColor}">${actionLabel}</span> ${date}</div>
                        </div>
                        ${canReban ? `<div class="flagged-word-actions"><button class="flagged-reban-btn" data-word="${entry.word}">Re-ban</button></div>` : ''}
                    </div>
                `;
            }
        }

        document.getElementById("flagged-content").innerHTML = html;

        document.querySelectorAll(".flagged-ban-btn").forEach(btn => {
            btn.onclick = async () => {
                const resp = await fetch('/api/admin/banned-words', {
                    method: 'POST',
                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word: btn.dataset.word })
                });
                if (resp.ok) {
                    showToast("Banned: " + btn.dataset.word, "#ff6b6b");
                    _bannedWords.add(btn.dataset.word);
                    _myWordVotes.delete(btn.dataset.word);
                    localStorage.removeItem("wordplay-banned");
                    renderAdminFlaggedWords(overlay);
                }
            };
        });

        document.querySelectorAll(".flagged-dismiss-btn").forEach(btn => {
            btn.onclick = async () => {
                const resp = await fetch('/api/admin/word-votes/' + encodeURIComponent(btn.dataset.word), {
                    method: 'DELETE', headers: getAuthHeaders()
                });
                if (resp.ok) {
                    showToast("Dismissed votes for: " + btn.dataset.word);
                    renderAdminFlaggedWords(overlay);
                }
            };
        });

        document.querySelectorAll(".flagged-unban-btn").forEach(btn => {
            btn.onclick = async () => {
                if (!confirm(`Unban "${btn.dataset.word}"? This will allow it back into puzzles.`)) return;
                const resp = await fetch('/api/admin/banned-words/' + encodeURIComponent(btn.dataset.word), {
                    method: 'DELETE', headers: getAuthHeaders()
                });
                if (resp.ok) {
                    showToast("Unbanned: " + btn.dataset.word, accent);
                    _bannedWords.delete(btn.dataset.word);
                    localStorage.removeItem("wordplay-banned");
                    renderAdminFlaggedWords(overlay);
                }
            };
        });

        document.querySelectorAll(".flagged-reban-btn").forEach(btn => {
            btn.onclick = async () => {
                const resp = await fetch('/api/admin/banned-words', {
                    method: 'POST',
                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word: btn.dataset.word })
                });
                if (resp.ok) {
                    showToast("Re-banned: " + btn.dataset.word, "#ff6b6b");
                    _bannedWords.add(btn.dataset.word);
                    localStorage.removeItem("wordplay-banned");
                    renderAdminFlaggedWords(overlay);
                }
            };
        });

    } catch (e) {
        document.getElementById("flagged-content").innerHTML =
            '<div style="text-align:center;padding:30px;color:#ff6b6b">Failed to load flagged words</div>';
    }
}

function renderSnakeNodes(pack, accent) {
    const total = pack.end - pack.start + 1;
    const bgKey = `${pack.group}-${pack.pack}`.toLowerCase().replace(/\s+/g, '-');
    const hasBg = _bgManifest && _bgManifest.has(bgKey);

    // Pick a trail pattern based on pack start level (cycles through 6 patterns)
    const patIdx = Math.floor((pack.start - 1) / 25) % TRAIL_PATTERNS.length;
    const trailCoords = TRAIL_PATTERNS[patIdx];

    // Build SVG path through trail points (with padding so nodes aren't clipped)
    const W = 300, H = 520;
    const padX = 30, padY = 22;
    const pts = [];
    for (let i = 0; i < total && i < trailCoords.length; i++) {
        pts.push({
            x: padX + trailCoords[i][0] * (W - padX * 2) / 100,
            y: padY + trailCoords[i][1] * (H - padY * 2) / 100
        });
    }

    // Smooth path through points
    let pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const cur = pts[i];
        const cpx = (prev.x + cur.x) / 2;
        const cpy = (prev.y + cur.y) / 2;
        pathD += ` Q ${prev.x + (cpx - prev.x) * 0.3} ${cpy}, ${cpx} ${cpy}`;
        pathD += ` Q ${cpx + (cur.x - cpx) * 0.7} ${cpy + (cur.y - cpy) * 0.5}, ${cur.x} ${cur.y}`;
    }

    // Build the trail as an SVG overlay on the bg image
    let html = `<div class="map-trail" style="position:relative;width:100%;max-width:${W}px;margin:0 auto;height:${H}px;border-radius:16px;overflow:hidden">`;
    if (hasBg) {
        html += `<div style="position:absolute;inset:0;background:url('images/bg/${bgKey}.webp') center/cover no-repeat"></div>`;
    }
    html += `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.15) 40%,rgba(0,0,0,0.3) 100%)"></div>`;
    html += `<svg viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0;width:100%;height:100%">`;

    // Draw path segments colored by progress
    for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const cur = pts[i];
        const lvNum = pack.start + i;
        const dLv = lvNum - state.difficultyOffset;
        const done = dLv <= state.highestLevel;
        const col = done ? accent : 'rgba(255,255,255,0.2)';
        const cpx = (prev.x + cur.x) / 2;
        const cpy = (prev.y + cur.y) / 2;
        let seg = `M ${prev.x} ${prev.y}`;
        seg += ` Q ${prev.x + (cpx - prev.x) * 0.3} ${cpy}, ${cpx} ${cpy}`;
        seg += ` Q ${cpx + (cur.x - cpx) * 0.7} ${cpy + (cur.y - cpy) * 0.5}, ${cur.x} ${cur.y}`;
        html += `<path d="${seg}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${done ? 'none' : '6 4'}"/>`;
    }

    // Draw nodes as pill-shaped banners (adapts to digit count)
    for (let i = 0; i < pts.length; i++) {
        const lvNum = pack.start + i;
        const dLv = lvNum - state.difficultyOffset;
        const isCompleted = dLv < state.highestLevel;
        const isCurrent = dLv === state.currentLevel;
        const isAvailable = dLv <= state.highestLevel;
        const p = pts[i];
        const digits = String(dLv).length;
        const fs = digits > 5 ? 8 : digits > 4 ? 9 : 10;
        const bh = isCurrent ? 20 : 18;
        const bw = Math.max(28, digits * 8 + (isCurrent ? 10 : 6));
        const rx = bh / 2;

        if (isCompleted) {
            html += `<rect x="${p.x - bw/2}" y="${p.y - bh/2}" width="${bw}" height="${bh}" rx="${rx}" fill="${accent}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>`;
            html += `<text x="${p.x}" y="${p.y + fs/3}" text-anchor="middle" fill="#000" font-size="${fs}" font-weight="700">${dLv}</text>`;
        } else if (isCurrent) {
            html += `<rect x="${p.x - (bw+6)/2}" y="${p.y - (bh+6)/2}" width="${bw + 6}" height="${bh + 6}" rx="${(bh+6)/2}" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.4"><animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite"/></rect>`;
            html += `<rect x="${p.x - bw/2}" y="${p.y - bh/2}" width="${bw}" height="${bh}" rx="${rx}" fill="rgba(0,0,0,0.5)" stroke="${accent}" stroke-width="2.5"/>`;
            html += `<text x="${p.x}" y="${p.y + fs/3}" text-anchor="middle" fill="${accent}" font-size="${fs + 1}" font-weight="700">${dLv}</text>`;
        } else if (isAvailable) {
            html += `<rect x="${p.x - bw/2}" y="${p.y - bh/2}" width="${bw}" height="${bh}" rx="${rx}" fill="rgba(0,0,0,0.4)" stroke="${accent}" stroke-width="1.5" opacity="0.7"/>`;
            html += `<text x="${p.x}" y="${p.y + fs/3}" text-anchor="middle" fill="${accent}" font-size="${fs}" font-weight="600" opacity="0.7">${dLv}</text>`;
        } else {
            html += `<rect x="${p.x - (bw-4)/2}" y="${p.y - (bh-4)/2}" width="${bw - 4}" height="${bh - 4}" rx="${(bh-4)/2}" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>`;
            html += `<text x="${p.x}" y="${p.y + (fs-1)/3}" text-anchor="middle" fill="rgba(255,255,255,0.25)" font-size="${fs - 1}">${dLv}</text>`;
        }
    }

    html += `</svg>`;

    // Invisible hit targets for tapping nodes (overlaid divs)
    for (let i = 0; i < pts.length; i++) {
        const lvNum = pack.start + i;
        const dLv = lvNum - state.difficultyOffset;
        const isAvailable = dLv <= state.highestLevel;
        const p = pts[i];
        const digits = String(dLv).length;
        const hitW = Math.max(40, digits * 8 + 16);
        const cls = isAvailable ? (dLv < state.highestLevel ? 'map-node completed' : (dLv === state.currentLevel ? 'map-node current' : 'map-node available')) : 'map-node locked';
        html += `<div class="${cls}" data-lv="${dLv}" style="--accent:${accent};position:absolute;left:${p.x * 100 / W}%;top:${p.y * 100 / H}%;width:${hitW}px;height:28px;transform:translate(-50%,-50%);border-radius:14px;background:transparent;border:none"></div>`;
    }

    html += `</div>`;
    return html;
}

// renderGiantPackView removed — all packs are now ≤25 levels

function renderMap() {
    let overlay = document.getElementById("map-overlay");
    if (!state.showMap) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "map-overlay";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "map-overlay";
    overlay.style.display = "flex";

    const packs = typeof getLevelPacks === "function" ? getLevelPacks() : [];
    if (!packs.length) {
        overlay.innerHTML = `<div class="map-header" style="justify-content:center;position:relative"><button class="back-arrow-btn" id="map-close-btn" title="Back" style="position:absolute;left:12px"><svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button><h2 class="map-title" style="color:${theme.accent}">Level Map</h2></div><div class="map-scroll"><p style="opacity:0.5;text-align:center;padding:40px">No level data available</p></div>`;
        document.getElementById("map-close-btn").onclick = () => { state.showMap = false; renderMap(); if (!state.showHome) renderWheel(); };
        return;
    }

    // Auto-select the current group on first open
    if (!_mapAutoExpanded) {
        _mapAutoExpanded = true;
        for (const p of packs) {
            const pStartD = p.start - state.difficultyOffset;
            const pEndD = p.end - state.difficultyOffset;
            if (state.currentLevel >= pStartD && state.currentLevel <= pEndD) {
                _mapSelectedGroup = p.group;
                const key = p.group + "/" + p.pack + "/" + p.start;
                _mapExpandedPacks = {};
                _mapExpandedPacks[key] = true;
                break;
            }
        }
    }

    if (_mapSelectedGroup) {
        _renderMapPackView(overlay, packs);
    } else {
        _renderMapGroupView(overlay, packs);
    }
}

// ---- MAP: Group list view ----
function _renderMapGroupView(overlay, packs) {
    // Build group summaries
    const groups = [];
    const groupMap = {};
    for (const p of packs) {
        if (!groupMap[p.group]) {
            const g = { group: p.group, start: p.end + 1, end: 0, packCount: 0 };
            groupMap[p.group] = g;
            groups.push(g);
        }
        const g = groupMap[p.group];
        g.start = Math.min(g.start, p.start);
        g.end = Math.max(g.end, p.end);
        g.packCount++;
    }

    const backSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
    let html = `<div class="map-header" style="justify-content:center;position:relative"><button class="back-arrow-btn" id="map-close-btn" title="Back" style="position:absolute;left:12px">${backSvg}</button><h2 class="map-title" style="color:${theme.accent}">Level Map</h2></div><div class="map-scroll" id="map-scroll">`;

    for (const g of groups) {
        const gStartD = g.start - state.difficultyOffset;
        const gEndD = g.end - state.difficultyOffset;
        if (gStartD > state.highestLevel) continue;
        if (g.end < state.difficultyOffset + 1) continue; // below tier start
        const gTheme = typeof getThemeForPackStart === "function" ? getThemeForPackStart(g.start) : "sunrise";
        const accent = (THEMES[gTheme] || THEMES.sunrise).accent;
        let completed = 0;
        const total = gEndD - gStartD + 1;
        for (let dlv = gStartD; dlv <= gEndD; dlv++) { if (dlv < state.highestLevel) completed++; }
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isActive = state.currentLevel >= gStartD && state.currentLevel <= gEndD;
        const isDone = completed === total;

        html += `<div class="map-pack${isActive ? ' active' : ''}${isDone ? ' done' : ''}" data-map-group="${g.group}">`;
        html += `<div class="map-pack-header expandable" data-map-group="${g.group}">`;
        html += `<div class="map-pack-info">`;
        if (isDone) html += `<span class="map-pack-icon" style="color:${accent}">✓</span>`;
        else if (isActive) html += `<span class="map-pack-icon active-dot" style="background:${accent}"></span>`;
        html += `<div><div class="map-pack-name" style="font-size:15px">${g.group}</div>`;
        html += `<div class="map-pack-range">Levels ${(g.start - state.difficultyOffset).toLocaleString()} – ${(g.end - state.difficultyOffset).toLocaleString()} · ${g.packCount} packs</div></div></div>`;
        html += `<div class="map-pack-right">`;
        html += `<div class="map-progress-bar"><div class="map-progress-fill" style="width:${pct}%;background:${accent}"></div></div>`;
        html += `<span class="map-chevron">▸</span>`;
        html += `</div></div></div>`;
    }

    html += `</div>`;
    overlay.innerHTML = html;

    document.getElementById("map-close-btn").onclick = () => { state.showMap = false; renderMap(); if (!state.showHome) renderWheel(); };

    overlay.querySelectorAll(".map-pack-header[data-map-group]").forEach(hdr => {
        hdr.onclick = () => {
            _mapSelectedGroup = hdr.getAttribute("data-map-group");
            _mapExpandedPacks = {};
            _mapHasScrolled = false;
            // Auto-expand current pack within this group
            const packs = typeof getLevelPacks === "function" ? getLevelPacks() : [];
            for (const p of packs) {
                if (p.group === _mapSelectedGroup && state.currentLevel >= (p.start - state.difficultyOffset) && state.currentLevel <= (p.end - state.difficultyOffset)) {
                    _mapExpandedPacks[p.group + "/" + p.pack + "/" + p.start] = true;
                    break;
                }
            }
            renderMap();
        };
    });

    // Auto-scroll to active group
    if (!_mapHasScrolled) {
        _mapHasScrolled = true;
        setTimeout(() => {
            const active = overlay.querySelector(".map-pack.active");
            if (active) active.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 100);
    }
}

// ---- MAP: Pack list view (within a group) ----
function _renderMapPackView(overlay, packs) {
    const groupPacks = packs.filter(p => p.group === _mapSelectedGroup);
    // Use first pack's theme for the header accent
    const headerTheme = groupPacks.length > 0 && typeof getThemeForPackStart === "function" ? getThemeForPackStart(groupPacks[0].start) : "sunrise";
    const headerAccent = (THEMES[headerTheme] || THEMES.sunrise).accent;

    const backSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
    let html = `<div class="map-header" style="justify-content:center;position:relative"><button class="back-arrow-btn" id="map-back-btn" title="Back" style="position:absolute;left:12px">${backSvg}</button><h2 class="map-title" style="color:${headerAccent}">${_mapSelectedGroup}</h2></div><div class="map-scroll" id="map-scroll">`;

    for (let pi = 0; pi < groupPacks.length; pi++) {
        const p = groupPacks[pi];
        const pStartD = p.start - state.difficultyOffset;
        const pEndD = p.end - state.difficultyOffset;
        if (pStartD > state.highestLevel) continue;
        if (p.end < state.difficultyOffset + 1) continue; // below tier start
        const key = p.group + "/" + p.pack + "/" + p.start;
        const total = pEndD - pStartD + 1;
        const packTheme = typeof getThemeForPackStart === "function" ? getThemeForPackStart(p.start) : "sunrise";
        const accent = (THEMES[packTheme] || THEMES.sunrise).accent;
        let completed = 0;
        for (let dlv = pStartD; dlv <= pEndD; dlv++) { if (dlv < state.highestLevel) completed++; }
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isActive = state.currentLevel >= pStartD && state.currentLevel <= pEndD;
        const isLocked = state.highestLevel < pStartD;
        const isDone = completed === total;
        const isExpanded = _mapExpandedPacks[key];
        const packLabel = `${p.pack} ${pi + 1}`;

        html += `<div class="map-pack${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}${isDone ? ' done' : ''}">`;
        html += `<div class="map-pack-header expandable" data-pack-key="${key}">`;
        html += `<div class="map-pack-info">`;
        if (isDone) html += `<span class="map-pack-icon" style="color:${accent}">✓</span>`;
        else if (isActive) html += `<span class="map-pack-icon active-dot" style="background:${accent}"></span>`;
        else if (isLocked) html += `<span class="map-pack-icon locked-icon">🔒</span>`;
        html += `<div><div class="map-pack-name">${packLabel}</div>`;
        html += `<div class="map-pack-range">Levels ${(p.start - state.difficultyOffset).toLocaleString()} – ${(p.end - state.difficultyOffset).toLocaleString()}</div></div></div>`;
        html += `<div class="map-pack-right">`;
        html += `<div class="map-progress-bar"><div class="map-progress-fill" style="width:${pct}%;background:${accent}"></div></div>`;
        html += `<span class="map-chevron${isExpanded ? ' open' : ''}">▸</span>`;
        html += `</div></div>`;

        if (isExpanded) {
            html += `<div class="map-snake" id="map-snake-${key.replace(/[^a-zA-Z0-9]/g, '-')}">`;
            html += renderSnakeNodes(p, accent);
            html += `</div>`;
        }

        html += `</div>`;
    }

    html += `</div>`;
    overlay.innerHTML = html;

    // Back button → return to group list
    document.getElementById("map-back-btn").onclick = () => {
        _mapSelectedGroup = null;
        _mapHasScrolled = false;
        renderMap();
    };

    // Pack header toggles (accordion)
    overlay.querySelectorAll(".map-pack-header[data-pack-key]").forEach(hdr => {
        hdr.onclick = () => {
            const packKey = hdr.getAttribute("data-pack-key");
            const wasOpen = _mapExpandedPacks[packKey];
            _mapExpandedPacks = {};
            if (!wasOpen) _mapExpandedPacks[packKey] = true;
            _mapScrollTarget = wasOpen ? null : packKey;
            renderMap();
        };
    });

    // Level node clicks
    overlay.querySelectorAll(".map-node[data-lv]").forEach(node => {
        node.onclick = () => {
            if (node.classList.contains("locked")) return;
            const lv = parseInt(node.getAttribute("data-lv"));
            if (!isNaN(lv)) {
                state.showMap = false;
                goToLevel(lv);
            }
        };
    });

    // Auto-scroll
    setTimeout(() => {
        if (_mapScrollTarget) {
            const target = overlay.querySelector(`.map-pack-header[data-pack-key="${_mapScrollTarget}"]`);
            if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
            _mapScrollTarget = null;
        } else if (!_mapHasScrolled) {
            _mapHasScrolled = true;
            const currentNode = overlay.querySelector(".map-node.current");
            if (currentNode) {
                currentNode.scrollIntoView({ block: "center", behavior: "smooth" });
            } else {
                const activePack = overlay.querySelector(".map-pack.active");
                if (activePack) activePack.scrollIntoView({ block: "center", behavior: "smooth" });
            }
        }
    }, 100);
}

// ---- GUIDE OVERLAY ----
const GUIDE_SECTIONS = [
    { icon: "\uD83D\uDC46", title: "Swipe & Spell", body: "Drag your finger across the letter wheel to spell words. Letters connect as you swipe \u2014 lift your finger to submit. Find all the words to fill the crossword and move on!" },
    { icon: "⌨️", title: "Keyboard Input", body: "Playing on a desktop? Type letters on your keyboard to select them on the wheel. Press <b>Enter</b> to submit your word, <b>Backspace</b> to undo the last letter, or <b>Escape</b> to cancel. Works alongside touch and mouse!" },
    { icon: "\uD83E\uDE99", title: "Earning Coins", body: "Every word you find earns coins! Grid words = 1 coin. Bonus words = 5 coins. The special coin word = 100 coins! On <b>flow levels</b> (every 5th level), rewards are boosted: 3 coins per word, 15 per bonus word, and 200 for the coin word. Grab your daily bonus for 100 free coins too." },
    { icon: "\uD83D\uDCA1", title: "Hints", body: "Stuck? Use hints! <b>Hint</b> (\uD83D\uDCA1 100 coins) reveals a random letter. <b>Target</b> (\uD83C\uDFAF 200 coins) lets you tap any cell. <b>Rocket</b> (\uD83D\uDE80 300 coins) blasts up to 5 letters at once! You earn free hints every 10 levels, targets every 20, and rockets every 30." },
    { icon: "\u2B50", title: "Bonus Words", body: "Found a real word that\u2019s not on the grid? That\u2019s a bonus word! Worth 5 coins each, and every 10 bonus words earns you a free letter reveal. Watch the star counter fill up!" },
    { icon: "\uD83D\uDCB0", title: "The Coin Word", body: "See a pulsing coin on the grid? That\u2019s a special standalone word worth 100 coins! It\u2019s a short word (4\u20135 letters) tucked away for you to discover." },
    { icon: "\uD83C\uDFB0", title: "Spin of Shame", body: "Completely stuck with no coins and no hints? A prize wheel appears! Spin to win free hints, targets, rockets, or coins. It\u2019s your lifeline!" },
    { icon: "\uD83C\uDF81", title: "Daily Bonus", body: "Tap the FREE button at the top of the screen once a day to claim 100 free coins. Come back every day \u2014 it resets at midnight!" },
    { icon: "\uD83D\uDCC5", title: "Daily Puzzle", body: "A fresh puzzle every day! Tap the green Daily Puzzle button on the home screen to play. A coin (\uD83E\uDE99) appears on one word in the grid \u2014 find it for 25 bonus coins, then the coin moves to a new word. Keep chasing the coin to rack up rewards! Complete the entire puzzle for a 100-coin bonus. The same puzzle is shared by all players each day. Some dailies use a \uD83C\uDF0A stacked flow layout for variety. Your regular progress is saved and waiting when you return." },
    { icon: "\u2B50", title: "Bonus Puzzle", body: "Earn bonus puzzles through achievements \u2014 complete a level pack, finish 5 levels in an hour, maintain a 3-day play streak, or beat the daily puzzle. A gold <b>\u2B50 Bonus Puzzle</b> button appears on the home screen. Inside, 9 stars are scattered across the grid. Find starred words to collect stars and earn 10 coins each! Every 3 stars fills one of your 3 star slots. Collect all 9 stars for a <b>500-coin grand prize</b>. But be careful \u2014 leaving the puzzle forfeits your progress!" },
    { icon: "\uD83C\uDF0A", title: "Flow Levels", body: "Every 5th level (5, 10, 15, 20\u2026) is a <b>flow level</b>! These use a stacked layout instead of the usual crossword. Same words, same letters \u2014 just a different visual style with <b>3x rewards</b>: 3 coins per word, 15 per bonus word, and 200 for the coin word." },
    { icon: "\u21C4", title: "Grid Layouts", body: "WordPlay has two grid styles: <b>Crossword</b> (interlocking words) and <b>Flow</b> (stacked rows). You can <b>switch between them anytime</b> by tapping the level info at the top of the screen (the pack name and level number). All your progress \u2014 found words, hints, and stars \u2014 carries over when you switch. Set your preferred default in <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a> under Grid Layout: Auto (game decides), Crossword, or Flow." },
    { icon: "\uD83D\uDCD6", title: "Word Definitions", body: "Curious about a word? Tap any found word in the grid to see its definition! A popup shows the part of speech and meaning. Only non-intersecting letters are tappable \u2014 look for cells that belong to just one word." },
    { icon: "\uD83D\uDEA9", title: "Flag a Word", body: "Think a word is too obscure? When viewing a word\u2019s definition, tap <b>Flag for Review</b> to vote for its removal. Flagged words are reviewed by the game\u2019s administrators. You must be signed in to flag words." },
    { icon: "\u26A1", title: "Speed Bonus", body: "Beat the clock for a free prize spin! When you start swiping on a level with 5+ words, a hidden timer starts. Finish the level within <b>7 seconds per word</b> and you\u2019ll earn a \u26A1 Speed Bonus \u2014 a free spin on the prize wheel with chances to win hints, targets, rockets, bonus stars, or 100 coins. Works on regular levels and flow levels!" },
    { icon: "\uD83C\uDFAF", title: "Difficulty Tiers", body: "WordPlay matches puzzles to your skill level! There are five tiers:<br><br>\uD83C\uDF31 <b>Easy</b> \u2014 Levels 1\u2013250. Short words with 3\u20135 letters, perfect for beginners.<br>\uD83C\uDFC5 <b>Medium</b> \u2014 Levels 251\u20132,000. Full 6-letter puzzles with moderate bonus words.<br>\uD83D\uDD25 <b>Hard</b> \u2014 Levels 2,001\u20135,000. Puzzles loaded with 3\u20139 bonus words.<br>\uD83C\uDFC6 <b>Expert</b> \u2014 Levels 5,001\u201315,000. Complex anagrams with 8\u201315+ bonus words.<br>\uD83D\uDC51 <b>Master</b> \u2014 Levels 15,001+. 7\u20138 letter puzzles with massive word counts for true word enthusiasts.<br><br>Your tier is set automatically based on your progress. When you cross a tier boundary, you\u2019ll be <b>auto-promoted</b> with a celebration! You can change your tier in <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a> \u2014 switch to a lower tier if puzzles feel too hard. Tiers that can\u2019t fit your level count are hidden. Lowering your tier pauses auto-promotion until you move back up.<br><br><b>Note:</b> Speed milestones (5 fast levels = bonus puzzle) are disabled on Easy tier." },
    { icon: "\uD83D\uDD00", title: "Shuffle", body: "Tap the shuffle button to rearrange the letters on the wheel. Same letters, fresh perspective \u2014 sometimes that\u2019s all you need to spot a hidden word!" },
    { icon: "\uD83D\uDDFA\uFE0F", title: "Level Map", body: "Open the <a href=\"#\" class=\"guide-link\" data-action=\"map\">Level Map</a> from Settings to browse all level packs and groups. See your progress, jump to any unlocked level, and explore what\u2019s ahead!" },
    { icon: "\uD83C\uDFA8", title: "Themes", body: "The game features 16 beautiful color themes \u2014 Sunrise, Forest, Ocean, Aurora, and more. Themes change as you progress through different level groups." },
    { icon: "\uD83D\uDD04", title: "Sync Across Devices", body: "Sign in with Google or Microsoft in <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a> to save your progress to the cloud. Switch phones, play on your tablet \u2014 your progress follows you automatically!" },
    { icon: "\uD83C\uDFC6", title: "Expertise & Leaderboard", body: "Your Expertise score on the home screen tracks every coin you\u2019ve ever earned \u2014 it only goes up! Tap it to open <a href=\"#\" class=\"guide-link\" data-action=\"leaderboard\">the leaderboard</a> and compete with other players. Rank by levels completed or total points, and filter by this month or all time. To appear on the leaderboard you must sign in with Google or Microsoft in <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a>. Opt in or out anytime from Settings." },
    { icon: "\uD83D\uDCF1", title: "Play Anywhere", body: "WordPlay works offline! Install it to your home screen for a full app experience \u2014 no app store needed. Your progress is always saved locally." },
    { icon: "\uD83D\uDE00", title: "Avatar", body: "Personalize your profile with a custom avatar! Open <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a> and tap the avatar circle next to your name. Choose an emoji, upload an image, or take a photo with your camera. Your avatar appears on the leaderboard so other players can recognize you." },
    { icon: "\u2709\uFE0F", title: "Contact Support", body: "Need help or want to report a bug? Tap <a href=\"#\" class=\"guide-link\" data-action=\"contact\">Contact Support</a> to send us a message. Include as much detail as you can \u2014 we read every message!" },
    { icon: "\uD83D\uDDD1\uFE0F", title: "Account & Uninstall", body: "<b>Delete Account</b> \u2014 Open <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a>, scroll to your account section, and tap <b>Delete Account</b>. This permanently removes your account, progress, coins, and scores from the server. This cannot be undone.<br><br><b>Uninstall App</b> \u2014 In <a href=\"#\" class=\"guide-link\" data-action=\"settings\">Settings</a>, scroll to the App section and tap <b>Uninstall App</b>. This clears all local data (cached levels, service workers, saved preferences) and gives you instructions to remove the app from your device. Uninstalling does not delete your server account \u2014 use Delete Account first if you want to remove everything." },
];

function renderGuide() {
    let overlay = document.getElementById("guide-overlay");
    if (!state.showGuide) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "guide-overlay";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "guide-overlay";
    overlay.style.display = "flex";

    let sectionsHtml = "";
    GUIDE_SECTIONS.forEach((s, i) => {
        sectionsHtml += `
            <div class="guide-section" data-guide-idx="${i}">
                <div class="guide-q" data-guide-idx="${i}">
                    <span class="guide-emoji">${s.icon}</span>
                    <span class="guide-q-title">${s.title}</span>
                    <span class="guide-chevron">\u25B8</span>
                </div>
                <div class="guide-a">${s.body}</div>
            </div>`;
    });

    overlay.innerHTML = `
        <div class="guide-header">
            <button class="back-arrow-btn" id="guide-close-btn" title="Back" style="position:absolute;left:16px;top:20px;z-index:10">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="guide-icon">\uD83D\uDCD6</div>
            <h2 class="guide-title" style="color:${theme.accent}">How to Play</h2>
            <div class="guide-subtitle">Everything you need to become a Word Master</div>
        </div>
        <div class="menu-scroll" id="guide-scroll">
            ${sectionsHtml}
            <div class="guide-legal-row">
                <a href="#" data-legal="privacy">Privacy Policy</a>
                <a href="#" data-legal="terms">Terms of Service</a>
                <a href="#" data-legal="cookie">Cookie & Data</a>
            </div>
        </div>
    `;

    document.getElementById("guide-close-btn").onclick = () => {
        state.showGuide = false;
        renderGuide();
    };

    // Legal links at bottom of guide
    overlay.querySelectorAll(".guide-legal-row a").forEach(a => {
        a.onclick = (e) => {
            e.preventDefault();
            const which = a.dataset.legal;
            state.showGuide = false;
            renderGuide();
            if (which === "privacy") { state.showPrivacy = true; renderPrivacy(); }
            else if (which === "terms") { state.showTerms = true; renderTerms(); }
            else if (which === "cookie") { state.showCookiePolicy = true; renderCookiePolicy(); }
        };
    });

    // Guide live-link navigation (event delegation)
    overlay.addEventListener("click", (e) => {
        const link = e.target.closest(".guide-link");
        if (!link) return;
        e.preventDefault();
        const action = link.dataset.action;
        state.showGuide = false;
        renderGuide();
        if (action === "contact") { state.showContact = true; renderContact(); }
        else if (action === "settings") { state.showMenu = true; renderMenu(); }
        else if (action === "leaderboard") { state.showLeaderboard = true; renderLeaderboard(); }
        else if (action === "map") { state.showMenu = true; state.showMap = true; renderMenu(); renderMap(); }
    });

    // Accordion toggle
    overlay.querySelectorAll(".guide-q").forEach(q => {
        q.onclick = () => {
            const section = q.parentElement;
            const answer = section.querySelector(".guide-a");
            const chevron = q.querySelector(".guide-chevron");
            const isOpen = section.classList.contains("guide-open");
            if (isOpen) {
                section.classList.remove("guide-open");
                answer.style.maxHeight = "0";
                answer.style.padding = "0 16px 0 52px";
                chevron.textContent = "\u25B8";
            } else {
                section.classList.add("guide-open");
                answer.style.maxHeight = answer.scrollHeight + 16 + "px";
                answer.style.padding = "0 16px 16px 52px";
                chevron.textContent = "\u25BE";
            }
        };
    });
}

// ---- LEADERBOARD OVERLAY ----
let _lbTab = "month"; // "month" or "all"
let _lbRankType = "levels"; // "levels" or "points"
let _lbCountdownTimer = null;

function getMonthCountdown() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = nextMonth - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${mins}m`;
}

function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const colors = ["#e74c3c","#3498db","#2ecc71","#9b59b6","#f39c12","#1abc9c","#e67e22","#e84393","#00b894","#6c5ce7"];
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

function renderAvatar(avatarData, name, size) {
    size = size || 34;
    var s = 'width:' + size + 'px;height:' + size + 'px;';
    if (avatarData && avatarData.startsWith('emoji:')) {
        var key = avatarData.substring(6);
        var emoji = AVATAR_EMOJI[key] || '\u2753';
        return '<div class="lb-avatar" style="background:' + getAvatarColor(name) + ';' + s + 'font-size:' + Math.round(size * 0.55) + 'px">' + emoji + '</div>';
    }
    if (avatarData && avatarData.startsWith('data:image')) {
        return '<img class="lb-avatar" src="' + avatarData + '" style="' + s + 'object-fit:cover" alt="">';
    }
    var initials = getInitials(name);
    var fontSize = size < 40 ? 13 : Math.round(size * 0.35);
    return '<div class="lb-avatar" style="background:' + getAvatarColor(name) + ';' + s + 'font-size:' + fontSize + 'px">' + initials + '</div>';
}

function renderLeaderboard() {
    if (_lbCountdownTimer) { clearInterval(_lbCountdownTimer); _lbCountdownTimer = null; }

    let overlay = document.getElementById("leaderboard-overlay");
    if (!state.showLeaderboard) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "leaderboard-overlay";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "leaderboard-overlay";
    overlay.style.display = "flex";

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const monthLabel = monthNames[now.getMonth()] + " " + now.getFullYear();
    const accent = (typeof theme !== "undefined" && theme.accent) ? theme.accent : "#f4a535";

    overlay.innerHTML = `
        <div class="lb-header">
            <button class="lb-back-btn" id="lb-close-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div class="lb-trophy">\uD83C\uDFC6</div>
            <h2 class="lb-title">LEADERBOARDS</h2>
            <div class="lb-month-info">
                <span>${monthLabel}</span>
                <span>\u00b7</span>
                <span class="lb-countdown" id="lb-countdown">Resets in ${getMonthCountdown()}</span>
            </div>
            <div class="lb-tabs">
                <button class="lb-tab${_lbTab === "month" ? " lb-tab-active" : ""}" id="lb-tab-month" style="--tab-accent:${accent}">This Month</button>
                <button class="lb-tab${_lbTab === "all" ? " lb-tab-active" : ""}" id="lb-tab-all" style="--tab-accent:${accent}">All Time</button>
            </div>
            <div class="lb-rank-type-toggle" style="--tab-accent:${accent}">
                <button class="lb-rank-type-btn${_lbRankType === "levels" ? " active" : ""}" id="lb-type-levels" style="--tab-accent:${accent}">By Levels</button>
                <button class="lb-rank-type-btn${_lbRankType === "points" ? " active" : ""}" id="lb-type-points" style="--tab-accent:${accent}">By Points</button>
            </div>
        </div>
        <div class="menu-scroll" id="lb-list" style="text-align:center;padding:16px 0">
            <div class="lb-loading"><div class="lb-loading-dot"></div><div class="lb-loading-dot"></div><div class="lb-loading-dot"></div></div>
        </div>
    `;

    // Countdown timer
    _lbCountdownTimer = setInterval(() => {
        const el = document.getElementById("lb-countdown");
        if (el) el.textContent = "Resets in " + getMonthCountdown();
        else { clearInterval(_lbCountdownTimer); _lbCountdownTimer = null; }
    }, 60000);

    document.getElementById("lb-close-btn").onclick = () => {
        state.showLeaderboard = false;
        if (_lbCountdownTimer) { clearInterval(_lbCountdownTimer); _lbCountdownTimer = null; }
        if (state.showHome) {
            renderLeaderboard();
            renderHome();
        } else {
            renderAll();
        }
    };
    document.getElementById("lb-tab-month").onclick = () => { _lbTab = "month"; renderLeaderboard(); };
    document.getElementById("lb-tab-all").onclick = () => { _lbTab = "all"; renderLeaderboard(); };
    document.getElementById("lb-type-levels").onclick = () => { _lbRankType = "levels"; renderLeaderboard(); };
    document.getElementById("lb-type-points").onclick = () => { _lbRankType = "points"; renderLeaderboard(); };

    const currentUser = typeof getUser === "function" ? getUser() : null;
    const currentUserId = currentUser ? currentUser.id : null;
    const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
    const isMonthly = _lbTab === "month";
    const byPoints = _lbRankType === "points";
    let url = "/api/leaderboard?top=50";
    if (isMonthly) url += "&period=month";
    if (byPoints) url += "&rankType=points";

    fetch(url)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(leaders => {
            const list = document.getElementById("lb-list");
            if (!list) return;
            if (leaders.length === 0) {
                let emptyVis = "";
                if (currentUserId && typeof getUser === "function") {
                    const u = getUser();
                    const isVisible = u && u.showOnLeaderboard !== false;
                    emptyVis = `<div class="lb-vis-toggle"><label class="lb-vis-label"><input type="checkbox" id="lb-vis-cb" ${isVisible ? "checked" : ""} style="width:18px;height:18px;accent-color:${accent};cursor:pointer"> Show me on leaderboard</label></div>`;
                }
                list.innerHTML = `<div style="opacity:0.5;padding:40px 0;font-size:15px">${isMonthly ? "No progress this month yet \u2014 start climbing!" : "No players yet \u2014 be the first!"}</div>${emptyVis}`;
                const visCb = document.getElementById("lb-vis-cb");
                if (visCb) {
                    visCb.onchange = async () => {
                        try {
                            await setLeaderboardVisibility(visCb.checked);
                            showToast(visCb.checked ? "Shown on leaderboard" : "Hidden from leaderboard");
                            renderLeaderboard();
                        } catch (e) {
                            visCb.checked = !visCb.checked;
                            showToast("Failed to update", "#ff8888");
                        }
                    };
                }
                return;
            }
            let topHtml = "";
            let restHtml = "";
            if (isMonthly) {
                topHtml += `<div class="lb-period-label">${monthLabel}</div>`;
            }
            // Find user's index so we can mark a scroll anchor a few rows above
            const meIndex = leaders.findIndex(l => l.userId === currentUserId);
            const scrollAnchorIndex = meIndex > 3 ? Math.max(3, meIndex - 3) : -1;

            leaders.forEach((entry, i) => {
                const isMe = entry.userId === currentUserId;
                const medal = i < 3 ? medals[i] : "";
                const isTop3 = i < 3;
                const avatarColor = getAvatarColor(entry.name);
                const initials = getInitials(entry.name);

                let scoreText;
                if (byPoints) {
                    scoreText = isMonthly
                        ? "+" + (entry.monthlyCoinsGain || 0).toLocaleString() + " pts"
                        : (entry.totalCoinsEarned || 0).toLocaleString() + " pts";
                } else {
                    scoreText = isMonthly
                        ? "+" + entry.monthlyGain.toLocaleString() + " levels"
                        : "+" + entry.highestLevel.toLocaleString() + " levels";
                }

                const anchorId = (i === scrollAnchorIndex) ? 'id="lb-scroll-anchor"' : "";
                const meId = isMe ? 'id="lb-me-row"' : "";
                const rowId = anchorId || meId;

                const row = `
                    <div class="lb-row${isMe ? " lb-me" : ""}${isTop3 ? " lb-top3" : ""}" ${rowId} style="animation-delay:${i * 40}ms">
                        <span class="lb-rank${isTop3 ? " lb-rank-top" : ""}">${medal || (i + 1)}</span>
                        ${renderAvatar(entry.avatarData, entry.name, 34)}
                        <span class="lb-name">${escapeHtml(entry.name || "???")}</span>
                        <span class="lb-score" style="background:${isTop3 ? accent : "rgba(255,255,255,0.08)"};color:${isTop3 ? "#000" : accent}">${scoreText}</span>
                    </div>
                `;
                if (isTop3) topHtml += row;
                else restHtml += row;
            });

            if (currentUserId && !leaders.some(l => l.userId === currentUserId)) {
                const user = typeof getUser === "function" ? getUser() : null;
                if (user && user.showOnLeaderboard === false) {
                    restHtml += `<div class="lb-you-hint">You're hidden from the leaderboard</div>`;
                } else {
                    restHtml += `<div class="lb-you-hint">Keep climbing to join the leaderboard!</div>`;
                }
            }

            // Visibility toggle for signed-in users
            let visToggle = "";
            if (currentUserId && typeof getUser === "function") {
                const u = getUser();
                const isVisible = u && u.showOnLeaderboard !== false;
                visToggle = `<div class="lb-vis-toggle"><label class="lb-vis-label"><input type="checkbox" id="lb-vis-cb" ${isVisible ? "checked" : ""} style="width:18px;height:18px;accent-color:${accent};cursor:pointer"> Show me on leaderboard</label></div>`;
            }

            list.style.textAlign = "left";
            // Top 3 sticky, rest scrollable
            if (leaders.length > 3) {
                list.innerHTML = `<div class="lb-sticky-top">${topHtml}</div><div class="lb-divider"></div><div class="lb-rest" id="lb-rest">${restHtml}${visToggle}</div>`;
            } else {
                list.innerHTML = topHtml + restHtml + visToggle;
            }

            // Auto-scroll: position user's row just below the sticky top-3
            // Use rAF to set scroll before first paint (avoids visible flash)
            requestAnimationFrame(() => {
                const meRow = document.getElementById("lb-me-row");
                const sticky = list.querySelector(".lb-sticky-top");
                if (meRow && sticky) {
                    const stickyBottom = sticky.getBoundingClientRect().bottom;
                    const meTop = meRow.getBoundingClientRect().top;
                    const scrollNeeded = meTop - stickyBottom - 4;
                    if (scrollNeeded > 4) {
                        list.scrollTop += scrollNeeded;
                    }
                }
            });

            // Visibility toggle handler
            const visCb = document.getElementById("lb-vis-cb");
            if (visCb) {
                visCb.onchange = async () => {
                    try {
                        await setLeaderboardVisibility(visCb.checked);
                        showToast(visCb.checked ? "Shown on leaderboard" : "Hidden from leaderboard");
                        renderLeaderboard();
                    } catch (e) {
                        visCb.checked = !visCb.checked;
                        showToast("Failed to update", "#ff8888");
                    }
                };
            }
        })
        .catch(() => {
            const list = document.getElementById("lb-list");
            if (list) list.innerHTML = `<div style="opacity:0.5;padding:40px 0;font-size:15px">Unavailable offline</div>`;
        });
}

function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
}

// ---- DISPLAY NAME PROMPT ----
function renderProfileEditChooser() {
    let overlay = document.getElementById("profile-chooser-overlay");
    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.id = "profile-chooser-overlay";
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    document.getElementById("app").appendChild(overlay);

    overlay.innerHTML = `
        <div class="modal-box" style="max-width:280px">
            <h3 style="color:${theme.accent};margin-bottom:16px">Edit Profile</h3>
            <div style="display:flex;flex-direction:column;gap:10px">
                <button id="profile-choose-avatar" class="menu-setting-btn" style="padding:12px;font-size:14px;background:rgba(255,255,255,0.1);color:${theme.text};border:1px solid ${theme.accent}40;border-radius:8px">Change Avatar</button>
                <button id="profile-choose-name" class="menu-setting-btn" style="padding:12px;font-size:14px;background:rgba(255,255,255,0.1);color:${theme.text};border:1px solid ${theme.accent}40;border-radius:8px">Change Name</button>
            </div>
        </div>
    `;

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });

    document.getElementById("profile-choose-avatar").onclick = () => {
        overlay.remove();
        renderAvatarEditor();
    };

    document.getElementById("profile-choose-name").onclick = () => {
        overlay.remove();
        renderDisplayNamePrompt();
    };
}

function renderDisplayNamePrompt() {
    let overlay = document.getElementById("name-prompt-overlay");
    if (overlay) overlay.remove();

    const currentUser = typeof getUser === "function" ? getUser() : null;
    const hasName = currentUser && currentUser.displayName;

    overlay = document.createElement("div");
    overlay.id = "name-prompt-overlay";
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    document.getElementById("app").appendChild(overlay);

    overlay.innerHTML = `
        <div class="modal-box" style="max-width:320px">
            <h3 style="color:${theme.accent};margin-bottom:12px">${hasName ? "Change Display Name" : "Choose a Display Name"}</h3>
            <p style="font-size:13px;opacity:0.6;margin-bottom:16px">${hasName ? "Update your name on the leaderboard" : "Pick a name to identify yourself (3-20 chars, letters/numbers/spaces)"}</p>
            <input type="text" id="name-prompt-input" maxlength="20" placeholder="Your name" value="${hasName ? escapeHtml(currentUser.displayName) : ""}" style="width:100%;padding:10px;border-radius:8px;border:1px solid ${theme.accent}40;background:rgba(255,255,255,0.1);color:${theme.text};font-size:16px;outline:none;box-sizing:border-box">
            <div style="display:flex;gap:8px;margin-top:12px">
                ${hasName ? `<button id="name-prompt-cancel" class="menu-setting-btn" style="flex:1;background:rgba(255,255,255,0.1);color:${theme.text};padding:10px 0">Cancel</button>` : ""}
                <button id="name-prompt-save" class="menu-setting-btn" style="flex:1;background:${theme.accent};color:#000;padding:10px 0">Save</button>
            </div>
            <div id="name-prompt-error" style="color:#ff8888;font-size:12px;margin-top:8px;display:none"></div>
        </div>
    `;

    const input = document.getElementById("name-prompt-input");
    const errorEl = document.getElementById("name-prompt-error");

    const cancelBtn = document.getElementById("name-prompt-cancel");
    if (cancelBtn) cancelBtn.onclick = () => overlay.remove();

    document.getElementById("name-prompt-save").onclick = async () => {
        const name = input.value.trim();
        if (name.length < 3 || name.length > 20) {
            errorEl.textContent = "Name must be 3-20 characters";
            errorEl.style.display = "block";
            return;
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
            errorEl.textContent = "Letters, numbers, and spaces only";
            errorEl.style.display = "block";
            return;
        }
        try {
            await setDisplayName(name);
            overlay.remove();
            showToast("Name saved!");
            renderMenu();
        } catch (e) {
            errorEl.textContent = e.message || "Failed to save";
            errorEl.style.display = "block";
        }
    };

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") document.getElementById("name-prompt-save").click();
    });

    input.focus();
}

// ---- AVATAR EDITOR ----
function renderAvatarEditor(options) {
    options = options || {};
    let overlay = document.getElementById("avatar-editor-overlay");
    if (overlay) overlay.remove();

    const currentUser = options.targetUser || (typeof getUser === "function" ? getUser() : null);
    const accent = theme.accent;
    let selectedTab = "emoji";
    let selectedEmoji = null;
    let cropper = null;
    let cameraStream = null;
    let cropperReady = false;

    if (currentUser && currentUser.avatarData && currentUser.avatarData.startsWith("emoji:")) {
        selectedEmoji = currentUser.avatarData.substring(6);
    }

    overlay = document.createElement("div");
    overlay.id = "avatar-editor-overlay";
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    document.getElementById("app").appendChild(overlay);

    function cleanup() {
        if (cropper) { cropper.destroy(); cropper = null; cropperReady = false; }
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
    }

    function closeEditor() {
        cleanup();
        overlay.remove();
        if (options.onClose) { options.onClose(); }
        else { state.showMenu = true; renderMenu(); }
    }

    function render() {
        cleanup();

        let content = '';

        content += '<div class="avatar-editor-tabs" style="--tab-accent:' + accent + '">';
        content += '<button class="avatar-editor-tab' + (selectedTab === "emoji" ? " active" : "") + '" data-tab="emoji">Presets</button>';
        content += '<button class="avatar-editor-tab' + (selectedTab === "upload" ? " active" : "") + '" data-tab="upload">Upload</button>';
        content += '<button class="avatar-editor-tab' + (selectedTab === "camera" ? " active" : "") + '" data-tab="camera">Camera</button>';
        content += '</div>';

        if (selectedTab === "emoji") {
            content += '<div class="avatar-emoji-grid">';
            Object.keys(AVATAR_EMOJI).forEach(function(key) {
                content += '<div class="avatar-emoji-option' + (selectedEmoji === key ? ' selected' : '') + '" data-emoji="' + key + '" style="background:' + getAvatarColor(currentUser?.displayName) + ';--tab-accent:' + accent + '">' + AVATAR_EMOJI[key] + '</div>';
            });
            content += '</div>';
        } else if (selectedTab === "upload") {
            content += '<div id="avatar-upload-area" style="text-align:center;padding:16px 0">';
            content += '<div id="avatar-cropper-wrap" style="display:none"><div class="avatar-cropper-container"><img id="avatar-crop-img"></div>';
            content += '<div class="avatar-zoom-controls"><button class="avatar-zoom-btn" id="avatar-zoom-out">\u2212</button><input type="range" id="avatar-zoom-slider" class="avatar-zoom-slider" min="0.1" max="3" step="0.05" value="1"><button class="avatar-zoom-btn" id="avatar-zoom-in">+</button></div>';
            content += '<div class="avatar-preview-row"><span style="opacity:0.5;font-size:12px">Preview:</span><div id="avatar-crop-preview" style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:2px solid ' + accent + '"></div></div></div>';
            content += '<label style="display:inline-block;padding:10px 20px;background:' + accent + ';color:#000;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px">Choose Photo<input type="file" id="avatar-file-input" accept="image/jpeg,image/png,image/webp" style="display:none"></label>';
            content += '<div style="font-size:11px;opacity:0.4;margin-top:8px">JPEG, PNG or WebP \u00b7 Max 5MB</div>';
            content += '</div>';
        } else if (selectedTab === "camera") {
            content += '<div id="avatar-camera-area" style="text-align:center;padding:8px 0">';
            content += '<div id="avatar-camera-preview" style="width:100%;max-height:250px;border-radius:12px;overflow:hidden;background:#000;margin-bottom:8px"><video id="avatar-camera-video" autoplay playsinline style="width:100%;display:block;transform:scaleX(-1)"></video></div>';
            content += '<div style="display:flex;gap:8px;justify-content:center;margin:8px 0">';
            content += '<button id="avatar-camera-capture" class="menu-setting-btn" style="background:' + accent + ';color:#000;padding:10px 24px;font-size:14px">Capture</button>';
            content += '<button id="avatar-camera-flip" class="menu-setting-btn" style="background:rgba(255,255,255,0.1);color:#fff;padding:10px 16px;font-size:14px">Flip</button>';
            content += '</div>';
            content += '<div id="avatar-camera-cropper-wrap" style="display:none"><div class="avatar-cropper-container"><img id="avatar-camera-crop-img"></div>';
            content += '<div class="avatar-zoom-controls"><button class="avatar-zoom-btn" id="avatar-cam-zoom-out">\u2212</button><input type="range" id="avatar-cam-zoom-slider" class="avatar-zoom-slider" min="0.1" max="3" step="0.05" value="1"><button class="avatar-zoom-btn" id="avatar-cam-zoom-in">+</button></div>';
            content += '<div class="avatar-preview-row"><span style="opacity:0.5;font-size:12px">Preview:</span><div id="avatar-cam-crop-preview" style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:2px solid ' + accent + '"></div></div></div>';
            content += '</div>';
        }

        content += '<div style="display:flex;gap:8px;margin-top:12px">';
        if (currentUser && currentUser.avatarData) {
            content += '<button id="avatar-remove-btn" class="menu-setting-btn" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3);flex:0 0 auto;padding:8px 12px;font-size:13px">Remove</button>';
        }
        content += '<button id="avatar-cancel-btn" class="menu-setting-btn" style="background:rgba(255,255,255,0.08);color:#fff;flex:1;padding:8px 0;font-size:13px">Cancel</button>';
        content += '<button id="avatar-save-btn" class="menu-setting-btn" style="background:' + accent + ';color:#000;flex:1;padding:8px 0;font-size:13px;font-weight:700">Save</button>';
        content += '</div>';

        overlay.innerHTML = '<div class="modal-box" style="max-width:340px;max-height:90vh;overflow-y:auto">' +
            '<h3 style="color:' + accent + ';margin-bottom:12px">Choose Avatar</h3>' + content + '</div>';

        // Wire tabs
        overlay.querySelectorAll(".avatar-editor-tab").forEach(function(btn) {
            btn.onclick = function() { selectedTab = btn.dataset.tab; render(); initTabContent(); };
        });

        // Wire emoji
        overlay.querySelectorAll(".avatar-emoji-option").forEach(function(opt) {
            opt.onclick = function() {
                selectedEmoji = opt.dataset.emoji;
                overlay.querySelectorAll(".avatar-emoji-option").forEach(function(o) { o.classList.remove("selected"); });
                opt.classList.add("selected");
            };
        });

        // Wire cancel
        var cancelBtn = document.getElementById("avatar-cancel-btn");
        if (cancelBtn) cancelBtn.onclick = closeEditor;

        // Wire remove
        var removeBtn = document.getElementById("avatar-remove-btn");
        if (removeBtn) {
            removeBtn.onclick = async function() {
                try {
                    if (options.onSave) { await options.onSave(null); }
                    else { await deleteAvatar(); }
                    showToast("Avatar removed");
                    closeEditor();
                } catch (e) { showToast("Failed to remove", "#ff8888"); }
            };
        }

        // Wire save
        var saveBtn = document.getElementById("avatar-save-btn");
        if (saveBtn) saveBtn.onclick = saveAvatar;
    }

    async function saveAvatar() {
        var avatarData = null;
        if (selectedTab === "emoji" && selectedEmoji) {
            avatarData = "emoji:" + selectedEmoji;
        } else if ((selectedTab === "upload" || selectedTab === "camera") && cropper && cropperReady) {
            var canvas = cropper.getCroppedCanvas({ width: 256, height: 256, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
            avatarData = canvas.toDataURL('image/jpeg', 0.85);
        }
        if (!avatarData) { showToast("Select an avatar first", "#ff8888"); return; }
        try {
            if (options.onSave) { await options.onSave(avatarData); }
            else { await setAvatar(avatarData); }
            showToast("Avatar saved!");
            closeEditor();
        } catch (e) { showToast(e.message || "Failed to save", "#ff8888"); }
    }

    function initTabContent() {
        if (selectedTab === "upload") initUploadTab();
        if (selectedTab === "camera") initCameraTab();
    }

    function initUploadTab() {
        var fileInput = document.getElementById("avatar-file-input");
        if (!fileInput) return;
        fileInput.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) { showToast("Image too large (max 5MB)", "#ff8888"); return; }
            var reader = new FileReader();
            reader.onload = function(ev) { loadImageIntoCropper(ev.target.result, "avatar-crop-img", "avatar-cropper-wrap", "avatar-crop-preview", "avatar-zoom-slider", "avatar-zoom-in", "avatar-zoom-out"); };
            reader.readAsDataURL(file);
        };
    }

    var currentFacingMode = 'user';

    function initCameraTab() {
        startCamera();
        var captureBtn = document.getElementById("avatar-camera-capture");
        var flipBtn = document.getElementById("avatar-camera-flip");
        if (captureBtn) captureBtn.onclick = capturePhoto;
        if (flipBtn) flipBtn.onclick = function() { currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'; startCamera(); };
    }

    function startCamera() {
        if (cameraStream) { cameraStream.getTracks().forEach(function(t) { t.stop(); }); }
        var video = document.getElementById("avatar-camera-video");
        if (!video) return;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } })
            .then(function(stream) { cameraStream = stream; video.srcObject = stream; })
            .catch(function() { showToast("Camera not available", "#ff8888"); });
    }

    function capturePhoto() {
        var video = document.getElementById("avatar-camera-video");
        if (!video || !video.videoWidth) return;
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var ctx = canvas.getContext('2d');
        if (currentFacingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        if (cameraStream) { cameraStream.getTracks().forEach(function(t) { t.stop(); }); cameraStream = null; }
        var videoWrap = document.getElementById("avatar-camera-preview");
        if (videoWrap) videoWrap.style.display = "none";
        var captureBtn = document.getElementById("avatar-camera-capture");
        var flipBtn = document.getElementById("avatar-camera-flip");
        if (captureBtn) captureBtn.style.display = "none";
        if (flipBtn) flipBtn.style.display = "none";
        var dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        loadImageIntoCropper(dataUrl, "avatar-camera-crop-img", "avatar-camera-cropper-wrap", "avatar-cam-crop-preview", "avatar-cam-zoom-slider", "avatar-cam-zoom-in", "avatar-cam-zoom-out");
    }

    function loadImageIntoCropper(dataUrl, imgId, wrapId, previewId, sliderId, zoomInId, zoomOutId) {
        var tempImg = new Image();
        tempImg.onload = function() {
            var maxDim = 2048;
            var w = tempImg.width, h = tempImg.height;
            if (w > maxDim || h > maxDim) {
                var scale = maxDim / Math.max(w, h);
                var c = document.createElement('canvas');
                c.width = Math.round(w * scale);
                c.height = Math.round(h * scale);
                c.getContext('2d').drawImage(tempImg, 0, 0, c.width, c.height);
                dataUrl = c.toDataURL('image/jpeg', 0.95);
            }
            initCropperInstance(dataUrl, imgId, wrapId, previewId, sliderId, zoomInId, zoomOutId);
        };
        tempImg.src = dataUrl;
    }

    function initCropperInstance(dataUrl, imgId, wrapId, previewId, sliderId, zoomInId, zoomOutId) {
        if (!document.getElementById("cropperjs-css")) {
            var link = document.createElement("link");
            link.id = "cropperjs-css";
            link.rel = "stylesheet";
            link.href = "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css";
            document.head.appendChild(link);
        }

        function start() {
            var wrap = document.getElementById(wrapId);
            var img = document.getElementById(imgId);
            if (!wrap || !img) return;
            wrap.style.display = "block";
            img.src = dataUrl;
            if (cropper) cropper.destroy();
            cropperReady = false;
            cropper = new Cropper(img, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                cropBoxMovable: false,
                cropBoxResizable: false,
                minCropBoxWidth: 100,
                minCropBoxHeight: 100,
                checkOrientation: true,
                zoomOnWheel: true,
                wheelZoomRatio: 0.1,
                zoomOnTouch: true,
                ready: function() {
                    cropperReady = true;
                    updateCropPreview(previewId);
                    // Apply circular mask
                    var vb = wrap.querySelector('.cropper-view-box');
                    var fc = wrap.querySelector('.cropper-face');
                    if (vb) vb.style.borderRadius = '50%';
                    if (fc) fc.style.borderRadius = '50%';
                },
                crop: function() { updateCropPreview(previewId); }
            });

            var slider = document.getElementById(sliderId);
            var zoomIn = document.getElementById(zoomInId);
            var zoomOut = document.getElementById(zoomOutId);
            if (slider) slider.oninput = function() { if (cropper) cropper.zoomTo(parseFloat(slider.value)); };
            if (zoomIn) zoomIn.onclick = function() { if (cropper) cropper.zoom(0.1); };
            if (zoomOut) zoomOut.onclick = function() { if (cropper) cropper.zoom(-0.1); };
        }

        if (typeof Cropper === 'undefined') {
            var script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js";
            script.onload = start;
            document.head.appendChild(script);
        } else {
            start();
        }
    }

    function updateCropPreview(previewId) {
        if (!cropper || !cropperReady) return;
        try {
            var canvas = cropper.getCroppedCanvas({ width: 60, height: 60, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
            var previewEl = document.getElementById(previewId);
            if (previewEl && canvas) {
                previewEl.innerHTML = '';
                previewEl.appendChild(canvas);
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.borderRadius = '50%';
            }
        } catch (e) { /* cropper not ready yet */ }
    }

    render();
    initTabContent();
}

// ============================================================
// INITIALIZE
// ============================================================
async function loadDefinitions() {
    try {
        const resp = await fetch('/data/definitions.json?v=1');
        if (resp.ok) DEFINITIONS = await resp.json();
    } catch (e) { /* offline before first cache — definitions unavailable */ }
}

async function loadBannedWords() {
    try {
        const cached = localStorage.getItem("wordplay-banned");
        if (cached) {
            const { words, ts } = JSON.parse(cached);
            if (Date.now() - ts < 3600000) { // 1 hour TTL
                _bannedWords = new Set(words);
                return;
            }
        }
        const resp = await fetch('/api/banned-words');
        if (resp.ok) {
            const words = await resp.json();
            _bannedWords = new Set(words);
            localStorage.setItem("wordplay-banned", JSON.stringify({ words, ts: Date.now() }));
        }
    } catch (e) { /* offline, no cache — no filtering */ }
}

async function loadMyVotes() {
    if (typeof isSignedIn !== "function" || !isSignedIn()) return;
    try {
        const resp = await fetch('/api/word-votes/mine', { headers: getAuthHeaders() });
        if (resp.ok) {
            const words = await resp.json();
            _myWordVotes = new Set(words);
        }
    } catch (e) { /* offline — votes unavailable */ }
}

async function init() {
    // Show loading state
    const app = document.getElementById("app");
    app.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#fef3e0;font-family:Nunito,system-ui,sans-serif;font-size:18px">
        <div style="text-align:center"><div style="font-size:48px;margin-bottom:16px">🎮</div>Loading levels...</div></div>`;
    app.style.background = "linear-gradient(170deg, #0f0520, #2d1b4e, #8b2252)";

    // Initialize level loader + background manifest
    if (typeof initLevelLoader === "function") {
        await initLevelLoader();
    }
    await loadBgManifest();

    loadProgress();
    checkLoginStreak();

    // Auth init + sync pull
    if (typeof initAuth === "function") initAuth();
    if (typeof isSignedIn === "function" && isSignedIn()) {
        const uid = getUser()?.id;
        const lastUid = localStorage.getItem("wordplay-last-uid");

        // Safety net: if the signed-in user doesn't match the last-known user,
        // clear local save to prevent cross-user data contamination (can happen
        // if handlePostSignIn didn't complete, e.g. app closed during sign-in)
        if (lastUid && uid && String(lastUid) !== String(uid)) {
            localStorage.removeItem("wordplay-save");
            resetStateToDefaults();
            localStorage.setItem("wordplay-last-uid", String(uid));
        }

        // Seed last-uid so post-update sign-in doesn't falsely detect a user switch
        if (uid && !lastUid) {
            localStorage.setItem("wordplay-last-uid", String(uid));
        }
        if (typeof syncPull === "function") {
            await syncPull();
            loadProgress(); // re-load after merge
        }
    }

    await loadBannedWords(); // must complete before recompute — filtering depends on it
    loadMyVotes(); // non-blocking — only affects definition modal UI
    await recompute();
    loadDefinitions(); // non-blocking, no await — definitions load in background
    restoreLevelState();

    // Auto-complete any words whose cells are all already visible (fixes stuck levels)
    while (checkAutoCompleteWords()) {}
    if (state.foundWords.length === totalRequired && state.currentLevel >= state.highestLevel) {
        delete state.inProgress[state.currentLevel];
    }
    saveProgress();

    // Build the UI — start on home screen
    app.innerHTML = "";
    state.showHome = true;
    renderHome();

    // In-app browser banner
    if (window._inAppBrowser && !window.matchMedia('(display-mode: standalone)').matches && !sessionStorage.getItem('inapp-dismissed')) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const browserName = isIOS ? 'Safari' : 'Chrome';
        const banner = document.createElement('div');
        banner.className = 'inapp-banner';
        banner.id = 'inapp-banner';
        banner.innerHTML = `<div class="inapp-banner-text">For the best experience, open in <strong>${browserName}</strong>. Tap <strong>\u22EF</strong> \u2192 <strong>Open in Browser</strong></div><button class="inapp-banner-close" id="inapp-close">\u2715</button>`;
        app.prepend(banner);
        document.getElementById('inapp-close').onclick = () => {
            banner.remove();
            sessionStorage.setItem('inapp-dismissed', '1');
        };
    }

    // Warm up AudioContext on first user gesture (silent)
    const _warmAudio = () => {
        const ctx = getAudioCtx();
        // Play a silent buffer to unlock audio without an audible pop
        const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
        document.removeEventListener("touchstart", _warmAudio);
        document.removeEventListener("mousedown", _warmAudio);
    };
    document.addEventListener("touchstart", _warmAudio, { once: true });
    document.addEventListener("mousedown", _warmAudio, { once: true });

    // Cancel pick mode when clicking outside grid/target button
    document.addEventListener("click", (e) => {
        if (!state.pickMode) return;
        if (e.target.closest(".grid-cell") || e.target.closest("#target-btn")) return;
        cancelPickMode();
    });

    // Handle resize
    window.addEventListener("resize", () => {
        if (!state.showHome) {
            renderGrid();
            renderWheel();
        }
    });
}

// Start
document.addEventListener("DOMContentLoaded", () => init());
