// ============================================================
// WordPlay — Progress Sync (Push / Pull / Merge)
// ============================================================

let _syncPushTimer = null;
let _syncPulling = false;
const SYNC_DEBOUNCE_MS = 3000;

// Auto-pull when the app regains focus (tab switch, phone resume, PWA reopen)
// Auto-flush any pending push when the app loses focus, so the next device
// to open the app gets the latest state immediately (no 3s debounce gap).
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && typeof isSignedIn === "function" && isSignedIn()) {
        syncPullAndReload();
    } else if (document.visibilityState === "hidden" && typeof isSignedIn === "function" && isSignedIn()) {
        if (_syncPushTimer) {
            clearTimeout(_syncPushTimer);
            _syncPushTimer = null;
            syncPush();
        }
    }
});

async function syncPullAndReload() {
    if (_syncPulling) return;
    // Don't clobber active daily or bonus puzzle session
    if (typeof state !== "undefined" && (state.isDailyMode || state.isBonusMode)) return;
    _syncPulling = true;
    try {
        await syncPull();
        if (typeof loadProgress === "function") loadProgress();
        if (window.quests) {
            const manifest = await window.quests.loadQuestsManifest();
            const changed = window.quests.activateQuestForToday(manifest, getTodayStr());
            if (changed && typeof saveProgress === "function") saveProgress();
        }
        if (typeof recompute === "function") await recompute();
        if (typeof restoreLevelState === "function") restoreLevelState();
        if (typeof renderCurrentScreen === "function") renderCurrentScreen();
        else if (typeof renderAll === "function") renderAll();
    } catch (e) { /* ignore */ }
    _syncPulling = false;
}

function scheduleSyncPush() {
    if (!isSignedIn()) return;
    clearTimeout(_syncPushTimer);
    _syncPushTimer = setTimeout(syncPush, SYNC_DEBOUNCE_MS);
}

// Handle a 401 response from the API.  The user's JWT has expired or is
// otherwise invalid, so the server is rejecting their saves.  Without this,
// fetch() resolves successfully on a 401 (it only throws on network errors)
// and our catch block doesn't fire, so progress would silently stop syncing
// while the user keeps playing — exactly what was happening on iOS PWA
// users whose tokens hit the 30-day mark.
//
// When we see a 401 we sign the user out and surface a toast so they
// re-authenticate.  Future signed-in saves will start syncing again.
function _handleAuthExpired() {
    if (typeof signOut === "function") signOut();
    if (typeof showToast === "function") {
        // 5-arg form: msg, color, fast, bg, durationMs (5 seconds for an
        // important notice the player needs to actually read).
        showToast("Sign in again to save your progress",
            "#ffce80", false, "rgba(40,20,10,0.95)", 5000);
    }
    // Re-render so the home/settings pick up the signed-out state.
    if (typeof renderHome === "function" && typeof state !== "undefined" && state.showHome) renderHome();
}

async function syncPush() {
    if (!isSignedIn()) return;
    try {
        const raw = localStorage.getItem("wordplay-save");
        if (!raw) return;
        const progress = JSON.parse(raw);
        const res = await fetch("/api/progress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ progress }),
        });
        if (res.status === 401) _handleAuthExpired();
    } catch (e) {
        // Network failure — silently fail, will retry on next save
    }
}

async function syncPull() {
    if (!isSignedIn()) return;
    try {
        const res = await fetch("/api/progress", {
            headers: getAuthHeaders(),
        });
        if (res.status === 401) { _handleAuthExpired(); return; }
        if (!res.ok) return;
        const data = await res.json();
        if (!data.progress) return; // no server data yet

        const serverSave = typeof data.progress === "string"
            ? JSON.parse(data.progress)
            : data.progress;

        // Store monthly baselines for settings UI
        if (data.monthlyStart !== undefined) localStorage.setItem("wordplay-monthly-start", data.monthlyStart);
        if (data.monthlyCoinsStart !== undefined) localStorage.setItem("wordplay-monthly-coins-start", data.monthlyCoinsStart);

        // Track which user owns the local data. If a different user
        // signed in, discard the stale local data so it can't contaminate
        // the new user's progress (fixes phantom level cross-user bleed).
        const currentUid = getUser() && getUser().id;
        const storedUid = localStorage.getItem("wordplay-uid");
        const sameUser = storedUid && String(storedUid) === String(currentUid);
        if (currentUid) localStorage.setItem("wordplay-uid", currentUid);

        const localRaw = localStorage.getItem("wordplay-save");
        const localSave = localRaw ? JSON.parse(localRaw) : null;

        if (!localSave || !sameUser) {
            // No local data or different user — use server data as-is
            localStorage.setItem("wordplay-save", JSON.stringify(serverSave));
            return;
        }

        const merged = mergeProgress(localSave, serverSave);
        localStorage.setItem("wordplay-save", JSON.stringify(merged));

        // Push merged result back
        const pushRes = await fetch("/api/progress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ progress: merged }),
        });
        if (pushRes.status === 401) _handleAuthExpired();
    } catch (e) {
        // Offline or error — continue with local data
    }
}

// Normalize a save to current format in place.
// If the save is v7 or earlier with a nonzero doff, subtract doff from
// level numbers so they become display levels.
// v8+ saves get default v9 fields added if missing.
function _normalizeToCurrent(s) {
    if (!s || (s.v && s.v >= 8)) {
        // v8+ already has display levels; just ensure v9 fields exist
        if (s) {
            s.nb = s.nb ?? 0;
            s.q = s.q ?? null;
            s.dg = s.dg ?? null;
            s.qh = s.qh ?? [];
            s.v = 9;
        }
        return s;
    }
    const doff = s.doff || 0;
    if (doff > 0) {
        s.cl = Math.max(1, (s.cl || 1) - doff);
        s.hl = Math.max(1, (s.hl || 1) - doff);
        s.lc = Math.max(0, (s.lc || 0) - doff);
        if (s.ip && typeof s.ip === "object") {
            const newIp = {};
            for (const [key, val] of Object.entries(s.ip)) {
                const dk = Number(key) - doff;
                if (dk >= 1) newIp[dk] = val;
            }
            s.ip = newIp;
        }
    }
    s.nb = 0;
    s.q = null;
    s.dg = null;
    s.qh = [];
    s.v = 9;
    return s;
}

function mergeProgress(local, server) {
    // Normalize both saves to current format before comparing,
    // so raw vs display mismatches can't corrupt the merge.
    _normalizeToCurrent(local);
    _normalizeToCurrent(server);

    const merged = { v: 9 };

    // Monotonically-increasing fields — always take the max
    merged.hl = Math.max(local.hl || 1, server.hl || 1);
    merged.lc = Math.max(local.lc || 0, server.lc || 0);
    merged.bc = Math.max(local.bc || 0, server.bc || 0);
    merged.tce = Math.max(local.tce || 0, server.tce || 0);

    // Spendable balances (coins, free hints/targets/rockets) — take from the
    // most-recently-saved device so spending on one device isn't overridden by
    // a stale higher balance on another.
    const latest = (local.sa || 0) >= (server.sa || 0) ? local : server;
    merged.co = latest.co || 0;
    merged.fh = latest.fh || 0;
    merged.ft = latest.ft || 0;
    merged.fr = latest.fr || 0;

    // Current-level state: take from whichever save has higher hl
    const localAhead = (local.hl || 1) >= (server.hl || 1);
    const primary = localAhead ? local : server;
    merged.cl = primary.cl || 1;
    merged.fw = primary.fw || [];
    merged.bf = primary.bf || [];
    merged.rc = primary.rc || [];
    merged.sf = primary.sf || false;

    // Sound & layout: always local (device preference)
    merged.se = local.se !== undefined ? local.se : true;
    merged.lp = local.lp || server.lp || "auto";

    // Last daily claim: latest date
    if (local.ldc && server.ldc) {
        merged.ldc = local.ldc > server.ldc ? local.ldc : server.ldc;
    } else {
        merged.ldc = local.ldc || server.ldc || null;
    }

    // In-progress: union — keep entry with more found words; skip completed levels
    const ipLocal = local.ip || {};
    const ipServer = server.ip || {};
    merged.ip = {};
    const allIpKeys = new Set([...Object.keys(ipLocal), ...Object.keys(ipServer)]);
    for (const key of allIpKeys) {
        if (Number(key) < merged.hl) continue; // already completed
        const a = ipLocal[key];
        const b = ipServer[key];
        if (a && b) {
            const aWords = (a.fw || []).length;
            const bWords = (b.fw || []).length;
            const winner = aWords >= bWords ? a : b;
            // OR the bee-deployed flag — once deployed, forever deployed.
            // Also carry over bdCell ("row,col" string) from whichever side
            // actually deployed, so resume can re-show the bee on the saved cell.
            if (a.bd || b.bd) {
                winner.bd = true;
                const cellSrc = a.bd ? a : b;
                if (typeof cellSrc.bdCell === "string") winner.bdCell = cellSrc.bdCell;
            }
            // OR the bee-triggered flags: once a bee fires on a level it
            // shouldn't redeploy, even after sync.
            if (a.sbt || b.sbt) winner.sbt = true;
            if (a.bdt || b.bdt) winner.bdt = true;
            merged.ip[key] = winner;
        } else {
            merged.ip[key] = a || b;
        }
    }

    // Daily puzzle: same date → prefer completed > more found words; different dates → later date
    const dpL = local.dp || null;
    const dpS = server.dp || null;
    if (dpL && dpS) {
        if (dpL.date === dpS.date) {
            if (dpL.completed) merged.dp = dpL;
            else if (dpS.completed) merged.dp = dpS;
            else merged.dp = ((dpL.fw || []).length >= (dpS.fw || []).length) ? dpL : dpS;
        } else {
            merged.dp = dpL.date > dpS.date ? dpL : dpS;
        }
    } else {
        merged.dp = dpL || dpS || null;
    }

    // Bonus puzzle: prefer completed > more stars > available > null
    const bpL = local.bp || null;
    const bpS = server.bp || null;
    if (bpL && bpS) {
        if (bpL.completed && !bpS.completed) merged.bp = bpL;
        else if (bpS.completed && !bpL.completed) merged.bp = bpS;
        else if (bpL.available && !bpS.available) merged.bp = bpL;
        else if (bpS.available && !bpL.available) merged.bp = bpS;
        else merged.bp = ((bpL.starsCollected || 0) >= (bpS.starsCollected || 0)) ? bpL : bpS;
    } else {
        merged.bp = bpL || bpS || null;
    }

    // Achievement tracking: max values
    merged.sl = (local.sl && local.sl.length > (server.sl || []).length) ? local.sl : (server.sl || []);
    merged.ls = Math.max(local.ls || 0, server.ls || 0);
    merged.lpd = (local.lpd && server.lpd) ? (local.lpd > server.lpd ? local.lpd : server.lpd) : (local.lpd || server.lpd || null);

    // Bonus stars total (bst): max merge — accumulate stars across devices
    // toward the 9-star grand prize. Without this, the merge dropped bst
    // entirely and devices would lose their accumulated stars on sync.
    merged.bst = Math.max(local.bst || 0, server.bst || 0);

    // Bonus puzzle history: union of recently-used bonus level numbers
    const bhL = Array.isArray(local.bh) ? local.bh : [];
    const bhS = Array.isArray(server.bh) ? server.bh : [];
    merged.bh = Array.from(new Set([...bhL, ...bhS]));

    // Daily puzzle completion streak: same lastDailyCompleted → higher streak wins;
    // different dates → take the more recent side's streak and date.
    const ldc2L = local.ldc2 || null;
    const ldc2S = server.ldc2 || null;
    if (ldc2L && ldc2S) {
        if (ldc2L === ldc2S) {
            merged.ds = Math.max(local.ds || 0, server.ds || 0);
            merged.ldc2 = ldc2L;
        } else {
            const newer = ldc2L > ldc2S ? local : server;
            merged.ds = newer.ds || 0;
            merged.ldc2 = newer.ldc2;
        }
    } else if (ldc2L || ldc2S) {
        const has = ldc2L ? local : server;
        merged.ds = has.ds || 0;
        merged.ldc2 = has.ldc2;
    } else {
        merged.ds = 0;
        merged.ldc2 = null;
    }

    // Flow completions: max merge
    merged.fc = Math.max(local.fc || 0, server.fc || 0);

    // Difficulty tier & offset: take from primary save (higher hl) so that
    // cl, hl, dt, and doff all stay consistent.  hl and cl are now display
    // levels; doff maps them to data-file positions at lookup time.
    merged.dt = primary.dt !== undefined ? primary.dt : -1;
    merged.doff = primary.doff || 0;
    merged.tc = primary.tc !== undefined ? primary.tc : -1;

    // Queued bees: max merge (monotonically increasing across devices)
    merged.nb = Math.max(local.nb || 0, server.nb || 0);

    // Active quest: prefer the side whose id matches today's active quest.
    // If both sides have the same id: max jars, union claimedTiers.
    // If ids differ (rare — date crossover): take the side with the more recent end date.
    const qL = local.q || null;
    const qS = server.q || null;
    if (qL && qS) {
        if (qL.id === qS.id) {
            merged.q = {
                id: qL.id,
                start: qL.start,
                end: qL.end,
                jars: Math.max(qL.jars || 0, qS.jars || 0),
                claimedTiers: Array.from(new Set([...(qL.claimedTiers || []), ...(qS.claimedTiers || [])])).sort((a, b) => a - b),
            };
        } else {
            merged.q = (qL.end || "") >= (qS.end || "") ? qL : qS;
        }
    } else {
        merged.q = qL || qS || null;
    }

    // Daily goals: same date → per-goal max progress + OR claimed; different dates → newer.
    // ASSUMPTION: goals are generated deterministically per date (date-seeded), so
    // both sides have the same templates in the same order. If that ever changes,
    // switch to matching by `template` id instead of array index.
    const dgL = local.dg || null;
    const dgS = server.dg || null;
    if (dgL && dgS) {
        if (dgL.date === dgS.date) {
            // Iterate from whichever side has more goals so we don't drop entries.
            const lLen = (dgL.goals || []).length;
            const sLen = (dgS.goals || []).length;
            const baseGoals = lLen >= sLen ? (dgL.goals || []) : (dgS.goals || []);
            const otherGoals = lLen >= sLen ? (dgS.goals || []) : (dgL.goals || []);
            const goals = baseGoals.map((gBase, i) => {
                const gOther = otherGoals[i] || {};
                return {
                    template: gBase.template,
                    target: gBase.target,
                    progress: Math.max(gBase.progress || 0, gOther.progress || 0),
                    claimed: !!(gBase.claimed || gOther.claimed),
                };
            });
            merged.dg = { date: dgL.date, goals };
        } else {
            merged.dg = dgL.date > dgS.date ? dgL : dgS;
        }
    } else {
        merged.dg = dgL || dgS || null;
    }

    // Quest history: union by id; for duplicates, prefer entry with more tiersClaimed
    const qhL = local.qh || [];
    const qhS = server.qh || [];
    const qhMap = new Map();
    for (const e of [...qhL, ...qhS]) {
        if (!e || !e.id) continue;
        const prev = qhMap.get(e.id);
        if (!prev || (e.tiersClaimed || []).length > (prev.tiersClaimed || []).length) {
            qhMap.set(e.id, e);
        }
    }
    merged.qh = Array.from(qhMap.values());

    // Carry forward the latest savedAt timestamp
    merged.sa = Math.max(local.sa || 0, server.sa || 0);

    return merged;
}
