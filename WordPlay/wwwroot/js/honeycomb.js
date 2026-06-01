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
        wordSet: new Set(p.words)
    };
}

// Make sure state.honeycomb exists for today.
function ensureHoneycombToday() {
    const today = getTodayStr();
    if (!state.honeycomb || state.honeycomb.date !== today) {
        state.honeycomb = { date: today, found: [], score: 0, ranksClaimed: [] };
    }
}

// Attempt to submit a word. Returns a result object for the UI.
function honeycombSubmit(puzzle, word) {
    ensureHoneycombToday();
    const w = String(word).toUpperCase();
    const v = HoneycombCore.validateWord(w, puzzle);
    if (!v.ok) return v;
    if (state.honeycomb.found.indexOf(w) !== -1) return { ok: false, reason: "dup" };

    const pts = HoneycombCore.scoreWord(w, puzzle.letters);
    state.honeycomb.found.push(w);
    state.honeycomb.score += pts;

    const newRanks = HoneycombCore.newlyReachedRanks(
        state.honeycomb.score, puzzle.maxScore, state.honeycomb.ranksClaimed);
    let rankNames = [];
    for (const ri of newRanks) {
        const reward = HoneycombCore.rewardForRank(ri);
        if (reward.coins) {
            state.coins = (state.coins || 0) + reward.coins;
            state.totalCoinsEarned = (state.totalCoinsEarned || 0) + reward.coins;
        }
        if (reward.jars && state.quest) {
            state.quest.jars = (state.quest.jars || 0) + reward.jars;
        }
        state.honeycomb.ranksClaimed.push(ri);
        rankNames.push(HoneycombCore.RANKS[ri].name);
    }
    if (typeof saveProgress === "function") saveProgress();
    return {
        ok: true,
        points: pts,
        pangram: HoneycombCore.isPangram(w, puzzle.letters),
        newRankNames: rankNames
    };
}

// Small hexagon icon (center letter inside) for the rail button.
function honeycombIcon(centerLetter) {
    return '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">'
        + '<polygon points="15,2 27,9 27,21 15,28 3,21 3,9" fill="rgba(244,165,53,0.92)" stroke="#7a4f10" stroke-width="1.5"></polygon>'
        + '<text x="15" y="20" text-anchor="middle" font-size="14" font-weight="800" fill="#2a1500" font-family="Nunito, sans-serif">'
        + centerLetter + '</text></svg>';
}
