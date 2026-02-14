// ============================================================
// WordPlay — Main Application (Vanilla JS)
// ============================================================

// ---- THEMES ----
const THEMES = {
    sunrise: {
        bg: "linear-gradient(170deg, #0f0520 0%, #2d1b4e 25%, #8b2252 50%, #d4622a 75%, #f4a535 100%)",
        accent: "#f4a535", accentDark: "#c47d1a",
        wheelBg: "rgba(15,5,32,0.55)", cellBg: "rgba(255,255,255,0.1)",
        cellFound: "#f4a535", text: "#fef3e0", dim: "rgba(254,243,224,0.5)",
    },
    forest: {
        bg: "linear-gradient(170deg, #040d04 0%, #0d2a0d 25%, #1a4a1a 50%, #2d6a2d 75%, #4a8a3f 100%)",
        accent: "#8ed87c", accentDark: "#5ba04a",
        wheelBg: "rgba(4,13,4,0.55)", cellBg: "rgba(255,255,255,0.08)",
        cellFound: "#8ed87c", text: "#d8f0c8", dim: "rgba(216,240,200,0.5)",
    },
    canyon: {
        bg: "linear-gradient(170deg, #1a0e05 0%, #3d1f0a 25%, #7a3d1a 50%, #a0622d 75%, #c99a60 100%)",
        accent: "#e8b44c", accentDark: "#b8862e",
        wheelBg: "rgba(26,14,5,0.55)", cellBg: "rgba(255,255,255,0.08)",
        cellFound: "#e8b44c", text: "#faebd7", dim: "rgba(250,235,215,0.5)",
    },
    sky: {
        bg: "linear-gradient(170deg, #060d2a 0%, #0f2055 25%, #2050a0 50%, #4a8ad0 75%, #85c5f0 100%)",
        accent: "#6ec6f5", accentDark: "#3a96c5",
        wheelBg: "rgba(6,13,42,0.55)", cellBg: "rgba(255,255,255,0.1)",
        cellFound: "#6ec6f5", text: "#d8eeff", dim: "rgba(216,238,255,0.5)",
    },
    ocean: {
        bg: "linear-gradient(180deg, #020c1b 0%, #0a2342 25%, #0d4f6e 50%, #1a8a8a 75%, #3ccfcf 100%)",
        accent: "#3ccfcf", accentDark: "#1a8a8a",
        wheelBg: "rgba(2,12,27,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#3ccfcf", text: "#d0f5f5", dim: "rgba(208,245,245,0.5)",
    },
    lavender: {
        bg: "linear-gradient(160deg, #120820 0%, #2a1545 25%, #5c3d8f 50%, #9a6cbf 75%, #d4a5e5 100%)",
        accent: "#d4a5e5", accentDark: "#9a6cbf",
        wheelBg: "rgba(18,8,32,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#d4a5e5", text: "#f0e0ff", dim: "rgba(240,224,255,0.5)",
    },
    autumn: {
        bg: "linear-gradient(170deg, #1a0800 0%, #3d1200 25%, #8b3a0f 50%, #c45e1a 75%, #e89040 100%)",
        accent: "#e89040", accentDark: "#c45e1a",
        wheelBg: "rgba(26,8,0,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#e89040", text: "#fde8cc", dim: "rgba(253,232,204,0.5)",
    },
    midnight: {
        bg: "linear-gradient(175deg, #03000a 0%, #0a0520 25%, #1a1040 50%, #2a1860 75%, #3d2080 100%)",
        accent: "#8878c8", accentDark: "#5e4e9e",
        wheelBg: "rgba(3,0,10,0.55)", cellBg: "rgba(255,255,255,0.08)",
        cellFound: "#8878c8", text: "#d8d0f0", dim: "rgba(216,208,240,0.5)",
    },
    arctic: {
        bg: "linear-gradient(165deg, #0a1520 0%, #152535 25%, #2a4a60 50%, #5a8aa0 75%, #a0d4e8 100%)",
        accent: "#a0d4e8", accentDark: "#5a8aa0",
        wheelBg: "rgba(10,21,32,0.55)", cellBg: "rgba(255,255,255,0.1)",
        cellFound: "#a0d4e8", text: "#e0f4ff", dim: "rgba(224,244,255,0.5)",
    },
    volcano: {
        bg: "linear-gradient(175deg, #0a0000 0%, #2a0505 25%, #6a1010 50%, #a02020 75%, #e04030 100%)",
        accent: "#f06848", accentDark: "#c03828",
        wheelBg: "rgba(10,0,0,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#f06848", text: "#ffe0d8", dim: "rgba(255,224,216,0.5)",
    },
    meadow: {
        bg: "linear-gradient(160deg, #080d02 0%, #1a2a08 25%, #3a5a10 50%, #6a9a20 75%, #a0d040 100%)",
        accent: "#a0d040", accentDark: "#6a9a20",
        wheelBg: "rgba(8,13,2,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#a0d040", text: "#e8f8c8", dim: "rgba(232,248,200,0.5)",
    },
    storm: {
        bg: "linear-gradient(180deg, #08080c 0%, #1a1a2a 25%, #2e3050 50%, #4a5070 75%, #7080a0 100%)",
        accent: "#90a8d0", accentDark: "#6078a0",
        wheelBg: "rgba(8,8,12,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#90a8d0", text: "#d8e0f0", dim: "rgba(216,224,240,0.5)",
    },
    coral: {
        bg: "linear-gradient(165deg, #1a0810 0%, #3d1025 25%, #8a2050 50%, #c84878 75%, #f08ca0 100%)",
        accent: "#f08ca0", accentDark: "#c84878",
        wheelBg: "rgba(26,8,16,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#f08ca0", text: "#ffe0e8", dim: "rgba(255,224,232,0.5)",
    },
    aurora: {
        bg: "linear-gradient(170deg, #020810 0%, #0a2030 25%, #105040 50%, #20a060 75%, #60e0a0 100%)",
        accent: "#60e0a0", accentDark: "#20a060",
        wheelBg: "rgba(2,8,16,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#60e0a0", text: "#d0ffe8", dim: "rgba(208,255,232,0.5)",
    },
    desert: {
        bg: "linear-gradient(160deg, #1a1408 0%, #3a2a10 25%, #6a5020 50%, #a08838 75%, #d0c060 100%)",
        accent: "#d0c060", accentDark: "#a08838",
        wheelBg: "rgba(26,20,8,0.55)", cellBg: "rgba(255,255,255,0.09)",
        cellFound: "#d0c060", text: "#f8f0d0", dim: "rgba(248,240,208,0.5)",
    },
    twilight: {
        bg: "linear-gradient(175deg, #0a0515 0%, #1a1035 25%, #3a2060 50%, #6a3090 75%, #a050c0 100%)",
        accent: "#c080e0", accentDark: "#8850b0",
        wheelBg: "rgba(10,5,21,0.55)", cellBg: "rgba(255,255,255,0.09)",
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
    levelsCompleted: 0,    // total levels completed (persists, for 10-level target reward)
    levelHistory: {},      // { levelNum: [foundWords] } — answers for completed levels
    // Transient
    showMenu: false,
    showComplete: false,
    showMap: false,
    loading: false,
    pickMode: false,       // target-hint: user taps a cell to reveal it
};

// ---- MAP STATE ----
let _mapExpandedPacks = {};       // { "group/pack": true }
let _mapAutoExpanded = false;     // only auto-expand the active pack once per open
const PACK_MAX_EXPANDABLE = 100;  // giant packs won't expand to show nodes

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
}

function rebuildWheelLetters() {
    const arr = level.letters.split("");
    if (state.shuffleKey === 0) {
        wheelLetters = arr;
        return;
    }
    const a = [...arr];
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
            state.levelsCompleted = d.lc || 0;
            state.levelHistory = d.lh || {};
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
            lc: state.levelsCompleted,
            lh: state.levelHistory,
        }));
    } catch (e) { /* ignore */ }
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
        state.coins += 1;
        saveProgress();
        renderGrid();
        highlightWord(w);
        renderWordCount();
        renderCoins();
        renderHintBtn();
        renderTargetBtn();
        if (state.foundWords.length === totalRequired) {
            state.levelHistory[state.currentLevel] = [...state.foundWords];
            saveProgress();
            setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
        }
        return;
    }
    if (bonusPool && bonusPool.includes(w)) {
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
                showToast("⭐ Bonus Reward! Free letter!", theme.accent);
                // Delayed flash so the grid renders first
                setTimeout(() => flashHintCell(cell), 100);
                if (state.foundWords.length === totalRequired) {
                    state.levelHistory[state.currentLevel] = [...state.foundWords];
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
    const el = document.getElementById("bonus-star-counter");
    if (el) el.textContent = state.bonusCounter;
    const fill = document.getElementById("bonus-star-fill");
    if (fill) fill.setAttribute("stroke", state.bonusCounter > 0 ? "#f4d03f" : "rgba(255,255,255,0.35)");
}

function handleHint() {
    const hasFree = state.freeHints > 0;
    if (!hasFree && state.coins < 25) return;
    const cell = pickRandomUnrevealedCell();
    if (!cell) return;
    if (hasFree) {
        state.freeHints--;
    } else {
        state.coins -= 25;
    }
    state.revealedCells.push(cell);
    checkAutoCompleteWords();
    saveProgress();
    showToast(hasFree ? "💡 Free hint used!" : "💡 Letter revealed  −25 🪙");
    renderGrid();
    flashHintCell(cell);
    renderWordCount();
    renderCoins();
    renderHintBtn();
    if (state.foundWords.length === totalRequired) {
        setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
    }
}

function handleTargetHint() {
    const hasFree = state.freeTargets > 0;
    if (!hasFree && state.coins < 100) return;
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
        state.coins -= 100;
    }
    state.revealedCells.push(key);
    checkAutoCompleteWords();
    saveProgress();
    showToast(wasFree ? "🎯 Free target used!" : "🎯 Letter placed!  −100 🪙");
    renderGrid();
    flashHintCell(key);
    renderWordCount();
    renderCoins();
    renderHintBtn();
    renderTargetBtn();
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
    const canUse = state.freeTargets > 0 || state.coins >= 100;
    btn.style.opacity = canUse ? "1" : "0.3";
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
    }
    const isReplay = state.currentLevel < state.highestLevel;
    const next = isReplay
        ? Math.min(state.highestLevel, maxLv)
        : Math.min(state.currentLevel + 1, maxLv);
    state.currentLevel = next;
    state.highestLevel = Math.max(state.highestLevel, next);
    state.foundWords = [];
    state.bonusFound = [];
    state.revealedCells = [];
    state.showComplete = false;
    if (!isReplay) {
        state.coins += 1;
        state.freeHints++;
        state.levelsCompleted++;
        if (state.levelsCompleted % 10 === 0) {
            state.freeTargets++;
        }
    }
    state.shuffleKey = 0;
    saveProgress();
    await recompute();
    // Restore answers if returning to a previously completed level
    const history = state.levelHistory[state.currentLevel];
    if (history) {
        state.foundWords = placedWords.filter(w => history.includes(w));
    }
    renderAll();
}

async function goToLevel(num) {
    const maxLv = (typeof getMaxLevel === "function") ? getMaxLevel() : 999999;
    if (num < 1 || num > maxLv) return;
    state.highestLevel = Math.max(state.highestLevel, num);
    state.currentLevel = num;
    state.foundWords = [];
    state.bonusFound = [];
    state.revealedCells = [];
    state.showMenu = false;
    state.showMap = false;
    state.shuffleKey = 0;
    await recompute();
    // Restore answers for previously completed levels
    const history = state.levelHistory[state.currentLevel];
    if (history) {
        state.foundWords = placedWords.filter(w => history.includes(w));
    } else if (num < state.highestLevel) {
        // Level was completed before history tracking — fill all words
        state.foundWords = [...placedWords];
        state.levelHistory[state.currentLevel] = [...placedWords];
    }
    saveProgress();
    renderAll();
}

// ============================================================
// RENDERING
// ============================================================

function renderAll() {
    const app = document.getElementById("app");
    app.style.background = theme.bg;
    app.style.color = theme.text;

    renderHeader();
    renderGrid();

    renderWordCount();
    renderWheel();
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
        <button class="header-btn" id="menu-btn" style="color:${theme.text}">☰</button>
        <div class="header-center">
            <div class="header-pack">${level.group} · ${level.pack}</div>
            <div class="header-level" style="color:${theme.accent}">Level ${getDisplayLevel()}</div>
        </div>
        <div class="header-btn coin-display" style="color:${theme.text}" id="coin-display">🪙 ${state.coins}</div>
    `;
    document.getElementById("menu-btn").onclick = () => { state.showMenu = true; renderMenu(); };
}

function renderCoins() {
    const el = document.getElementById("coin-display");
    if (el) el.textContent = "🪙 " + state.coins;
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

    const vw = window.innerWidth - 28;
    const vh = window.innerHeight * 0.34;
    const cs = Math.min(Math.floor(vw / cols), Math.floor(vh / rows), 44);
    const gap = Math.max(2, Math.min(4, cs > 30 ? 4 : 2));
    const fs = Math.max(cs * 0.55, 12);
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
                div.style.background = "rgba(255,255,255,0.88)";
                div.style.border = "none";
                div.style.color = "#1a1a2e";
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
    wc.style.color = theme.dim;
    let html = state.foundWords.length + " of " + totalRequired + " words";
    if (state.bonusFound.length > 0) {
        html += ` <span style="color:${theme.accent}"> · ${state.bonusFound.length} bonus</span>`;
    }
    wc.innerHTML = html;
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
    const wheelR = Math.min(110, (window.innerWidth - 100) / 2.6);
    const letterR = Math.min(28, Math.max(20, wheelR * 0.23));
    const pad = letterR + 16;
    const cx = wheelR + pad, cy = wheelR + pad;
    const cW = (wheelR + pad) * 2;
    const discR = wheelR + letterR + 4;

    wheelPositions = wheelLetters.map((_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(a) * wheelR, y: cy + Math.sin(a) * wheelR };
    });

    // Reset wheel state
    wheelState = { sel: [], word: "", dragging: false, ptr: null };

    const hintCanUse = state.freeHints > 0 || state.coins >= 25;
    const targetCanUse = state.freeTargets > 0 || state.coins >= 100;
    section.innerHTML = `
        <div class="current-word" id="current-word" style="color:${theme.accent};text-shadow:0 0 20px ${theme.accent}40">&nbsp;</div>
        <button class="circle-btn btn-left" id="shuffle-btn" title="Shuffle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                <line x1="4" y1="4" x2="9" y2="9"/>
            </svg>
        </button>
        <div class="btn-col-right">
            <button class="circle-btn" id="hint-btn" title="Hint (25 coins)" style="opacity:${hintCanUse ? '1' : '0.3'}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18h6"/><path d="M10 22h4"/>
                    <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>
                </svg>
                <span class="circle-btn-badge" id="hint-badge">${state.freeHints > 0 ? state.freeHints : ''}</span>
            </button>
            <button class="circle-btn" id="target-btn" title="Choose letter (100 coins)" style="opacity:${targetCanUse ? '1' : '0.3'}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
                <span class="circle-btn-badge" id="target-badge">${state.freeTargets > 0 ? state.freeTargets : ''}</span>
            </button>
        </div>
        <div class="wheel-area" id="wheel-area" style="width:${cW}px;height:${cW}px">
            <svg id="wheel-svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
                <circle cx="${cx}" cy="${cy}" r="${discR}" fill="rgba(255,255,255,0.92)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            </svg>
            <div id="wheel-letters"></div>
        </div>
        <div class="bonus-star-area" id="bonus-star-area">
            <div class="star-btn">
                <svg width="44" height="44" viewBox="0 0 24 24">
                    <polygon id="bonus-star-fill" points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill="none" stroke="${state.bonusCounter > 0 ? '#f4d03f' : 'rgba(255,255,255,0.35)'}" stroke-width="1.5"/>
                    <text id="bonus-star-counter" x="12" y="14.5" text-anchor="middle" font-size="7" font-weight="700"
                        font-family="system-ui, sans-serif" fill="rgba(255,255,255,0.6)">${state.bonusCounter}</text>
                </svg>
            </div>
        </div>
    `;

    // Render letter circles
    const lettersDiv = document.getElementById("wheel-letters");
    const letterFS = Math.max(36, wheelR * 0.42);
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
}

function renderHintBtn() {
    const btn = document.getElementById("hint-btn");
    if (!btn) return;
    const canUse = state.freeHints > 0 || state.coins >= 25;
    btn.style.opacity = canUse ? "1" : "0.3";
    const badge = document.getElementById("hint-badge");
    if (badge) badge.textContent = state.freeHints > 0 ? state.freeHints : "";
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
    if (cw) cw.textContent = wheelState.word || "\u00A0";

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
                style="background:linear-gradient(135deg,${theme.accent},${theme.accentDark});box-shadow:0 4px 16px ${theme.accent}40">
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
        renderCompleteModal();
        renderMap();
    };
}

// ---- LEVEL MENU ----
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
            <h2 class="menu-title" style="color:${theme.accent}">Levels</h2>
            <button class="menu-close" id="menu-close-btn">✕</button>
        </div>
        <div class="menu-scroll">
    `;

    // Current level info
    html += `
        <div class="menu-current">
            <div class="menu-current-label">Current Level</div>
            <div class="menu-current-num" style="color:${theme.accent}">${state.currentLevel.toLocaleString()}</div>
            <div class="menu-current-info">${level ? level.group + " \u00b7 " + level.pack : ""}</div>
            <div class="menu-current-progress">${state.foundWords.length} of ${totalRequired} words found</div>
        </div>
    `;

    // Level Map button
    html += `
        <button class="menu-map-btn" id="menu-map-btn" style="background:linear-gradient(135deg,${theme.accent},${theme.accentDark});color:#000">
            <span style="font-size:24px;vertical-align:middle">🗺️</span> Level Map
        </button>
    `;

    // Quick navigation
    html += `
        <div class="menu-nav-row">
            <button class="menu-nav-btn" id="menu-prev" style="border-color:${theme.accent}40">◀ Prev</button>
            <button class="menu-nav-btn" id="menu-restart" style="border-color:${theme.accent}40">↺ Restart</button>
            <button class="menu-nav-btn" id="menu-next" style="border-color:${theme.accent}40">Next ▶</button>
        </div>
    `;

    // Go to level
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Go to Level</label>
            <div class="menu-setting-row">
                <input type="number" id="goto-level-input" value="${state.currentLevel}" min="1" max="${maxLv}" class="menu-setting-input">
                <button class="menu-setting-btn" id="goto-level-btn" style="background:${theme.accent};color:#000">Go</button>
            </div>
            <div class="menu-setting-hint">Enter any level number (1 – ${maxLv.toLocaleString()})</div>
        </div>
    `;

    // Stats
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Stats</label>
            <div class="menu-stat">Highest Level: <span style="color:${theme.accent}">${state.highestLevel.toLocaleString()}</span></div>
            <div class="menu-stat">Coins: <span style="color:${theme.accent}">🪙 ${state.coins}</span></div>
            <div class="menu-stat">Levels Available: <span style="color:${theme.accent}">${maxLv.toLocaleString()}</span></div>
        </div>
    `;

    // Check for Updates
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">App</label>
            <button class="menu-setting-btn" id="check-update-btn" style="background:${theme.accent};color:#000;width:100%;padding:10px 0;font-size:14px">Check for Updates</button>
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
        html += `<button class="menu-setting-btn" id="install-app-btn" style="background:${theme.accent};color:#000;width:100%;padding:10px 0;font-size:14px">Install App</button>`;
    } else if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
        html += `<label class="menu-setting-label">Install App</label>`;
        html += `<div style="font-size:13px;opacity:0.6;line-height:1.5">Tap Share (\u25A1\u2191) then &ldquo;Add to Home Screen&rdquo;</div>`;
    } else {
        html += `<div style="text-align:center;opacity:0.4;font-size:13px;padding:4px 0">Install not available in this browser</div>`;
    }
    html += `</div>`;

    // Set progress (seeding for migrating from another app)
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Set Progress</label>
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

    html += `</div>`; // close menu-scroll
    overlay.innerHTML = html;

    // Wire up event handlers
    document.getElementById("menu-close-btn").onclick = () => { state.showMenu = false; renderAll(); };

    document.getElementById("menu-map-btn").onclick = () => {
        state.showMenu = false;
        state.showMap = true;
        _mapAutoExpanded = false;
        renderMenu();
        renderMap();
    };

    document.getElementById("menu-prev").onclick = async () => {
        if (state.currentLevel <= 1) return;
        state.currentLevel--;
        state.highestLevel = Math.max(state.highestLevel, state.currentLevel);
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        state.shuffleKey = 0;
        await recompute();
        const hist = state.levelHistory[state.currentLevel];
        if (hist) state.foundWords = placedWords.filter(w => hist.includes(w));
        saveProgress();
        renderMenu();
    };
    document.getElementById("menu-next").onclick = async () => {
        if (state.currentLevel >= maxLv) return;
        state.currentLevel++;
        state.highestLevel = Math.max(state.highestLevel, state.currentLevel);
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        state.shuffleKey = 0;
        await recompute();
        const hist = state.levelHistory[state.currentLevel];
        if (hist) state.foundWords = placedWords.filter(w => hist.includes(w));
        saveProgress();
        renderMenu();
    };
    document.getElementById("menu-restart").onclick = () => {
        state.foundWords = [];
        state.bonusFound = [];
        state.revealedCells = [];
        delete state.levelHistory[state.currentLevel];
        saveProgress();
        renderMenu();
        showToast("Level restarted");
    };
    
    document.getElementById("goto-level-btn").onclick = async () => {
        const input = document.getElementById("goto-level-input");
        const val = parseInt(input.value);
        if (val >= 1 && val <= maxLv && !isNaN(val)) {
            state.highestLevel = Math.max(state.highestLevel, val);
            state.currentLevel = val;
            state.foundWords = [];
            state.bonusFound = [];
            state.revealedCells = [];
            state.shuffleKey = 0;
            await recompute();
            const hist = state.levelHistory[state.currentLevel];
            if (hist) state.foundWords = placedWords.filter(w => hist.includes(w));
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
            state.highestLevel = Math.max(state.highestLevel, val);
            state.currentLevel = val + 1;
            state.foundWords = [];
            state.bonusFound = [];
            state.revealedCells = [];
            state.shuffleKey = 0;
            saveProgress();
            recompute().then(() => {
                state.showMenu = false;
                renderAll();
                showToast("Progress set through level " + val.toLocaleString());
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
            state.levelsCompleted = 0;
            state.levelHistory = {};
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
            const isCompleted = lvNum < state.highestLevel;
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
            if (isCompleted) html += `<span class="map-node-check">✓</span>`;
            else html += `<span class="map-node-num">${lvNum}</span>`;
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
        document.getElementById("map-close-btn").onclick = () => { state.showMap = false; renderMap(); };
        return;
    }

    // Auto-expand the active pack only on first open
    if (!_mapAutoExpanded) {
        _mapAutoExpanded = true;
        _mapExpandedPacks = {};
        for (const p of packs) {
            if (state.currentLevel >= p.start && state.currentLevel <= p.end) {
                const key = p.group + "/" + p.pack;
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
        const key = p.group + "/" + p.pack;
        const total = p.end - p.start + 1;
        const isGiant = total > PACK_MAX_EXPANDABLE;
        const packTheme = typeof getThemeForGroup === "function" ? getThemeForGroup(p.group) : "sunrise";
        const accent = (THEMES[packTheme] || THEMES.sunrise).accent;
        const completed = Math.max(0, Math.min(total, state.highestLevel - p.start));
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isActive = state.currentLevel >= p.start && state.currentLevel <= p.end;
        const isLocked = state.highestLevel < p.start;
        const isDone = state.highestLevel > p.end;
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
    document.getElementById("map-close-btn").onclick = () => { state.showMap = false; renderMap(); };

    // Wire pack header toggles (accordion — only one open at a time)
    overlay.querySelectorAll(".map-pack-header.expandable").forEach(hdr => {
        hdr.onclick = () => {
            const packKey = hdr.getAttribute("data-pack-key");
            const wasOpen = _mapExpandedPacks[packKey];
            _mapExpandedPacks = {};
            if (!wasOpen) _mapExpandedPacks[packKey] = true;
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

    // Auto-scroll to current level or active pack
    setTimeout(() => {
        const currentNode = overlay.querySelector(".map-node.current");
        if (currentNode) {
            currentNode.scrollIntoView({ block: "center", behavior: "smooth" });
        } else {
            const activePack = overlay.querySelector(".map-pack.active");
            if (activePack) activePack.scrollIntoView({ block: "center", behavior: "smooth" });
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

    // Initialize level loader
    if (typeof initLevelLoader === "function") {
        await initLevelLoader();
    }

    loadProgress();
    await recompute();

    // Build the UI
    app.innerHTML = "";
    renderAll();

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

    // Handle resize
    window.addEventListener("resize", () => {
        renderGrid();
        renderWheel();
    });
}

// Start
document.addEventListener("DOMContentLoaded", () => init());
