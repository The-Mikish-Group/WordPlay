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
};

// ---- STATE ----
const state = {
    currentLevel: 1,       // Actual level number (1-based)
    foundWords: [],
    bonusFound: [],
    coins: 50,
    highestLevel: 1,
    shuffleKey: 0,
    // Transient
    showMenu: false,
    showComplete: false,
    loading: false,
};

// ---- COMPUTED ----
let level, theme, crossword, placedWords, unplacedWords, totalRequired, wheelLetters;

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
    crossword = generateCrosswordGrid(level.words);
    placedWords = crossword.placements.map(p => p.word);
    unplacedWords = level.words.filter(w => !placedWords.includes(w));
    totalRequired = level.words.length;
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
            if (d.v === 2) {
                // New format
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
        }
    } catch (e) { /* ignore */ }
}

function saveProgress() {
    try {
        localStorage.setItem("wordplay-save", JSON.stringify({
            v: 2,  // format version
            cl: state.currentLevel,
            fw: state.foundWords,
            bf: state.bonusFound,
            co: state.coins,
            hl: state.highestLevel,
        }));
    } catch (e) { /* ignore */ }
}

// ---- TOAST ----
let toastTimer = null;
function showToast(msg, color, fast) {
    if (toastTimer) clearTimeout(toastTimer);
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.style.color = color || theme.accent;
    el.style.borderColor = (color || theme.accent) + "30";
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
    if (level.words.includes(w)) {
        state.foundWords.push(w);
        saveProgress();
        renderGrid();
        renderUnplaced();
        renderWordCount();
        if (state.foundWords.length === totalRequired) {
            setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
        }
        return;
    }
    if (level.bonus && level.bonus.includes(w)) {
        state.bonusFound.push(w);
        state.coins++;
        saveProgress();
        renderCoins();
        renderWordCount();
        showToast("✨ Bonus: " + w + "  +1 🪙");
        return;
    }

    // Invalid — shake grid
    const gc = document.getElementById("grid-container");
    if (gc) {
        gc.style.animation = "none";
        gc.offsetHeight;
        gc.style.animation = "shake 0.35s ease";
    }
}

function handleHint() {
    if (state.coins < 25) return;
    const unfound = level.words.filter(w => !state.foundWords.includes(w));
    if (!unfound.length) return;
    state.coins -= 25;
    state.foundWords.push(unfound[0]);
    saveProgress();
    showToast("💡 " + unfound[0]);
    renderGrid();
    renderUnplaced();
    renderWordCount();
    renderCoins();
    renderHintBtn();
    if (state.foundWords.length === totalRequired) {
        setTimeout(() => { state.showComplete = true; renderCompleteModal(); }, 700);
    }
}

function handleShuffle() {
    state.shuffleKey++;
    rebuildWheelLetters();
    renderWheel();
}

async function handleNextLevel() {
    const maxLv = (typeof getMaxLevel === "function") ? getMaxLevel() : (typeof ALL_LEVELS !== "undefined" ? ALL_LEVELS.length : 999999);
    const next = Math.min(state.currentLevel + 1, maxLv);
    state.currentLevel = next;
    state.highestLevel = Math.max(state.highestLevel, next);
    state.foundWords = [];
    state.bonusFound = [];
    state.showComplete = false;
    state.coins += 10;
    state.shuffleKey = 0;
    saveProgress();
    await recompute();
    renderAll();
}

async function goToLevel(num) {
    if (num > state.highestLevel && num !== state.currentLevel) return;
    state.currentLevel = num;
    state.foundWords = [];
    state.bonusFound = [];
    state.showMenu = false;
    state.shuffleKey = 0;
    saveProgress();
    await recompute();
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
    renderUnplaced();
    renderWordCount();
    renderWheel();
    renderCompleteModal();
    renderMenu();
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
        // Placeholder for unplaced
        const up = document.createElement("div");
        up.id = "unplaced-container";
        up.className = "unplaced-container";
        area.appendChild(up);
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

    const vw = window.innerWidth - 28;
    const vh = window.innerHeight * 0.34;
    const cs = Math.min(Math.floor(vw / cols), Math.floor(vh / rows), 44);
    const gap = Math.max(2, Math.min(4, cs > 30 ? 4 : 2));
    const fs = Math.max(cs * 0.48, 12);
    const br = Math.max(4, cs * 0.14);

    gc.className = "grid-container";
    gc.style.gridTemplateColumns = `repeat(${cols}, ${cs}px)`;
    gc.style.gridTemplateRows = `repeat(${rows}, ${cs}px)`;
    gc.style.gap = gap + "px";
    gc.style.display = "grid";

    gc.innerHTML = "";
    for (let ri = 0; ri < rows; ri++) {
        for (let ci = 0; ci < cols; ci++) {
            const cell = grid[ri][ci];
            const k = ri + "," + ci;
            const div = document.createElement("div");

            if (!valid.has(k)) {
                // Empty space
                gc.appendChild(div);
                continue;
            }

            const isR = revealed.has(k);
            div.className = "grid-cell" + (isR ? " revealed" : "");
            div.style.width = cs + "px";
            div.style.height = cs + "px";
            div.style.borderRadius = br + "px";
            div.style.fontSize = fs + "px";

            if (isR) {
                div.style.background = theme.cellFound + "28";
                div.style.border = "1.5px solid " + theme.cellFound + "60";
                div.style.color = theme.text;
                div.textContent = cell;
            } else {
                div.style.background = theme.cellBg;
                div.style.border = "1px solid rgba(255,255,255,0.08)";
                div.style.color = "transparent";
            }
            gc.appendChild(div);
        }
    }
}

// ---- UNPLACED WORDS ----
function renderUnplaced() {
    let container = document.getElementById("unplaced-container");
    if (!container) return;
    container.innerHTML = "";
    if (!unplacedWords.length) return;

    for (const w of unplacedWords) {
        const found = state.foundWords.includes(w);
        const wordDiv = document.createElement("div");
        wordDiv.className = "unplaced-word";
        for (const ch of w) {
            const cell = document.createElement("div");
            cell.className = "unplaced-cell" + (found ? " found" : "");
            if (found) {
                cell.style.background = theme.cellFound + "28";
                cell.style.border = "1px solid " + theme.cellFound + "40";
                cell.style.color = theme.dim;
                cell.textContent = ch;
            } else {
                cell.style.background = "rgba(255,255,255,0.04)";
                cell.style.border = "1px solid rgba(255,255,255,0.05)";
            }
            wordDiv.appendChild(cell);
        }
        container.appendChild(wordDiv);
    }
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
    const wheelR = Math.min(115, (window.innerWidth - 110) / 2.5);
    const letterR = Math.min(26, Math.max(20, wheelR * 0.28));
    const cx = wheelR + 44, cy = wheelR + 44;
    const cW = (wheelR + 44) * 2;

    wheelPositions = wheelLetters.map((_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(a) * wheelR, y: cy + Math.sin(a) * wheelR };
    });

    // Reset wheel state
    wheelState = { sel: [], word: "", dragging: false, ptr: null };

    section.innerHTML = `
        <div class="current-word" id="current-word" style="color:${theme.accent};text-shadow:0 0 20px ${theme.accent}40">&nbsp;</div>
        <div class="wheel-area" id="wheel-area" style="width:${cW}px;height:${cW}px">
            <svg id="wheel-svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">
                <circle cx="${cx}" cy="${cy}" r="${wheelR + 16}" fill="${theme.wheelBg}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            </svg>
            <div id="wheel-letters"></div>
        </div>
        <div class="action-bar">
            <button class="action-btn" id="shuffle-btn" style="color:${theme.text}">🔀 Shuffle</button>
            <button class="action-btn" id="hint-btn" style="color:${state.coins < 25 ? 'rgba(255,255,255,0.25)' : theme.text}">💡 Hint <span class="cost">(25🪙)</span></button>
        </div>
    `;

    // Render letter circles
    const lettersDiv = document.getElementById("wheel-letters");
    for (let i = 0; i < wheelLetters.length; i++) {
        const p = wheelPositions[i];
        const div = document.createElement("div");
        div.className = "wheel-letter";
        div.id = "wl-" + i;
        div.style.left = (p.x - letterR) + "px";
        div.style.top = (p.y - letterR) + "px";
        div.style.width = (letterR * 2) + "px";
        div.style.height = (letterR * 2) + "px";
        div.style.fontSize = Math.max(18, letterR * 0.75) + "px";
        div.style.color = theme.text;
        div.style.background = "rgba(255,255,255,0.08)";
        div.style.border = "2px solid rgba(255,255,255,0.15)";
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
}

function renderHintBtn() {
    const btn = document.getElementById("hint-btn");
    if (btn) btn.style.color = state.coins < 25 ? "rgba(255,255,255,0.25)" : theme.text;
}

function hitTestWheel(px, py) {
    const letterR = Math.min(26, Math.max(20, Math.min(115, (window.innerWidth - 110) / 2.5) * 0.28));
    for (let i = 0; i < wheelPositions.length; i++) {
        const dx = px - wheelPositions[i].x, dy = py - wheelPositions[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < letterR + 10) return i;
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
        el.style.color = active ? "#000" : theme.text;
        el.style.background = active ? theme.accent : "rgba(255,255,255,0.08)";
        el.style.border = "2px solid " + (active ? theme.accent : "rgba(255,255,255,0.15)");
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
        line.setAttribute("stroke-width", "3.5");
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
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("opacity", "0.3");
        line.setAttribute("stroke-dasharray", "5,5");
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
            <p class="modal-coins" style="color:${theme.text}">+10 🪙${bonusCount > 0 ? " · +" + bonusCount + " bonus" : ""}</p>
            <button class="modal-next-btn" id="next-btn"
                style="background:linear-gradient(135deg,${theme.accent},${theme.accentDark});box-shadow:0 4px 16px ${theme.accent}40">
                ${isLast ? "🏆 All Done!" : "Next Level →"}
            </button>
        </div>
    `;
    document.getElementById("next-btn").onclick = handleNextLevel;
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
    document.getElementById("menu-close-btn").onclick = () => { state.showMenu = false; renderMenu(); };
    
    document.getElementById("menu-prev").onclick = () => {
        if (state.currentLevel > 1) goToLevel(state.currentLevel - 1);
    };
    document.getElementById("menu-next").onclick = () => {
        if (state.currentLevel < maxLv) goToLevel(state.currentLevel + 1);
    };
    document.getElementById("menu-restart").onclick = () => {
        state.foundWords = [];
        state.bonusFound = [];
        saveProgress();
        state.showMenu = false;
        renderMenu();
        renderGrid();
        renderUnplaced();
        renderWordCount();
        showToast("Level restarted");
    };
    
    document.getElementById("goto-level-btn").onclick = () => {
        const input = document.getElementById("goto-level-input");
        const val = parseInt(input.value);
        if (val >= 1 && val <= maxLv && !isNaN(val)) {
            // Allow jumping to any level (not locked to highestLevel)
            state.highestLevel = Math.max(state.highestLevel, val);
            goToLevel(val);
        } else {
            showToast("Level " + val + " not available", "#ff8888");
        }
    };

    document.getElementById("reset-progress-btn").onclick = () => {
        if (confirm("Reset all progress? This cannot be undone.")) {
            localStorage.removeItem("wordplay-save");
            state.currentLevel = 1;
            state.highestLevel = 1;
            state.foundWords = [];
            state.bonusFound = [];
            state.coins = 50;
            state.showMenu = false;
            saveProgress();
            recompute().then(() => renderAll());
        }
    };
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

    // Handle resize
    window.addEventListener("resize", () => {
        renderGrid();
        renderWheel();
    });
}

// Start
document.addEventListener("DOMContentLoaded", () => init());
