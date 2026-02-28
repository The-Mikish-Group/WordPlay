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
    // Don't clobber active daily puzzle session
    if (typeof state !== "undefined" && state.isDailyMode) return;
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

        const localRaw = localStorage.getItem("wordplay-save");
        const localSave = localRaw ? JSON.parse(localRaw) : null;

        if (!localSave) {
            // No local data — use server
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

function mergeProgress(local, server) {
    const merged = { v: Math.max(local.v || 3, server.v || 3) };

    // Scalar max fields
    merged.hl = Math.max(local.hl || 1, server.hl || 1);
    merged.co = Math.max(local.co || 0, server.co || 0);
    merged.lc = Math.max(local.lc || 0, server.lc || 0);
    merged.fh = Math.max(local.fh || 0, server.fh || 0);
    merged.ft = Math.max(local.ft || 0, server.ft || 0);
    merged.fr = Math.max(local.fr || 0, server.fr || 0);
    merged.bc = Math.max(local.bc || 0, server.bc || 0);
    merged.tce = Math.max(local.tce || 0, server.tce || 0);

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

    // Level history: union — for each level, keep entry with more words
    const lhLocal = local.lh || {};
    const lhServer = server.lh || {};
    merged.lh = {};
    const allLhKeys = new Set([...Object.keys(lhLocal), ...Object.keys(lhServer)]);
    for (const key of allLhKeys) {
        const a = lhLocal[key];
        const b = lhServer[key];
        if (a && b) {
            merged.lh[key] = (a.length >= b.length) ? a : b;
        } else {
            merged.lh[key] = a || b;
        }
    }

    // In-progress: union — keep entry with more found words; skip if level in lh
    const ipLocal = local.ip || {};
    const ipServer = server.ip || {};
    merged.ip = {};
    const allIpKeys = new Set([...Object.keys(ipLocal), ...Object.keys(ipServer)]);
    for (const key of allIpKeys) {
        if (merged.lh[key]) continue; // already completed
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

    return merged;
}
