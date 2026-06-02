// ============================================================
// WordPlay — Weekly Leagues (client). Talks to the 3A backend
// (/api/league/me, /api/league/claim). Mirrors sync.js auth.
// Globals: state, saveProgress, isSignedIn, getAuthHeaders,
// _handleAuthExpired, renderActivityButton, renderHome, grantBee,
// renderAvatar, showToast, window.quests._showRewardPopup.
// ============================================================

const LEAGUE_TTL = 3 * 60000; // ms; refetch cadence for the rail button cache
let _leagueCache = null;
let _leagueFetchedAt = 0;

const LEAGUE_DIVISIONS = ["Clover", "Blossom", "Sunflower", "Amber", "Queen's Court"];
function leagueDivisionName(d) {
    return LEAGUE_DIVISIONS[Math.max(0, Math.min(LEAGUE_DIVISIONS.length - 1, d || 0))];
}

// XP award amounts (tunable). Server ratchets + caps weekly.
const LEAGUE_XP = {
    word: 2, longWordBonus: 1, bonusWord: 3, standalone: 10,
    level: 10, honeycombRank: 15, dailyGoal: 10, dailyPuzzle: 20, bonusPuzzle: 15,
};

function addLeagueXp(n) {
    if (!n) return;
    state.leagueXp = (state.leagueXp || 0) + n; // persisted by the normal saveProgress
}

async function loadLeague(force) {
    if (typeof isSignedIn !== "function" || !isSignedIn()) return null;
    const now = Date.now();
    if (!force && _leagueCache && (now - _leagueFetchedAt) < LEAGUE_TTL) return _leagueCache;
    try {
        const res = await fetch("/api/league/me", { headers: getAuthHeaders() });
        if (res.status === 401) { if (typeof _handleAuthExpired === "function") _handleAuthExpired(); return null; }
        if (!res.ok) return _leagueCache;
        const data = await res.json();
        _leagueCache = data;
        _leagueFetchedAt = now;
        if (data && data.pendingResults && data.pendingResults.length) {
            await claimAndCelebrate(data.pendingResults);
        }
        return data;
    } catch (e) {
        return _leagueCache;
    }
}

async function claimLeague() {
    try {
        const res = await fetch("/api/league/claim", { method: "POST", headers: getAuthHeaders() });
        if (res.status === 401 && typeof _handleAuthExpired === "function") _handleAuthExpired();
    } catch (e) { /* offline — rewards already applied locally; retried next load */ }
}

// Apply prior-week rewards locally (idempotent via state.leagueClaimedWeeks), then ack the server.
async function claimAndCelebrate(results) {
    if (!Array.isArray(results) || !results.length) return;
    if (!Array.isArray(state.leagueClaimedWeeks)) state.leagueClaimedWeeks = [];
    let applied = false;
    for (const r of results) {
        if (state.leagueClaimedWeeks.indexOf(r.weekId) !== -1) continue; // already applied locally
        const coins = r.rewardCoins || 0, honey = r.rewardHoney || 0, beeId = r.rewardBeeId || null;
        if (coins) { state.coins = (state.coins || 0) + coins; state.totalCoinsEarned = (state.totalCoinsEarned || 0) + coins; }
        if (honey && state.quest) { state.quest.jars = (state.quest.jars || 0) + honey; }
        if (beeId && typeof grantBee === "function") { grantBee(beeId, "League prize!"); }
        state.leagueClaimedWeeks.push(r.weekId);
        applied = true;
        _leagueCelebrate(r, coins, honey);
    }
    if (applied) {
        if (typeof saveProgress === "function") saveProgress();
        await claimLeague();
    }
}

function _outcomeLabel(o) {
    return o === "promoted" ? "Promoted!" : o === "demoted" ? "Moved down a tier" : "Held your spot";
}

function _leagueCelebrate(r, coins, honey) {
    if (window.quests && typeof window.quests._showRewardPopup === "function") {
        const title = "#" + r.rank + " in " + leagueDivisionName(r.division) + " — " + _outcomeLabel(r.outcome);
        window.quests._showRewardPopup({ title, reward: { coins: coins, jars: honey } });
    }
}

// Left-rail Leagues button (uses Slice 1's renderActivityButton).
function renderLeagueRailButton() {
    if (typeof renderActivityButton !== "function") return "";
    const signedIn = typeof isSignedIn === "function" && isSignedIn();
    if (!signedIn) {
        return renderActivityButton({ action: "open-league", icon: "🏆", pill: "Join", waiting: false, glow: false, title: "Leagues — sign in to join" });
    }
    const c = _leagueCache;
    if (!c || !c.ready) {
        return renderActivityButton({ action: "open-league", icon: "🏆", pill: "—", waiting: false, glow: false, title: "Leagues" });
    }
    const count = (c.standings && c.standings.length) || 1;
    const rank = (c.you && c.you.rank) || count;
    const ring = Math.round((count - rank) / Math.max(1, count - 1) * 100);
    const hasReward = !!(c.pendingResults && c.pendingResults.length);
    return renderActivityButton({
        action: "open-league",
        icon: "🏆",
        ringPct: ring,
        pill: "#" + rank,
        badge: hasReward ? "!" : null,
        waiting: false,
        glow: hasReward,
        title: "Leagues — " + (c.divisionName || leagueDivisionName(c.division)) + ", #" + rank + " of " + count,
    });
}
