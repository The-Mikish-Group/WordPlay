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
        target: HoneycombCore.hiveTarget(p.words.length), // words needed to fill the hive
        wordSet: new Set(p.words),
        bonusSet: new Set(p.bonus || [])
    };
}

// Make sure state.honeycomb exists for today.
function ensureHoneycombToday() {
    const today = getTodayStr();
    if (!state.honeycomb || state.honeycomb.date !== today) {
        state.honeycomb = { date: today, found: [], score: 0, ranksClaimed: [], pendingJars: 0, completed: false };
    }
}

// Attempt to submit a word. Returns a result object for the UI.
function honeycombSubmit(puzzle, word) {
    ensureHoneycombToday();
    // Flush any jars stashed while no quest was active.
    if (state.honeycomb.pendingJars && state.quest) {
        state.quest.jars = (state.quest.jars || 0) + state.honeycomb.pendingJars;
        state.honeycomb.pendingJars = 0;
    }
    const w = String(word).toUpperCase();
    const v = HoneycombCore.validateWord(w, puzzle);
    if (!v.ok) return v;
    if (state.honeycomb.found.indexOf(w) !== -1) return { ok: false, reason: "dup" };

    const pts = HoneycombCore.scoreWord(w, puzzle.letters);
    state.honeycomb.found.push(w);
    state.honeycomb.score += pts;

    const newRanks = HoneycombCore.newlyReachedRanks(
        state.honeycomb.found.length, puzzle.target, state.honeycomb.ranksClaimed);
    let rankNames = [];
    for (const ri of newRanks) {
        const reward = HoneycombCore.rewardForRank(ri);
        let rankCoins = reward.coins || 0;
        if (typeof hivePerks === "function") rankCoins += hivePerks().honeycombCoins;
        if (rankCoins) {
            state.coins = (state.coins || 0) + rankCoins;
            state.totalCoinsEarned = (state.totalCoinsEarned || 0) + rankCoins;
        }
        if (typeof addLeagueXp === "function") addLeagueXp(LEAGUE_XP.honeycombRank);
        if (reward.jars) {
            if (state.quest) {
                state.quest.jars = (state.quest.jars || 0) + reward.jars;
            } else {
                state.honeycomb.pendingJars = (state.honeycomb.pendingJars || 0) + reward.jars;
            }
        }
        state.honeycomb.ranksClaimed.push(ri);
        rankNames.push(HoneycombCore.RANKS[ri].name);
    }
    // First time we fill the hive (reach Queen Bee == target words), flag it so
    // the UI can fire a one-time completion celebration. Words found afterward
    // still score points/coins — completion just marks the 100% end point.
    let justCompleted = false;
    if (!state.honeycomb.completed
        && HoneycombCore.currentRankIndex(state.honeycomb.found.length, puzzle.target) >= 6) {
        state.honeycomb.completed = true;
        justCompleted = true;
    }
    if (typeof saveProgress === "function") saveProgress();
    if (typeof recordActivityForDiscovery === "function") recordActivityForDiscovery();
    if (newRanks.length && typeof checkBeeMilestones === "function") checkBeeMilestones();
    return {
        ok: true,
        points: pts,
        pangram: HoneycombCore.isPangram(w, puzzle.letters),
        newRankNames: rankNames,
        completed: justCompleted
    };
}

// Small hexagon icon (center letter inside) for the rail button.
function honeycombIcon(centerLetter) {
    return '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">'
        + '<polygon points="15,2 27,9 27,21 15,28 3,21 3,9" fill="rgba(244,165,53,0.92)" stroke="#7a4f10" stroke-width="1.5"></polygon>'
        + '<text x="15" y="20" text-anchor="middle" font-size="14" font-weight="800" fill="#2a1500" font-family="Nunito, sans-serif">'
        + centerLetter + '</text></svg>';
}

// Module-level input buffer for the word being assembled.
let _hcTyped = "";
let _hcOuterOrder = null; // shuffled outer-letter order

function _hcOuterLetters(puzzle) {
    return puzzle.letters.split("").filter(c => c !== puzzle.center);
}

function _hcRankLabel(puzzle) {
    const idx = HoneycombCore.currentRankIndex(state.honeycomb.found.length, puzzle.target);
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
    if (!_hcOuterOrder || _hcOuterOrder.slice().sort().join("") !== _hcOuterLetters(puzzle).slice().sort().join("")) {
        _hcOuterOrder = _hcOuterLetters(puzzle);
    }

    const foundCount = state.honeycomb.found.length;
    const ring = HoneycombCore.ringPct(foundCount, puzzle.target);
    const rank = _hcRankLabel(puzzle);
    const done = !!state.honeycomb.completed || foundCount >= puzzle.target;
    const found = state.honeycomb.found.slice().sort();
    // Bar label: progress toward the hive goal, or a completion mark once full.
    const barLabel = done
        ? `👑 Hive Complete! · ${state.honeycomb.score} pts`
        : `${rank} · ${Math.min(foundCount, puzzle.target)}/${puzzle.target} words · ${state.honeycomb.score} pts`;

    root.innerHTML = `
        <div class="quest-screen honeycomb-screen">
            <button class="quest-close" data-action="close-honeycomb">✕</button>
            <div class="quest-header">
                <div class="quest-header-icon">🍯</div>
                <div class="quest-header-name">Honeycomb</div>
                <div class="quest-header-tagline">Find words using the 7 letters. Every word must use the center letter.</div>
            </div>

            <div class="hc-rankbar${done ? ' hc-rankbar-done' : ''}">
                <div class="hc-rankbar-fill" style="width:${ring}%"></div>
                <div class="hc-rankbar-label">${barLabel}</div>
            </div>

            <div class="hc-typed" id="hc-typed">${_hcTyped || '&nbsp;'}</div>
            <div class="hc-msg" id="hc-msg">&nbsp;</div>

            <div class="hc-hex" id="hc-hex">
                <div class="hc-hex-row">
                    <button class="hc-letter" data-letter="${_hcOuterOrder[0]}">${_hcOuterOrder[0]}</button>
                    <button class="hc-letter" data-letter="${_hcOuterOrder[1]}">${_hcOuterOrder[1]}</button>
                </div>
                <div class="hc-hex-row">
                    <button class="hc-letter" data-letter="${_hcOuterOrder[2]}">${_hcOuterOrder[2]}</button>
                    <button class="hc-letter hc-center" data-letter="${puzzle.center}">${puzzle.center}</button>
                    <button class="hc-letter" data-letter="${_hcOuterOrder[3]}">${_hcOuterOrder[3]}</button>
                </div>
                <div class="hc-hex-row">
                    <button class="hc-letter" data-letter="${_hcOuterOrder[4]}">${_hcOuterOrder[4]}</button>
                    <button class="hc-letter" data-letter="${_hcOuterOrder[5]}">${_hcOuterOrder[5]}</button>
                </div>
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
            // Starting a fresh word? Drop the previous result line (the +points /
            // "not in word list" / "valid but not in today's hive" message).
            if (_hcTyped === "") _hcClearMsg();
            _hcTyped += b.getAttribute("data-letter");
            _hcUpdateTyped();
        });
    });
    root.querySelector("#hc-delete").addEventListener("click", () => {
        _hcTyped = _hcTyped.slice(0, -1);
        _hcUpdateTyped();
    });
    root.querySelector("#hc-shuffle").addEventListener("click", () => {
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

// Clear the result line back to its empty placeholder (keeps the row height).
function _hcClearMsg() {
    const el = document.getElementById("hc-msg");
    if (!el) return;
    el.innerHTML = "&nbsp;";
    el.className = "hc-msg";
}

const _HC_REASONS = {
    short: "Words must be at least 4 letters",
    center: "Must use the center letter",
    badletter: "That letter isn't in the hive",
    unlisted: "Valid word — just not in today's hive 🍯",
    notword: "Not in the word list",
    dup: "Already found"
};

function _hcEnter(puzzle) {
    const word = _hcTyped;
    if (!word) return;
    const res = honeycombSubmit(puzzle, word);
    if (!res.ok) {
        // "unlisted" = a real word that just isn't a scored answer — gentler styling.
        const kind = (res.reason === "unlisted" || res.reason === "dup") ? "info" : "bad";
        _hcMsg(_HC_REASONS[res.reason] || "Try another word", kind);
        _hcTyped = "";
        _hcUpdateTyped();
        return;
    }
    let msg = "+" + res.points;
    if (res.pangram) msg = "PANGRAM! +" + res.points;
    if (res.newRankNames.length) msg += " · " + res.newRankNames[res.newRankNames.length - 1] + "!";
    _hcTyped = "";
    renderHoneycomb();          // refresh score, rank bar, found list
    if (res.completed) {
        _hcMsg("👑 Hive Complete!", "pangram");
        if (typeof showHoneycombCompleteCelebration === "function") showHoneycombCompleteCelebration();
    } else {
        _hcMsg(msg, res.pangram ? "pangram" : "good");
    }
}

// One-time celebration when the daily hive is filled to 100% (Queen Bee).
// Self-contained overlay; reuses the grand-prize CSS keyframes in app.css.
function showHoneycombCompleteCelebration() {
    if (typeof playSound === "function") { try { playSound("bonusChime"); } catch (e) { /* noop */ } }
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:99998;pointer-events:none;"
        + "display:flex;align-items:center;justify-content:center;animation:grandPrizeFadeIn 0.4s ease;";
    for (let i = 0; i < 24; i++) {
        const p = document.createElement("div");
        const startX = 30 + Math.random() * 40;
        const drift = (Math.random() - 0.5) * 60;
        const delay = Math.random() * 0.6;
        const dur = 1.5 + Math.random();
        const size = 16 + Math.random() * 12;
        p.textContent = Math.random() > 0.4 ? "🍯" : "👑";
        p.style.cssText = "position:absolute;top:-20px;left:" + startX + "%;font-size:" + size + "px;"
            + "opacity:0;pointer-events:none;--drift:" + drift + "px;"
            + "animation:grandPrizeCoinFall " + dur + "s " + delay + "s ease-in forwards;";
        overlay.appendChild(p);
    }
    const banner = document.createElement("div");
    banner.innerHTML = '<div style="font-size:42px;margin-bottom:8px">👑</div>'
        + '<div style="font-size:24px;font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.5)">Hive Complete!</div>'
        + '<div style="font-size:16px;font-weight:700;color:#ffe08a;margin-top:6px;text-shadow:0 2px 8px rgba(0,0,0,0.5)">You reached Queen Bee 🍯</div>';
    banner.style.cssText = "text-align:center;padding:28px 40px;"
        + "background:radial-gradient(ellipse,rgba(244,165,53,0.28) 0%,rgba(0,0,0,0.6) 70%);"
        + "border-radius:20px;border:2px solid rgba(255,215,0,0.45);"
        + "backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);"
        + "animation:grandPrizeBannerPop 0.5s 0.2s ease both;";
    overlay.appendChild(banner);
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.style.animation = "grandPrizeFadeOut 0.5s ease forwards";
        setTimeout(() => overlay.remove(), 500);
    }, 2600);
}

function _hcClose() {
    state.showHoneycomb = false;
    _hcTyped = "";
    _hcOuterOrder = null;
    if (typeof renderHome === "function") renderHome();
}
