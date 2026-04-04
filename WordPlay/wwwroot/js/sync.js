// ============================================================
// WordPlay — Progress Sync (Push / Pull / Merge)
// ============================================================

let _syncPushTimer = null;
let _syncPulling = false;
const SYNC_DEBOUNCE_MS = 3000;

// Auto-pull when the app regains focus (tab switch, phone resume, PWA reopen)
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && typeof isSignedIn === "function" && isSignedIn()) {
        syncPullAndReload();
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

async function syncPush() {
    if (!isSignedIn()) return;
    try {
        const raw = localStorage.getItem("wordplay-save");
        if (!raw) return;
        const progress = JSON.parse(raw);
        await fetch("/api/progress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ progress }),
        });
    } catch (e) {
        // Silently fail — will retry on next save
    }
}

async function syncPull() {
    if (!isSignedIn()) return;
    try {
        const res = await fetch("/api/progress", {
            headers: getAuthHeaders(),
        });
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
        await fetch("/api/progress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ progress: merged }),
        });
    } catch (e) {
        // Offline or error — continue with local data
    }
}

// Normalize a save to v8 display-level format in place.
// If the save is v7 or earlier with a nonzero doff, subtract doff from
// level numbers so they become display levels.
function _normalizeToV8(s) {
    if (!s || (s.v && s.v >= 8)) return s;
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
    s.v = 8;
    return s;
}

function mergeProgress(local, server) {
    // Normalize both saves to v8 display levels before comparing,
    // so raw vs display mismatches can't corrupt the merge.
    _normalizeToV8(local);
    _normalizeToV8(server);

    const merged = { v: 8 };

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

    // Sound: always local (device preference)
    merged.se = local.se !== undefined ? local.se : true;

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
            merged.ip[key] = aWords >= bWords ? a : b;
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

    // Flow completions: max merge
    merged.fc = Math.max(local.fc || 0, server.fc || 0);

    // Difficulty tier & offset: take from primary save (higher hl) so that
    // cl, hl, dt, and doff all stay consistent.  hl and cl are now display
    // levels; doff maps them to data-file positions at lookup time.
    merged.dt = primary.dt !== undefined ? primary.dt : -1;
    merged.doff = primary.doff || 0;
    merged.tc = primary.tc !== undefined ? primary.tc : -1;

    // Carry forward the latest savedAt timestamp
    merged.sa = Math.max(local.sa || 0, server.sa || 0);

    return merged;
}
