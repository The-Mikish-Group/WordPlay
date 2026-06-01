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

// ---------- Hive / album screen ----------
function renderHive() {
    const root = document.getElementById("app");
    if (!root) return;
    ensureHive();
    const h = state.hive;
    const all = HiveCore.BEES;
    const ownedSet = new Set(h.bees);
    const total = all.length;

    // Mark all owned bees as seen (clears NEW badges + rail "!").
    h.seen = Array.from(new Set([].concat(h.seen, h.bees)));
    if (typeof saveProgress === "function") saveProgress();

    const slots = [];
    for (let i = 0; i < HiveCore.MAX_ACTIVE; i++) {
        const id = h.active[i];
        slots.push(id
            ? `<button class="hive-slot filled" data-unequip="${id}" style="border-color:${beeTierColor(HiveCore.getBee(id).tier)}"><span class="hive-slot-emoji">${beeTierEmoji(HiveCore.getBee(id).tier)}</span><span class="hive-slot-name">${HiveCore.getBee(id).name}</span></button>`
            : `<div class="hive-slot empty">+</div>`);
    }

    const cards = all.map(b => {
        const owned = ownedSet.has(b.id);
        if (!owned) {
            const hint = b.source === "discovery" ? "Found by playing" : "Special achievement";
            return `<div class="hive-card locked"><div class="hive-card-art">❓</div><div class="hive-card-name">???</div><div class="hive-card-hint">${hint}</div></div>`;
        }
        const isActive = h.active.indexOf(b.id) !== -1;
        return `<button class="hive-card owned${isActive ? ' active' : ''}" data-bee="${b.id}" style="border-color:${beeTierColor(b.tier)}">
            <div class="hive-card-art">${beeTierEmoji(b.tier)}</div>
            <div class="hive-card-name">${b.name}</div>
            <div class="hive-card-tier" style="color:${beeTierColor(b.tier)}">${b.tier}</div>
            ${isActive ? '<div class="hive-card-badge">Active</div>' : ''}
        </button>`;
    }).join("");

    root.innerHTML = `
        <div class="quest-screen hive-screen">
            <button class="quest-close" data-action="close-hive">✕</button>
            <div class="quest-header">
                <div class="quest-header-icon">🐝</div>
                <div class="quest-header-name">The Hive</div>
                <div class="quest-header-tagline">Equip up to ${HiveCore.MAX_ACTIVE} bees. Only equipped bees' perks apply.</div>
            </div>
            <div class="hive-progress">${h.bees.length} / ${total} bees collected</div>
            <div class="hive-slots">${slots.join("")}</div>
            <div class="hive-grid">${cards}</div>
            <div class="hive-detail" id="hive-detail"></div>
        </div>`;

    _hiveWire();
}

function _hiveWire() {
    const root = document.getElementById("app");
    root.querySelector("[data-action='close-hive']").addEventListener("click", () => {
        state.showHive = false;
        if (typeof renderHome === "function") renderHome();
    });
    root.querySelectorAll("[data-bee]").forEach(el =>
        el.addEventListener("click", () => _hiveShowDetail(el.getAttribute("data-bee"))));
    root.querySelectorAll("[data-unequip]").forEach(el =>
        el.addEventListener("click", () => { _hiveUnequip(el.getAttribute("data-unequip")); }));
}

function _hiveShowDetail(id) {
    const b = HiveCore.getBee(id);
    if (!b) return;
    const isActive = state.hive.active.indexOf(id) !== -1;
    const canAdd = HiveCore.canEquip(state.hive, id);
    const btn = isActive
        ? `<button class="hive-btn" id="hive-unequip">Unequip</button>`
        : (canAdd ? `<button class="hive-btn hive-equip" id="hive-equip">Equip</button>`
                  : `<button class="hive-btn" disabled>Hive full (unequip one first)</button>`);
    const el = document.getElementById("hive-detail");
    el.innerHTML = `
        <div class="hive-detail-card" style="border-color:${beeTierColor(b.tier)}">
            <div class="hive-detail-art">${beeTierEmoji(b.tier)}</div>
            <div class="hive-detail-name">${b.name}</div>
            <div class="hive-detail-tier" style="color:${beeTierColor(b.tier)}">${b.tier}</div>
            <div class="hive-detail-perk">${perkLabel(b.perk)}</div>
            <div class="hive-detail-flavor">${b.flavor}</div>
            ${btn}
        </div>`;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const eq = document.getElementById("hive-equip");
    if (eq) eq.addEventListener("click", () => _hiveEquip(id));
    const uq = document.getElementById("hive-unequip");
    if (uq) uq.addEventListener("click", () => _hiveUnequip(id));
}

function _hiveEquip(id) {
    if (HiveCore.canEquip(state.hive, id)) {
        state.hive.active.push(id);
        if (typeof saveProgress === "function") saveProgress();
        renderHive();
    }
}

function _hiveUnequip(id) {
    state.hive.active = state.hive.active.filter(x => x !== id);
    if (typeof saveProgress === "function") saveProgress();
    renderHive();
}

function perkLabel(perk) {
    switch (perk.type) {
        case "coinPerWord":   return "+" + perk.value + " coin" + (perk.value > 1 ? "s" : "") + " per word found";
        case "honeyPerGoal":  return "+" + perk.value + " 🍯 per daily goal completed";
        case "honeycombCoins":return "+" + perk.value + " coins per Honeycomb rank-up";
        case "dailyHint":     return "+" + perk.value + " free hint" + (perk.value > 1 ? "s" : "") + " each day";
        default: return "";
    }
}

// Right-rail Collection button (uses Slice 1's renderActivityButton).
function renderHiveRailButton() {
    ensureHive();
    if (typeof HiveCore === "undefined") return "";
    const total = HiveCore.BEES.length;
    const owned = state.hive.bees.length;
    const ring = total > 0 ? Math.round((owned / total) * 100) : 0;
    const unseen = state.hive.bees.some(id => state.hive.seen.indexOf(id) === -1);
    return renderActivityButton({
        action: "open-hive",
        icon: "🍯",
        ringPct: ring,
        pill: owned + "/" + total,
        badge: unseen ? "!" : null,
        waiting: false,
        glow: unseen,
        title: "The Hive — " + owned + " of " + total + " bees"
    });
}
