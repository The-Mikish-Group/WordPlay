// ============================================================
// WordPlay — Quests, Daily Goals, Bees engagement layer
// ============================================================

// In-memory cache of quests.json after first load
let _questsManifest = null;

// Goal template registry — defines how each goal works.
// `event`: which tick event matches this goal
// `match(payload)`: returns true if the event payload counts toward this goal
// `target`: default target count
// `reward`: { jars, coins, hints?, targets?, rockets?, bees? }
// `description(target)`: human-readable goal text
const GOAL_TEMPLATES = {
    playLevels: {
        event: "levelComplete",
        match: () => true,
        target: 5,
        reward: { jars: 10, coins: 5 },
        description: (n) => `Play ${n} levels`,
        icon: "📘",
    },
    findLongWords: {
        event: "wordFound",
        match: (p) => p.word && p.word.length >= 5 && !p.bonus,
        target: 8,
        reward: { jars: 10, coins: 5 },
        description: (n) => `Find ${n} words with 5+ letters`,
        icon: "🔠",
    },
    findBonusWords: {
        event: "wordFound",
        match: (p) => p.bonus === true,
        target: 5,
        reward: { jars: 10, coins: 5 },
        description: (n) => `Find ${n} bonus words`,
        icon: "✨",
    },
    findStandalone: {
        event: "wordFound",
        match: (p) => p.standalone === true,
        target: 1,
        reward: { jars: 15, coins: 10 },
        description: () => "Find a standalone coin word",
        icon: "🪙",
    },
    useHint: {
        event: "hintUsed",
        match: () => true,
        target: 3,
        reward: { jars: 10, coins: 0 },
        description: (n) => `Use any hint ${n} times`,
        icon: "💡",
    },
    useTarget: {
        event: "hintUsed",
        match: (p) => p.kind === "target",
        target: 1,
        reward: { jars: 10, coins: 0 },
        description: () => "Use a target hint",
        icon: "🎯",
    },
    noHintLevel: {
        event: "levelComplete",
        match: (p) => p.hintsUsed === 0,
        target: 1,
        reward: { jars: 15, coins: 10 },
        description: () => "Complete a level without hints",
        icon: "🧠",
    },
    flowLevels: {
        event: "levelComplete",
        match: (p) => p.flow === true,
        target: 2,
        reward: { jars: 10, coins: 5 },
        description: (n) => `Complete ${n} flow levels`,
        icon: "🌊",
    },
    speedLevel: {
        event: "levelComplete",
        match: (p) => p.speedBonus === true,
        target: 1,
        reward: { jars: 15, coins: 10 },
        description: () => "Earn a speed bonus",
        icon: "⚡",
    },
    dailyPuzzle: {
        event: "levelComplete",
        match: (p) => p.daily === true,
        target: 1,
        reward: { jars: 15, coins: 10 },
        description: () => "Complete today's daily puzzle",
        icon: "📅",
    },
    findStarLevel: {
        event: "starCollected",
        match: () => true,
        target: 3,
        reward: { jars: 10, coins: 5 },
        description: (n) => `Collect ${n} stars`,
        icon: "⭐",
    },
    bonusWordTotal: {
        event: "wordFound",
        match: (p) => p.bonus === true,
        target: 10,
        reward: { jars: 10, coins: 5 },
        description: (n) => `Find ${n} bonus words`,
        icon: "📚",
    },
    spendCoinsOnHints: {
        event: "hintUsed",
        match: (p) => p.paid === true,
        target: 2,
        reward: { jars: 10, coins: 5 },
        description: (n) => `Use ${n} coin-purchased hints`,
        icon: "💰",
    },
};

// Tiny seeded PRNG (mulberry32) for deterministic goal selection
function _seededRandom(seed) {
    let s = seed >>> 0;
    return function () {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// djb2-style 32-bit string hash, used privately as a seed for _seededRandom.
// Independent of app.js's hashStr (different algorithm) — distribution is fine for seeding.
function _hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h;
}

async function loadQuestsManifest() {
    if (_questsManifest) return _questsManifest;
    try {
        const resp = await fetch("data/quests.json");
        if (!resp.ok) return null;
        const data = await resp.json();
        _questsManifest = data;
        return data;
    } catch (e) {
        return null;
    }
}

function findActiveQuest(manifest, todayIso) {
    if (!manifest || !Array.isArray(manifest.quests)) return null;
    return manifest.quests.find(q => q.start <= todayIso && todayIso <= q.end) || null;
}

// Pick today's daily goals deterministically from a quest's goal pool.
// Same date + same goalPool → same 3 goals worldwide.
function generateDailyGoals(quest, todayIso) {
    if (!quest || !Array.isArray(quest.goalPool) || quest.goalPool.length === 0) return null;
    const seed = _hashStr(todayIso + ":" + quest.id);
    const rand = _seededRandom(seed);
    const pool = [...quest.goalPool];
    const picked = [];
    const wantCount = Math.min(3, pool.length);
    while (picked.length < wantCount && pool.length > 0) {
        const idx = Math.floor(rand() * pool.length);
        const tplId = pool.splice(idx, 1)[0];
        if (!GOAL_TEMPLATES[tplId]) continue;
        picked.push({
            template: tplId,
            target: GOAL_TEMPLATES[tplId].target,
            progress: 0,
            claimed: false,
        });
    }
    return { date: todayIso, goals: picked };
}

// Activate / archive / regenerate. Called on every app load.
// Returns true if anything changed (so caller can save).
function activateQuestForToday(manifest, todayIso) {
    if (typeof state === "undefined") return false;
    // Cache the manifest so _checkMilestones can use it without an async fetch.
    if (manifest) _questsManifest = manifest;
    let changed = false;

    const active = findActiveQuest(manifest, todayIso);

    // Quest rollover: existing quest doesn't match today's active
    if (state.quest && (!active || state.quest.id !== active.id)) {
        // Archive the outgoing quest into history
        state.questHistory = state.questHistory || [];
        const alreadyArchived = state.questHistory.some(e => e.id === state.quest.id);
        if (!alreadyArchived) {
            state.questHistory.push({
                id: state.quest.id,
                finalJars: state.quest.jars || 0,
                tiersClaimed: [...(state.quest.claimedTiers || [])],
                completedAt: todayIso,
            });
        }
        state.quest = null;
        changed = true;
    }

    // Bootstrap new active quest
    if (active && !state.quest) {
        state.quest = {
            id: active.id,
            start: active.start,
            end: active.end,
            jars: 0,
            claimedTiers: [],
        };
        changed = true;
    }

    // Daily goals: regenerate if date doesn't match today
    if (!state.dailyGoals || state.dailyGoals.date !== todayIso) {
        state.dailyGoals = active ? generateDailyGoals(active, todayIso) : null;
        changed = true;
    }

    return changed;
}

// Look up a quest definition by id from the manifest
function getQuestDefinition(manifest, questId) {
    if (!manifest || !Array.isArray(manifest.quests)) return null;
    return manifest.quests.find(q => q.id === questId) || null;
}

// Increment a daily goal's progress when an event fires.
// Auto-claims the goal AND the next quest milestone tier if thresholds are crossed.
// `event`: "levelComplete" | "wordFound" | "hintUsed" | "starCollected"
// `payload`: event-specific data (see GOAL_TEMPLATES match() functions)
function tickProgress(event, payload) {
    if (typeof state === "undefined") return;
    if (!state.dailyGoals || !state.dailyGoals.goals) return;

    for (const goal of state.dailyGoals.goals) {
        if (goal.claimed) continue;
        const tpl = GOAL_TEMPLATES[goal.template];
        if (!tpl || tpl.event !== event) continue;
        if (!tpl.match(payload || {})) continue;
        goal.progress = (goal.progress || 0) + 1;

        if (goal.progress >= goal.target) {
            // Auto-claim: pay reward + add jars to active quest
            const reward = tpl.reward || {};
            _payReward(reward);
            goal.claimed = true;
            _showRewardPopup({
                title: tpl.description(goal.target) + " ✓",
                reward,
            });
            if (state.quest && reward.jars) {
                state.quest.jars = (state.quest.jars || 0) + reward.jars;
            }
        }
    }

    // Always check milestones — cheap + idempotent + self-heals stale state
    // where jars already crossed a threshold but the tier wasn't claimed.
    _checkMilestones();

    if (typeof saveProgress === "function") saveProgress();
}

// Pay reward to player state.  Reward shape: { jars, coins, hints, targets, rockets, bees }
function _payReward(reward) {
    if (!reward || typeof state === "undefined") return;
    if (reward.coins) {
        state.coins = (state.coins || 0) + reward.coins;
        state.totalCoinsEarned = (state.totalCoinsEarned || 0) + reward.coins;
    }
    if (reward.hints)   state.freeHints   = Math.min((state.freeHints   || 0) + reward.hints,   MAX_FREE_HINTS);
    if (reward.targets) state.freeTargets = Math.min((state.freeTargets || 0) + reward.targets, MAX_FREE_TARGETS);
    if (reward.rockets) state.freeRockets = Math.min((state.freeRockets || 0) + reward.rockets, MAX_FREE_ROCKETS);
    if (reward.bees)    state.questedBees = (state.questedBees || 0) + reward.bees;
}

// Check whether crossing the current jar count fires any unclaimed milestones.
function _checkMilestones() {
    if (!state.quest) return;
    if (!_questsManifest) return;
    const def = getQuestDefinition(_questsManifest, state.quest.id);
    if (!def || !Array.isArray(def.milestones)) return;

    for (let i = 0; i < def.milestones.length; i++) {
        if (state.quest.claimedTiers.includes(i)) continue;
        if (state.quest.jars >= def.milestones[i].at) {
            _payReward(def.milestones[i].reward || {});
            state.quest.claimedTiers.push(i);
            _showRewardPopup({
                title: "Tier " + (i + 1) + " reached!",
                reward: def.milestones[i].reward || {},
            });
        }
    }
}

const _popupQueue = [];
let _popupShowing = false;

function _showRewardPopup(payload) {
    _popupQueue.push(payload);
    if (!_popupShowing) _drainPopupQueue();
}

function _drainPopupQueue() {
    if (_popupQueue.length === 0) {
        _popupShowing = false;
        return;
    }
    _popupShowing = true;
    const next = _popupQueue.shift();
    const el = document.getElementById("reward-popup");
    if (!el) {
        // No popup element — skip and continue
        setTimeout(_drainPopupQueue, 50);
        return;
    }
    el.innerHTML = _renderPopupHtml(next);
    el.classList.remove("hidden");
    requestAnimationFrame(() => el.classList.add("visible"));

    // Play a soft chime if sound is on
    if (typeof state !== "undefined" && state.soundEnabled && typeof playSfx === "function") {
        try { playSfx("reward"); } catch (e) { /* noop */ }
    }

    setTimeout(() => {
        el.classList.remove("visible");
        setTimeout(() => {
            el.classList.add("hidden");
            setTimeout(_drainPopupQueue, 100);
        }, 300);
    }, 1800);
}

function _renderPopupHtml(payload) {
    const title = payload.title || "Reward!";
    const r = payload.reward || {};
    const lines = [];
    if (r.coins) lines.push(`<div class="reward-line"><span class="reward-icon">🪙</span>+${r.coins} coins</div>`);
    if (r.bees) lines.push(`<div class="reward-line"><span class="reward-icon">🐝</span>+${r.bees} bee${r.bees > 1 ? 's' : ''}</div>`);
    if (r.hints) lines.push(`<div class="reward-line"><span class="reward-icon">💡</span>+${r.hints} hint${r.hints > 1 ? 's' : ''}</div>`);
    if (r.targets) lines.push(`<div class="reward-line"><span class="reward-icon">🎯</span>+${r.targets} target${r.targets > 1 ? 's' : ''}</div>`);
    if (r.rockets) lines.push(`<div class="reward-line"><span class="reward-icon">🚀</span>+${r.rockets} rocket${r.rockets > 1 ? 's' : ''}</div>`);
    if (r.jars) lines.push(`<div class="reward-line"><span class="reward-icon">🍯</span>+${r.jars} jars</div>`);
    return `<div class="reward-title">${title}</div>${lines.join("")}`;
}

// Expose for app.js
window.quests = {
    loadQuestsManifest,
    findActiveQuest,
    generateDailyGoals,
    activateQuestForToday,
    getQuestDefinition,
    tickProgress,
    getCachedManifest: () => _questsManifest,
    GOAL_TEMPLATES,
};
