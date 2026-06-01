// ============================================================
// WordPlay — Bee Collection ("Active Hive"), DOM/state layer.
// Pure logic in bee-core.js (window.HiveCore). Uses globals:
// state, getTodayStr, saveProgress, and (optional) window.quests popup.
// ============================================================

const DISCOVERY_INTERVAL = 4; // activity completions per discovery attempt

function ensureHive() {
    if (!state.hive) {
        state.hive = { bees: [], active: [], seen: [], progress: 0, lastHintGrant: null };
    }
    return state.hive;
}

// Aggregated perks from the (<=3) equipped bees. Safe before data loads.
function hivePerks() {
    const h = state.hive;
    if (!h || typeof HiveCore === "undefined") {
        return { coinPerWord: 0, honeyPerGoal: 0, honeycombCoins: 0, dailyHint: 0 };
    }
    return HiveCore.activePerks(h.active || []);
}

// Add a bee to the collection (no-op if already owned). Returns the bee or null.
function grantBee(id, label) {
    ensureHive();
    if (!HiveCore.getBee(id)) return null;
    if (state.hive.bees.indexOf(id) !== -1) return null;
    state.hive.bees.push(id);
    if (typeof saveProgress === "function") saveProgress();
    showBeeReveal(HiveCore.getBee(id), label);
    return HiveCore.getBee(id);
}

// Called from activity-completion events; advances discovery and may grant a bee.
function recordActivityForDiscovery() {
    ensureHive();
    const owned = state.hive.bees;
    state.hive.progress = (state.hive.progress || 0) + 1;
    if (state.hive.progress < DISCOVERY_INTERVAL) {
        if (typeof saveProgress === "function") saveProgress();
        return;
    }
    const next = (typeof HiveCore !== "undefined")
        ? HiveCore.pickDiscovery(owned, Math.random) : null;
    if (next) {
        state.hive.progress = 0;
        grantBee(next, "Discovered!");
    } else {
        // Pool exhausted — cap progress so it doesn't spin.
        state.hive.progress = DISCOVERY_INTERVAL;
        if (typeof saveProgress === "function") saveProgress();
    }
}

// Evaluate milestone unlocks given current game facts.
function checkBeeMilestones() {
    ensureHive();
    if (typeof HiveCore === "undefined") return;
    const ctx = {
        ownedIds: state.hive.bees,
        honeycombRankIndex: _honeycombRankIndexToday(),
        questsCompleted: (state.questHistory ? state.questHistory.length : 0)
    };
    const ids = HiveCore.evaluateMilestones(ctx);
    for (const id of ids) grantBee(id, "Milestone!");
}

function _honeycombRankIndexToday() {
    if (typeof getTodaysHoneycomb !== "function" || !state.honeycomb) return 0;
    const p = getTodaysHoneycomb();
    if (!p) return 0;
    return HoneycombCore.currentRankIndex(state.honeycomb.score, p.maxScore);
}

// Grant the dailyHint perk once per calendar day.
function grantDailyHivePerks() {
    ensureHive();
    const today = (typeof getTodayStr === "function") ? getTodayStr() : null;
    if (!today || state.hive.lastHintGrant === today) return;
    const n = hivePerks().dailyHint;
    state.hive.lastHintGrant = today;
    if (n > 0 && typeof MAX_FREE_HINTS !== "undefined") {
        state.freeHints = Math.min((state.freeHints || 0) + n, MAX_FREE_HINTS);
    }
    if (typeof saveProgress === "function") saveProgress();
}

// Reveal celebration. Reuses the quest reward popup if present; else a console note.
function showBeeReveal(bee, label) {
    const tierEmoji = beeTierEmoji(bee.tier);
    if (window.quests && typeof window.quests._showRewardPopup === "function") {
        window.quests._showRewardPopup({ title: (label || "New Bee!") + " " + tierEmoji + " " + bee.name, reward: {} });
    } else if (typeof showToast === "function") {
        showToast((label || "New Bee!") + " " + bee.name);
    }
}

// Emoji placeholder art keyed by tier (Plan 2B replaces with illustrations).
function beeTierEmoji(tier) {
    return ({ common: "🐝", uncommon: "🐝", rare: "🍯", epic: "👑", legendary: "✨" })[tier] || "🐝";
}

function beeTierColor(tier) {
    return ({ common: "#cfcfd6", uncommon: "#8fd6a0", rare: "#6fb8ff", epic: "#c89bff", legendary: "#f4cf4a" })[tier] || "#cfcfd6";
}
