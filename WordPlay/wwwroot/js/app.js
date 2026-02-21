// ============================================================
// WordPlay — Main Application (Vanilla JS)
// ============================================================

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

// ---- STATE ----
const state = {
    currentLevel: 1,       // Actual level number (1-based)
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
    levelHistory: {},      // { levelNum: [foundWords] } — answers for completed levels
    inProgress: {},        // { levelNum: { fw, bf, rc } } — partial progress for incomplete levels
    lastDailyClaim: null,  // date string of last daily coin claim
    // Transient
    showMenu: false,
    showComplete: false,
    showMap: false,
    loading: false,
    pickMode: false,       // target-hint: user taps a cell to reveal it
    soundEnabled: true,    // sound effects on/off
};

// ---- MAP STATE ----
let _mapExpandedPacks = {};       // { "group/pack": true }
let _mapAutoExpanded = false;     // only auto-expand the active pack once per open
let _mapHasScrolled = false;      // only auto-scroll to current level on first render
let _mapScrollTarget = null;      // pack key to scroll to after toggle
const PACK_MAX_EXPANDABLE = 100;  // giant packs won't expand to show nodes

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

function getDisplayLevel() {
    return state.currentLevel;
}

async function recompute() {
    // Try dynamic loader first, fall back to built-in
    let lvData = null;
    if (typeof getLevel === "function") {
        lvData = await getLevel(state.currentLevel);
    }
    // Fallback: old static array (0-based index)
    if (!lvData && typeof ALL_LEVELS !== "undefined") {
        const idx = state.currentLevel - 1; // convert 1-based to 0-based
        if (idx >= 0 && idx < ALL_LEVELS.length) {
            lvData = ALL_LEVELS[idx];
        } else {
            lvData = ALL_LEVELS[0];
        }
    }
    if (!lvData) {
        console.error("No level data for level", state.currentLevel);
        return;
    }
    level = lvData;
    theme = THEMES[level.theme] || THEMES.sunrise;

    // Determine grid words vs bonus words
    const gridWords = level.words;

    crossword = generateCrosswordGrid(gridWords);
    placedWords = crossword.placements.map(p => p.word);
    // Words that couldn't be placed in the crossword become bonus
    const overflow = gridWords.filter(w => !placedWords.includes(w));
    bonusPool = [...(level.bonus || []), ...overflow];
    totalRequired = placedWords.length;
    rebuildWheelLetters();
    // Preload next chunk
    if (typeof preloadAround === "function") preloadAround(state.currentLevel);
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

// ---- PERSISTENCE ----
// Migrate old save key from pre-rename
const _oldSave = localStorage.getItem("wordscapes-save");
if (_oldSave && !localStorage.getItem("wordplay-save")) {
    localStorage.setItem("wordplay-save", _oldSave);
    localStorage.removeItem("wordscapes-save");
}

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
            state.foundWords = d.fw || [];
            state.bonusFound = d.bf || [];
            state.coins = d.co ?? 50;
            state.bonusCounter = d.bc || 0;
            state.revealedCells = d.rc || [];
            state.freeHints = d.fh || 0;
            state.freeTargets = d.ft || 0;
            state.freeRockets = d.fr || 0;
            state.levelsCompleted = d.lc || 0;
            state.levelHistory = d.lh || {};
            state.inProgress = d.ip || {};
            state.lastDailyClaim = d.ldc || null;
            state.soundEnabled = d.se !== undefined ? d.se : true;
        }
    } catch (e) { /* ignore */ }
}

function saveProgress() {
    try {
        localStorage.setItem("wordplay-save", JSON.stringify({
            v: 3,  // format version
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
            lh: state.levelHistory,
            ip: state.inProgress,
            ldc: state.lastDailyClaim,
            se: state.soundEnabled,
        }));
    } catch (e) { /* ignore */ }
}

function saveInProgressState() {
    const lv = state.currentLevel;
    if (state.foundWords.length > 0 || state.revealedCells.length > 0 || state.bonusFound.length > 0) {
        state.inProgress[lv] = {
            fw: [...state.foundWords],
            bf: [...state.bonusFound],
            rc: [...state.revealedCells],
        };
    }
}

function restoreLevelState() {
    const lv = state.currentLevel;
    // Completed levels take priority
    if (state.levelHistory[lv]) {
        state.foundWords = placedWords.filter(w => state.levelHistory[lv].includes(w));
        state.bonusFound = [];
        state.revealedCells = [];
        delete state.inProgress[lv];
        return;
    }
    // Restore partial progress
    const ip = state.inProgress[lv];
    if (ip) {
        state.foundWords = (ip.fw || []).filter(w => placedWords.includes(w));
        state.bonusFound = ip.bf || [];
        state.revealedCells = ip.rc || [];
        // Auto-complete any words whose cells are all now visible
        while (checkAutoCompleteWords()) {}
        return;
    }
    // Legacy: level completed before history tracking
    if (lv < state.highestLevel) {
        state.foundWords = [...placedWords];
        state.levelHistory[lv] = [...placedWords];
    }
}

// ---- TOAST ----
let toastTimer = null;
function showToast(msg, color, fast, bg) {
    if (toastTimer) clearTimeout(toastTimer);
    const el = document.getElementById("toast");
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
function handleWord(word) {
    const w = word.toUpperCase();

    if (state.foundWords.includes(w) || state.bonusFound.includes(w)) {
        showToast("Already found", "rgba(255,255,255,0.5)", true);
        return;
    }
    if (placedWords.includes(w)) {
        state.foundWords.push(w);
        // Auto-complete any crossing words whose cells are all now visible
        while (checkAutoCompleteWords()) {}
        state.coins += 1;
        saveProgress();
        renderGrid();
        highlightWord(w);
        playSound("wordFound");
        renderWordCount();
        renderCoins();
        renderHintBtn();
        renderTargetBtn();
        renderRocketBtn();
        renderSpinBtn();
        if (state.foundWords.length === totalRequired) {
            state.levelHistory[state.currentLevel] = [...state.foundWords];
            delete state.inProgress[state.currentLevel];
            saveProgress();
            setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
        }
        return;
    }
    if (bonusPool && bonusPool.includes(w)) {
        playSound("bonusChime");
        state.bonusFound.push(w);
        state.coins += 5;
        state.bonusCounter++;
        if (state.bonusCounter >= 10) {
            state.bonusCounter = 0;
            renderBonusStar();
            // Auto-reveal a random letter as reward
            const cell = pickRandomUnrevealedCell();
            if (cell) {
                state.revealedCells.push(cell);
                checkAutoCompleteWords();
                saveProgress();
                renderGrid();
                renderCoins();
                renderWordCount();
                renderHintBtn();
                renderTargetBtn();
                renderRocketBtn();
                renderSpinBtn();
                showToast("⭐ Bonus Reward! Free letter!", theme.accent);
                // Delayed flash so the grid renders first
                setTimeout(() => flashHintCell(cell), 100);
                if (state.foundWords.length === totalRequired) {
                    state.levelHistory[state.currentLevel] = [...state.foundWords];
                    delete state.inProgress[state.currentLevel];
                    saveProgress();
                    setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 1200);
                }
            } else {
                saveProgress();
                renderCoins();
                renderWordCount();
                showToast("⭐ All letters revealed!", theme.accent);
            }
        } else {
            saveProgress();
            renderCoins();
            renderWordCount();
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

    // Collect all valid cells that are not visible
    const candidates = [];
    for (const p of crossword.placements) {
        for (const c of p.cells) {
            const k = c.row + "," + c.col;
            if (!visible.has(k)) candidates.push(k);
        }
    }
    if (!candidates.length) return null;
    // Deduplicate (cells shared by multiple words)
    const unique = [...new Set(candidates)];
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

function playSound(name) {
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
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "square"; o.frequency.value = 600;
            g.gain.setValueAtTime(0.1, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
            o.connect(g); g.connect(ctx.destination);
            o.start(now); o.stop(now + 0.02);
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

function animateCoinGain(amount) {
    const coinDisplay = document.getElementById("coin-display");
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
    saveProgress();
    showToast(hasFree ? "💡 Free hint used!" : "💡 Letter revealed  −100 🪙");
    renderGrid();
    flashHintCell(cell);
    renderWordCount();
    renderCoins();
    renderHintBtn();
    renderRocketBtn();
    renderSpinBtn();
    if (state.foundWords.length === totalRequired) {
        setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
    }
}

function handleTargetHint() {
    if (state.pickMode) { cancelPickMode(); return; }
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
    saveProgress();
    showToast(wasFree ? "🎯 Free target used!" : "🎯 Letter placed!  −200 🪙");
    renderGrid();
    flashHintCell(key);
    renderWordCount();
    renderCoins();
    renderHintBtn();
    renderTargetBtn();
    renderRocketBtn();
    renderSpinBtn();
    if (state.foundWords.length === totalRequired) {
        setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
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

    // Try to animate in-place if letter divs exist
    const lettersDiv = document.getElementById("wheel-letters");
    if (lettersDiv && lettersDiv.children.length === wheelLetters.length) {
        const wheelR = Math.min(110, (window.innerWidth - 100) / 2.6);
        const letterR = Math.min(28, Math.max(20, wheelR * 0.23));
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

async function handleNextLevel() {
    const maxLv = (typeof getMaxLevel === "function") ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 999999);
    // Store completed level answers before advancing
    if (state.foundWords.length === totalRequired) {
        state.levelHistory[state.currentLevel] = [...state.foundWords];
        delete state.inProgress[state.currentLevel];
    }
    const isReplay = state.currentLevel < state.highestLevel;
    let next;
    if (isReplay) {
        // Find the first uncompleted level
        next = state.currentLevel + 1;
        while (next <= maxLv && state.levelHistory[next]) next++;
        next = Math.min(next, maxLv);
    } else {
        next = Math.min(state.currentLevel + 1, maxLv);
    }
    state.currentLevel = next;
    state.highestLevel = Math.max(state.highestLevel, next);
    state.foundWords = [];
    state.bonusFound = [];
    state.revealedCells = [];
    state.showComplete = false;
    if (!isReplay) {
        state.coins += 1;
        state.levelsCompleted++;
        if (state.levelsCompleted % 10 === 0) {
            state.freeHints++;
        }
        if (state.levelsCompleted % 10 === 0) {
            state.freeTargets++;
        }
        if (state.levelsCompleted % 10 === 0) {
            state.freeRockets++;
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
    const maxLv = (typeof getMaxLevel === "function") ? getMaxLevel() : 999999;
    if (num < 1 || num > maxLv) return;
    if (num === state.currentLevel) {
        state.showMap = false;
        renderMap();
        renderWheel();
        return;
    }
    saveInProgressState();
    state.highestLevel = Math.max(state.highestLevel, num);
    state.currentLevel = num;
    state.foundWords = [];
    state.bonusFound = [];
    state.revealedCells = [];
    state.showMenu = false;
    state.showMap = false;
    state.shuffleKey = 0;
    await recompute();
    restoreLevelState();
    saveProgress();
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
    renderGrid();

    renderWordCount();
    renderWheel();
    renderBonusStar();
    renderCompleteModal();
    renderMenu();
    renderMap();
}

// ---- HEADER ----
function renderHeader() {
    let hdr = document.getElementById("header");
    if (!hdr) {
        hdr = document.createElement("div");
        hdr.id = "header";
        hdr.className = "header";
        document.getElementById("app").prepend(hdr);
    }
    hdr.style.color = theme.text;
    hdr.innerHTML = `
        <button id="menu-btn" style="background:none;border:none;padding:4px 4px 4px 0;cursor:pointer;font-size:28px;line-height:1">⚙️</button>
        <div class="header-center">
            <div class="header-pack">${level.group} · ${level.pack}</div>
            <div class="header-level" style="color:${theme.accent}">Level ${getDisplayLevel()}</div>
        </div>
        <div class="header-right">
            <div class="header-btn coin-display" style="color:${theme.text}" id="coin-display">🪙 ${state.coins}</div>
            <button class="daily-btn" id="daily-btn"><span class="daily-text">FREE</span><svg class="daily-coins" width="16" height="22" viewBox="0 0 20 28">${[0,1,2,3,4].map(i=>{const y=24-i*4.5;return `<path d="M2,${y} v-2.5 a8,3 0 0,1 16,0 v2.5 a8,3 0 0,1 -16,0z" fill="#a07818"/><ellipse cx="10" cy="${y-2.5}" rx="8" ry="3" fill="#d4a51c"/><ellipse cx="10" cy="${y-2.5}" rx="5" ry="1.8" fill="#e8c640" opacity="0.35"/>`}).join('')}</svg></button>
        </div>
    `;
    document.getElementById("menu-btn").onclick = () => { state.showMenu = true; renderMenu(); };
    document.getElementById("daily-btn").onclick = () => renderDailyModal(true);
    renderDailyBtn();
}

function renderCoins() {
    const el = document.getElementById("coin-display");
    if (el) el.textContent = "🪙 " + state.coins;
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
        state.lastDailyClaim = getTodayStr();
        saveProgress();
        renderDailyModal(false);
        renderDailyBtn();
        renderCoins();
        renderHintBtn();
        renderTargetBtn();
        renderRocketBtn();
        renderSpinBtn();
        showToast("🪙 +100 daily coins!", theme.accent);
        playSound("spinPrize");
        setTimeout(() => animateCoinGain(100), 200);
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) renderDailyModal(false);
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
    for (const p of placements) {
        for (const c of p.cells) valid.add(c.row + "," + c.col);
        if (state.foundWords.includes(p.word)) {
            for (const c of p.cells) revealed.add(c.row + "," + c.col);
        }
    }
    // Include individually hinted cells
    for (const k of state.revealedCells) revealed.add(k);

    // Measure actual rendered dimensions via getBoundingClientRect
    const appEl = document.getElementById("app");
    const appW = appEl ? appEl.getBoundingClientRect().width : window.innerWidth;
    const areaRect = area.getBoundingClientRect();
    const availW = appW - 24; // subtract grid-area horizontal padding (12px each side)
    const availH = areaRect.height > 0 ? areaRect.height - 20 : window.innerHeight * 0.38;
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

            if (isR) {
                div.style.background = theme.accent + "cc";
                div.style.border = "none";
                div.style.color = "#fff";
                div.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";
                div.textContent = cell;
            } else {
                div.style.background = state.pickMode ? "rgba(255,255,200,0.85)" : "rgba(255,255,255,0.75)";
                div.style.border = state.pickMode ? "2px solid " + theme.accent : "none";
                div.style.color = "transparent";
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

// ---- WORD COUNT ----
function renderWordCount() {
    let wc = document.getElementById("word-count");
    if (!wc) {
        wc = document.createElement("div");
        wc.id = "word-count";
        wc.className = "word-count";
        const app = document.getElementById("app");
        const area = document.getElementById("grid-area");
        if (area && area.nextSibling) app.insertBefore(wc, area.nextSibling);
        else app.appendChild(wc);
    }
    wc.innerHTML = "&nbsp;";
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
    const wheelR = Math.min(125, (window.innerWidth - 100) / 2.4);
    const letterR = Math.min(28, Math.max(20, wheelR * 0.23));
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
    const upperBtnTop = -5; // centered on 42px current-word line
    const lowerBtnTop = 57; // 52px button + 10px gap below upper
    section.innerHTML = `
        <div class="current-word" id="current-word" style="color:${theme.accent};text-shadow:0 1px 0 rgba(255,255,255,0.3),0 2px 0 rgba(0,0,0,0.3),0 3px 0 rgba(0,0,0,0.15),0 0 4px ${theme.accent}80">&nbsp;</div>
        <button class="circle-btn" id="shuffle-btn" title="Shuffle" style="left:12px;top:${upperBtnTop}px">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 3 21 3 21 8" stroke="#5bc0eb"/><line x1="4" y1="20" x2="21" y2="3" stroke="#5bc0eb"/>
                <polyline points="21 16 21 21 16 21" stroke="#f7b32b"/><line x1="15" y1="15" x2="21" y2="21" stroke="#f7b32b"/>
                <line x1="4" y1="4" x2="9" y2="9" stroke="#fc6471"/>
            </svg>
        </button>
        <button class="circle-btn" id="target-btn" title="Choose letter (200 coins)" style="left:12px;top:${lowerBtnTop}px;opacity:${targetCanUse ? '1' : '0.55'}">
            <span style="font-size:30px;line-height:1;padding-left:1px">🎯</span>
            <span class="circle-btn-badge" id="target-badge">${state.freeTargets > 0 ? state.freeTargets : ''}</span>
            <span class="circle-btn-price">200</span>
        </button>
        <button class="circle-btn" id="hint-btn" title="Hint (100 coins)" style="right:12px;top:${upperBtnTop}px;opacity:${hintCanUse ? '1' : '0.55'}">
            <span style="font-size:24px;line-height:1">💡</span>
            <span class="circle-btn-badge" id="hint-badge">${state.freeHints > 0 ? state.freeHints : ''}</span>
            <span class="circle-btn-price">100</span>
        </button>
        <button class="circle-btn" id="rocket-btn" title="Rocket hint (300 coins)" style="right:12px;top:${lowerBtnTop}px;opacity:${rocketCanUse ? '1' : '0.55'}">
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
                        style="font-size:7px;font-weight:700;font-family:system-ui,sans-serif;fill:rgba(255,255,255,0.85)">${state.bonusCounter || ''}</text>
                </svg>
            </button>
        </div>
        <div class="spin-btn-area" id="spin-btn-area" style="display:none">
            <button class="spin-badge-btn" id="spin-btn" style="--accent:${theme.accent};--accent-dark:${theme.accentDark}"><span class="spin-gift">🎁</span><span class="spin-text">Spin</span></button>
        </div>
    `;

    // Render letter circles
    const lettersDiv = document.getElementById("wheel-letters");
    const letterFS = Math.max(38, wheelR * 0.46);
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
        const maxLv = (typeof getMaxLevel === "function") ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 999999);
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
        btn.style.cssText = `background:linear-gradient(180deg,${theme.accent},${theme.accentDark});color:#000;border:1px solid rgba(255,255,255,0.3);border-bottom-color:rgba(0,0,0,0.15);padding:10px 20px;border-radius:24px;font-size:15px;font-weight:700;font-family:system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 12px ${theme.accent}40,inset 0 1px 0 rgba(255,255,255,0.3);display:flex;align-items:center`;
        btn.onclick = () => { playSound("wordFound"); handleNextLevel(); };
        overlay.appendChild(btn);
        document.getElementById("wheel-area").appendChild(overlay);
    }

    document.addEventListener("click", (e) => {
        if (!state.pickMode) return;
        if (e.target.closest(".grid-cell") || e.target.closest("#target-btn")) return;
        cancelPickMode();
    });
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
    saveProgress();
    showToast(hasFree ? "🚀 Free rocket used! " + revealed.length + " letters!" : "🚀 " + revealed.length + " letters revealed  −300 🪙");
    renderGrid();
    revealed.forEach((cell, i) => setTimeout(() => flashHintCell(cell), i * 400));
    renderWordCount();
    renderCoins();
    renderHintBtn();
    renderTargetBtn();
    renderRocketBtn();
    renderSpinBtn();
    if (state.foundWords.length === totalRequired) {
        setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700 + revealed.length * 400);
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
    const dailyAvailable = state.lastDailyClaim !== getTodayStr();
    const stuck = state.freeHints === 0 && state.freeTargets === 0 && state.freeRockets === 0 && state.coins < 100 && !dailyAvailable;
    el.style.display = stuck ? "" : "none";
}

// ---- RESCUE SPIN WHEEL ----
let _spinAngle = 0;
let _spinAnimating = false;
const SPIN_SLICES = [
    { label: "Hint",      emoji: "💡", color: "#4CAF50" },
    { label: "Rocket",    emoji: "🚀", color: "#9C27B0" },
    { label: "Target",    emoji: "🎯", color: "#2196F3" },
    { label: "50 Coins",  emoji: "🪙", color: "#FFC107" },
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
        ctx.font = "bold 13px system-ui, sans-serif";
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
    ctx.font = "bold 11px system-ui, sans-serif";
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
            <h2 class="modal-title" style="color:${theme.accent}">Rescue Spin!</h2>
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
    let velocity = 15 + Math.random() * 10; // 15-25 rad/s
    const friction = 0.97;
    let lastSlice = -1;
    const sliceAngle = (Math.PI * 2) / SPIN_SLICES.length;

    function frame() {
        _spinAngle += velocity * 0.016; // ~60fps
        velocity *= friction;
        drawSpinWheel(canvas, _spinAngle);

        // Tick sound on segment boundary
        const normalAngle = ((-_spinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const currentSlice = Math.floor(normalAngle / sliceAngle);
        if (currentSlice !== lastSlice && lastSlice !== -1) {
            playSound("spinTick");
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
        state.freeHints++;
    } else if (winner.label === "50 Coins") {
        state.coins += 50;
    } else if (winner.label === "Target") {
        state.freeTargets++;
    } else if (winner.label === "Rocket") {
        state.freeRockets++;
    } else if (winner.label === "100 Coins") {
        state.coins += 100;
    }
    // No Prize = nothing
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
    if (winner.label === "50 Coins" || winner.label === "100 Coins") {
        const amt = winner.label === "50 Coins" ? 50 : 100;
        setTimeout(() => animateCoinGain(amt), 200);
    }
    // Pulse the relevant element after a brief delay so it's visible
    let targetId = null;
    if (winner.label === "Hint") targetId = "hint-btn";
    else if (winner.label === "Target") targetId = "target-btn";
    else if (winner.label === "Rocket") targetId = "rocket-btn";
    else if (winner.label === "50 Coins" || winner.label === "100 Coins") targetId = "coin-display";
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

function hitTestWheel(px, py) {
    const wheelR = Math.min(110, (window.innerWidth - 100) / 2.6);
    const letterR = Math.min(28, Math.max(20, wheelR * 0.23));
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
    const maxLv = (typeof getMaxLevel === "function" && getMaxLevel() > 0) ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 999999);
    const isLast = state.currentLevel >= maxLv;
    const bonusCount = state.bonusFound.length;
    overlay.innerHTML = `
        <div class="modal-box" style="border:2px solid ${theme.accent}50;box-shadow:0 0 40px ${theme.accent}20">
            <div class="modal-emoji">🎉</div>
            <h2 class="modal-title" style="color:${theme.accent}">Level Complete!</h2>
            <p class="modal-subtitle">${level.group} · ${level.pack} · Level ${getDisplayLevel()}</p>
            <p class="modal-coins" style="color:${theme.text}">+1 🪙${bonusCount > 0 ? " · +" + bonusCount + " bonus" : ""}</p>
            <button class="modal-next-btn" id="next-btn"
                style="background:linear-gradient(180deg,${theme.accent} 0%,${theme.accentDark} 100%);border:2px solid ${theme.accent};border-bottom-color:${theme.accentDark};box-shadow:0 4px 14px ${theme.accent}60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3)">
                ${isLast ? "🏆 All Done!" : "Next Level →"}
            </button>
            <button class="modal-map-btn" id="modal-map-btn" style="border-color:${theme.accent}40;color:${theme.text}">View Map</button>
        </div>
    `;
    document.getElementById("next-btn").onclick = handleNextLevel;
    document.getElementById("modal-map-btn").onclick = () => {
        state.showComplete = false;
        state.showMap = true;
        _mapAutoExpanded = false;
        _mapHasScrolled = false;
        renderCompleteModal();
        renderMap();
    };
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

    const maxLv = (typeof getMaxLevel === "function" && getMaxLevel() > 0) ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 0);

    let html = `
        <div class="menu-header">
            <h2 class="menu-title" style="color:${theme.accent}">Settings</h2>
            <button class="menu-close" id="menu-close-btn">✕</button>
        </div>
        <div class="menu-scroll">
    `;

    // Stats + Current Level side by side
    html += `
        <div class="menu-top-row">
            <div class="menu-top-col">
                <div class="menu-current-label">Stats</div>
                <div class="menu-stat">Highest Level: <span style="color:${theme.accent}">${state.highestLevel.toLocaleString()}</span></div>
                <div class="menu-stat">Coins: <span style="color:${theme.accent}">🪙 ${state.coins}</span></div>
                <div class="menu-stat">Levels Available: <span style="color:${theme.accent}">${maxLv.toLocaleString()}</span></div>
            </div>
            <div class="menu-top-col">
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
            <button class="menu-nav-btn" id="menu-next" style="border-color:${theme.accent}40">Next ▶</button>
        </div>
    `;

    // Level Map button
    html += `
        <button class="menu-map-btn" id="menu-map-btn" style="background:linear-gradient(135deg,${theme.accent},${theme.accentDark});color:#000">
            <span style="font-size:24px;vertical-align:middle">🗺️</span> Level Map
        </button>
    `;

    // Go to a past level
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Go to a past Level:</label>
            <div class="menu-setting-row">
                <input type="number" id="goto-level-input" value="${state.currentLevel}" min="1" max="${state.highestLevel}" class="menu-setting-input">
                <button class="menu-setting-btn" id="goto-level-btn" style="background:${theme.accent};color:#000">Go</button>
            </div>
            <div class="menu-setting-hint">Enter any past level number (1 – ${state.highestLevel.toLocaleString()})</div>
        </div>
    `;

    // Set progress (seeding for migrating from another app)
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Set Your Progress:</label>
            <div class="menu-setting-row">
                <input type="number" id="seed-level-input" value="${state.highestLevel}" min="1" max="${maxLv}" class="menu-setting-input">
                <button class="menu-setting-btn" id="seed-level-btn" style="background:${theme.accent};color:#000">Set</button>
            </div>
            <div class="menu-setting-hint">Mark all levels through this number as completed</div>
        </div>
    `;

    // Reset option
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Reset</label>
            <button class="menu-setting-btn" id="reset-progress-btn" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3)">Reset All Progress</button>
        </div>
    `;

    // Sound toggle
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Sound</label>
            <button class="menu-setting-btn" id="sound-toggle-btn" style="background:${state.soundEnabled ? theme.accent : 'rgba(255,255,255,0.1)'};color:${state.soundEnabled ? '#000' : 'rgba(255,255,255,0.6)'};width:100%;padding:10px 0;font-size:14px">${state.soundEnabled ? '🔊 On' : '🔇 Off'}</button>
        </div>
    `;

    // Check for Updates
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">App</label>
            <button class="menu-setting-btn" id="check-update-btn" style="background:${theme.accent};color:#000;width:100%;padding:10px 0;font-size:14px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M21 12a9 9 0 0 1-15.36 6.36"/><path d="M3 12a9 9 0 0 1 15.36-6.36"/><polyline points="21 3 21 9 15 9"/><polyline points="3 21 3 15 9 15"/></svg>Check for Updates</button>
        </div>
    `;

    // Install App
    html += `<div class="menu-setting">`;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
        html += `<div style="text-align:center;opacity:0.4;font-size:14px;padding:4px 0">Installed \u2713</div>`;
    } else if (window._inAppBrowser) {
        html += `<div style="text-align:center;opacity:0.5;font-size:13px;padding:4px 0">Open in your browser to install</div>`;
    } else if (window._installPrompt) {
        html += `<button class="menu-setting-btn" id="install-app-btn" style="background:${theme.accent};color:#000;width:100%;padding:10px 0;font-size:14px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M12 3v12"/><polyline points="8 11 12 15 16 11"/><path d="M20 21H4"/></svg>Install App</button>`;
    } else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
        html += `<label class="menu-setting-label">Install App</label>`;
        html += `<div style="font-size:13px;opacity:0.6;line-height:1.5">Tap Share (\u25A1\u2191) then &ldquo;Add to Home Screen&rdquo;</div>`;
    } else {
        html += `<div style="text-align:center;opacity:0.4;font-size:13px;padding:4px 0">Install not available in this browser</div>`;
    }
    html += `</div>`;

    html += `</div>`; // close menu-scroll
    overlay.innerHTML = html;

    // Wire up event handlers
    document.getElementById("menu-close-btn").onclick = () => { state.showMenu = false; renderAll(); };

    document.getElementById("sound-toggle-btn").onclick = () => {
        state.soundEnabled = !state.soundEnabled;
        saveProgress();
        renderMenu();
    };

    document.getElementById("menu-map-btn").onclick = () => {
        state.showMenu = false;
        state.showMap = true;
        _mapAutoExpanded = false;
        _mapHasScrolled = false;
        renderMenu();
        renderMap();
    };

    document.getElementById("menu-prev").onclick = async () => {
        if (state.currentLevel <= 1) return;
        saveInProgressState();
        state.currentLevel--;
        state.highestLevel = Math.max(state.highestLevel, state.currentLevel);
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        state.shuffleKey = 0;
        await recompute();
        restoreLevelState();
        saveProgress();
        renderMenu();
    };
    document.getElementById("menu-next").onclick = async () => {
        if (state.currentLevel >= maxLv) return;
        saveInProgressState();
        state.currentLevel++;
        state.highestLevel = Math.max(state.highestLevel, state.currentLevel);
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        state.shuffleKey = 0;
        await recompute();
        restoreLevelState();
        saveProgress();
        renderMenu();
    };
    document.getElementById("menu-restart").onclick = async () => {
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        delete state.levelHistory[state.currentLevel];
        delete state.inProgress[state.currentLevel];
        state.shuffleKey = 0;
        await recompute();
        saveProgress();
        state.showMenu = false;
        renderAll();
        showToast("Level restarted");
    };
    
    document.getElementById("goto-level-btn").onclick = async () => {
        const input = document.getElementById("goto-level-input");
        const val = parseInt(input.value);
        if (val >= 1 && val <= maxLv && !isNaN(val)) {
            saveInProgressState();
            state.highestLevel = Math.max(state.highestLevel, val);
            state.currentLevel = val;
            state.foundWords = [];
            state.bonusFound = [];
            state.revealedCells = [];
            state.shuffleKey = 0;
            await recompute();
            restoreLevelState();
            saveProgress();
            renderMenu();
        } else {
            showToast("Level " + val + " not available", "#ff8888");
        }
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

    document.getElementById("seed-level-btn").onclick = () => {
        const input = document.getElementById("seed-level-input");
        const val = parseInt(input.value);
        if (val >= 1 && val <= maxLv && !isNaN(val)) {
            state.highestLevel = val;
            state.currentLevel = val;
            state.foundWords = [];
            state.bonusFound = [];
            state.revealedCells = [];
            state.shuffleKey = 0;
            // Mark all levels below as completed, clear anything at or above
            for (let lv = 1; lv < val; lv++) {
                if (!state.levelHistory[lv]) state.levelHistory[lv] = [];
            }
            for (const key of Object.keys(state.levelHistory)) {
                if (parseInt(key) >= val) delete state.levelHistory[key];
            }
            for (const key of Object.keys(state.inProgress)) {
                if (parseInt(key) >= val) delete state.inProgress[key];
            }
            saveProgress();
            recompute().then(() => {
                state.showMenu = false;
                renderAll();
                showToast("Progress set to level " + val.toLocaleString());
            });
        } else {
            showToast("Invalid level number", "#ff8888");
        }
    };

    document.getElementById("reset-progress-btn").onclick = () => {
        if (confirm("Reset all progress? This cannot be undone.")) {
            localStorage.removeItem("wordplay-save");
            state.currentLevel = 1;
            state.highestLevel = 1;
            state.foundWords = [];
            state.bonusFound = [];
            state.revealedCells = [];
            state.bonusCounter = 0;
            state.freeHints = 0;
            state.freeTargets = 0;
            state.freeRockets = 0;
            state.levelsCompleted = 0;
            state.levelHistory = {};
            state.inProgress = {};
            state.lastDailyClaim = null;
            state.soundEnabled = true;
            state.coins = 50;
            state.showMenu = false;
            saveProgress();
            recompute().then(() => renderAll());
        }
    };
}

// ---- LEVEL MAP ----
function renderSnakeNodes(pack, accent) {
    const cols = 5;
    const total = pack.end - pack.start + 1;
    const rows = Math.ceil(total / cols);
    let html = '';
    for (let r = 0; r < rows; r++) {
        const reverse = r % 2 === 1;
        html += `<div class="map-snake-row${reverse ? ' reverse' : ''}">`;
        const rowCount = Math.min(cols, total - r * cols);
        for (let c = 0; c < rowCount; c++) {
            const lvNum = pack.start + r * cols + c;
            const isCompleted = !!state.levelHistory[lvNum];
            const isCurrent = lvNum === state.currentLevel;
            const isAvailable = lvNum <= state.highestLevel;
            let cls = 'map-node';
            if (isCompleted) cls += ' completed';
            else if (isCurrent) cls += ' current';
            else if (isAvailable) cls += ' available';
            else cls += ' locked';
            // Horizontal connector before this node (not on first of row)
            if (c > 0) html += `<div class="map-hconnector" style="background:${isAvailable ? accent : 'rgba(255,255,255,0.1)'}"></div>`;
            html += `<div class="${cls}" data-lv="${lvNum}" style="--accent:${accent}">`;
            html += `<span class="map-node-num">${lvNum}</span>`;
            html += `</div>`;
        }
        html += `</div>`;
        // Vertical connector between rows
        if (r < rows - 1) {
            const nextRowFirst = pack.start + (r + 1) * cols;
            const connectorDone = nextRowFirst <= state.highestLevel;
            const side = r % 2 === 0 ? 'right' : 'left';
            html += `<div class="map-vconnector ${side}" style="background:${connectorDone ? accent : 'rgba(255,255,255,0.1)'}"></div>`;
        }
    }
    return html;
}

function renderGiantPackView(pack, accent, completed, total, pct) {
    return `
        <div class="map-giant-stats">
            <div class="map-giant-count" style="color:${accent}">${completed.toLocaleString()} <span class="map-giant-of">of</span> ${total.toLocaleString()}</div>
            <div class="map-giant-pct">${pct}% complete</div>
        </div>
    `;
}

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
        overlay.innerHTML = `<div class="map-header"><h2 class="map-title" style="color:${theme.accent}">Level Map</h2><button class="menu-close" id="map-close-btn">✕</button></div><div class="map-scroll"><p style="opacity:0.5;text-align:center;padding:40px">No level data available</p></div>`;
        document.getElementById("map-close-btn").onclick = () => { state.showMap = false; renderMap(); renderWheel(); };
        return;
    }

    // Auto-expand the active pack only on first open
    if (!_mapAutoExpanded) {
        _mapAutoExpanded = true;
        _mapExpandedPacks = {};
        for (const p of packs) {
            if (state.currentLevel >= p.start && state.currentLevel <= p.end) {
                const key = p.group + "/" + p.pack + "/" + p.start;
                if ((p.end - p.start + 1) <= PACK_MAX_EXPANDABLE) {
                    _mapExpandedPacks[key] = true;
                }
                break;
            }
        }
    }

    let html = `<div class="map-header"><h2 class="map-title" style="color:${theme.accent}">Level Map</h2><button class="menu-close" id="map-close-btn">✕</button></div><div class="map-scroll" id="map-scroll">`;

    let lastGroup = "";
    for (const p of packs) {
        const key = p.group + "/" + p.pack + "/" + p.start;
        const total = p.end - p.start + 1;
        const isGiant = total > PACK_MAX_EXPANDABLE;
        const packTheme = typeof getThemeForGroup === "function" ? getThemeForGroup(p.group) : "sunrise";
        const accent = (THEMES[packTheme] || THEMES.sunrise).accent;
        let completed = 0;
        for (let lv = p.start; lv <= p.end; lv++) { if (state.levelHistory[lv]) completed++; }
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isActive = state.currentLevel >= p.start && state.currentLevel <= p.end;
        const isLocked = state.highestLevel < p.start;
        const isDone = completed === total;
        const isExpanded = !isGiant && _mapExpandedPacks[key];

        // Group divider
        if (p.group !== lastGroup) {
            lastGroup = p.group;
            html += `<div class="map-group-divider" style="color:${accent}"><span class="map-group-name">${p.group}</span></div>`;
        }

        // Pack section
        html += `<div class="map-pack${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}${isDone ? ' done' : ''}">`;

        // Pack header
        const expandable = !isGiant;
        html += `<div class="map-pack-header${expandable ? ' expandable' : ''}" data-pack-key="${key}" ${isGiant ? '' : ''}>`;
        html += `<div class="map-pack-info">`;
        if (isDone) html += `<span class="map-pack-icon" style="color:${accent}">✓</span>`;
        else if (isActive) html += `<span class="map-pack-icon active-dot" style="background:${accent}"></span>`;
        else if (isLocked) html += `<span class="map-pack-icon locked-icon">🔒</span>`;
        html += `<div><div class="map-pack-name">${p.pack}</div>`;
        html += `<div class="map-pack-range">Levels ${p.start.toLocaleString()} – ${p.end.toLocaleString()}</div></div></div>`;
        // Progress bar
        html += `<div class="map-pack-right">`;
        html += `<div class="map-progress-bar"><div class="map-progress-fill" style="width:${pct}%;background:${accent}"></div></div>`;
        if (expandable) html += `<span class="map-chevron${isExpanded ? ' open' : ''}">▸</span>`;
        html += `</div>`;
        html += `</div>`; // close pack header

        // Expanded content
        if (isExpanded) {
            html += `<div class="map-snake" id="map-snake-${key.replace(/[^a-zA-Z0-9]/g, '-')}">`;
            html += renderSnakeNodes(p, accent);
            html += `</div>`;
        }

        if (isGiant && !isLocked) {
            html += renderGiantPackView(p, accent, completed, total, pct);
        }

        html += `</div>`; // close map-pack
    }

    html += `</div>`; // close map-scroll
    overlay.innerHTML = html;

    // Wire close button
    document.getElementById("map-close-btn").onclick = () => { state.showMap = false; renderMap(); renderWheel(); };

    // Wire pack header toggles (accordion — only one open at a time)
    overlay.querySelectorAll(".map-pack-header.expandable").forEach(hdr => {
        hdr.onclick = () => {
            const packKey = hdr.getAttribute("data-pack-key");
            const wasOpen = _mapExpandedPacks[packKey];
            _mapExpandedPacks = {};
            if (!wasOpen) _mapExpandedPacks[packKey] = true;
            _mapScrollTarget = wasOpen ? null : packKey;
            renderMap();
        };
    });

    // Wire level node clicks
    overlay.querySelectorAll(".map-node[data-lv]").forEach(node => {
        node.onclick = () => {
            const lv = parseInt(node.getAttribute("data-lv"));
            if (!isNaN(lv)) {
                state.showMap = false;
                goToLevel(lv);
            }
        };
    });

    // Auto-scroll: on initial open go to current level, on pack toggle go to that pack
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

// ============================================================
// INITIALIZE
// ============================================================
async function init() {
    // Show loading state
    const app = document.getElementById("app");
    app.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#fef3e0;font-family:system-ui;font-size:18px">
        <div style="text-align:center"><div style="font-size:48px;margin-bottom:16px">🎮</div>Loading levels...</div></div>`;
    app.style.background = "linear-gradient(170deg, #0f0520, #2d1b4e, #8b2252)";

    // Initialize level loader + background manifest
    if (typeof initLevelLoader === "function") {
        await initLevelLoader();
    }
    await loadBgManifest();

    loadProgress();
    await recompute();

    // Auto-complete any words whose cells are all already visible (fixes stuck levels)
    while (checkAutoCompleteWords()) {}
    if (state.foundWords.length === totalRequired && !state.levelHistory[state.currentLevel]) {
        state.levelHistory[state.currentLevel] = [...state.foundWords];
        delete state.inProgress[state.currentLevel];
    }
    saveProgress();

    // Build the UI
    app.innerHTML = "";
    renderAll();
    animateGridEntrance();

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

    // Warm up AudioContext on first user gesture
    const _warmAudio = () => { getAudioCtx(); document.removeEventListener("touchstart", _warmAudio); document.removeEventListener("mousedown", _warmAudio); };
    document.addEventListener("touchstart", _warmAudio, { once: true });
    document.addEventListener("mousedown", _warmAudio, { once: true });

    // Handle resize
    window.addEventListener("resize", () => {
        renderGrid();
        renderWheel();
    });
}

// Start
document.addEventListener("DOMContentLoaded", () => init());
