#!/usr/bin/env node
// Validates that the Easy-tier difficulty cap (mirror of app.js applyEasyDifficultyCap)
// produces required-word lists that satisfy the band invariants for every real
// Easy display level 1-250. Run: node tools/validate-easy-caps.js
const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "..", "WordPlay", "wwwroot", "data");

// ---- MIRROR OF app.js (keep in sync) ----
function easyCountCap(level) {
    if (level <= 30) return 3;
    if (level <= 80) return 4;
    if (level <= 130) return 5;
    if (level <= 180) return 6;
    return 8; // 181-250
}
function easyLengthCap(level) {
    if (level <= 80) return 4;
    if (level <= 149) return 5;
    return 6; // 150-250
}
function applyEasyDifficultyCap(words, bonus, level) {
    const lenCap = easyLengthCap(level);
    const countCap = easyCountCap(level);
    const sorted = words.slice().sort((a, b) => a.length - b.length || a.localeCompare(b));
    let kept = sorted.filter(w => w.length <= lenCap).slice(0, countCap);
    if (kept.length < 2) kept = sorted.slice(0, Math.max(2, countCap));
    const keptSet = new Set(kept);
    const movedToBonus = words.filter(w => !keptSet.has(w));
    const newBonus = (bonus || []).slice();
    for (const w of movedToBonus) if (!newBonus.includes(w)) newBonus.push(w);
    return { words: kept, bonus: newBonus };
}
// ---- END MIRROR ----

function loadLevel(n) {
    // Chunks are 200 levels each: levels-000001-000200.json, levels-000201-000400.json, ...
    const start = Math.floor((n - 1) / 200) * 200 + 1;
    const end = start + 199;
    const pad = x => String(x).padStart(6, "0");
    const file = path.join(DATA_DIR, `levels-${pad(start)}-${pad(end)}.json`);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return data[n] || data[String(n)];
}

let failures = 0;
for (let n = 1; n <= 250; n++) {
    const raw = loadLevel(n);
    if (!raw) { console.error(`level ${n}: MISSING`); failures++; continue; }
    const words = raw[1] || [];
    const bonus = raw[4] || [];
    const out = applyEasyDifficultyCap(words, bonus, n);
    const countCap = easyCountCap(n);
    const lenCap = easyLengthCap(n);

    // Invariant 1: never more required words than the count cap
    if (out.words.length > countCap) {
        console.error(`level ${n}: ${out.words.length} required words > cap ${countCap}`); failures++;
    }
    // Invariant 2: at least 2 required words (solvability floor), unless the source
    // genuinely had fewer than 2 words to begin with.
    if (out.words.length < 2 && words.length >= 2) {
        console.error(`level ${n}: only ${out.words.length} required words (floor is 2)`); failures++;
    }
    // Invariant 3: every required word respects the length cap, UNLESS the floor
    // had to keep longer words because nothing short enough existed.
    const tooLong = out.words.filter(w => w.length > lenCap);
    const hadShortEnough = words.filter(w => w.length <= lenCap).length >= 2;
    if (tooLong.length > 0 && hadShortEnough) {
        console.error(`level ${n}: required words exceed length cap ${lenCap}: ${tooLong.join(",")}`); failures++;
    }
    // Invariant 4: no required word was lost (every trimmed word lives in bonus)
    for (const w of words) {
        if (!out.words.includes(w) && !out.bonus.includes(w)) {
            console.error(`level ${n}: word "${w}" dropped from both lists`); failures++;
        }
    }
}
if (failures === 0) {
    console.log("OK: all Easy levels 1-250 satisfy the cap invariants");
    process.exit(0);
} else {
    console.error(`FAILED: ${failures} invariant violation(s)`);
    process.exit(1);
}
