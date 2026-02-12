// ============================================================
// WordPlay Level Scraper — gameanswers.net
// Scrapes levels from gameanswers.net (has ~46,000 levels)
//
// Usage:  node scrape-gameanswers.js [--start 20000] [--end 46000] [--delay 500]
// Output: ../WordPlay/wwwroot/data/ (chunk files + index)
//
// URL pattern: /wordscapes-answers/wordscapes-level-{N}-answers/
// Words are in <div class="words"> with <br /> between words
// Letters derived from the longest answer word
//
// Resume: Just run again — it picks up from the last checkpoint.
// ============================================================

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// ---- CONFIG ----
const BASE_URL = "https://gameanswers.net";
const CHECKPOINT_DIR = path.join(__dirname, "checkpoints");
const CHECKPOINT_FILE = path.join(CHECKPOINT_DIR, "progress-gameanswers.json");
const OUTPUT_DIR = path.join(__dirname, "..", "WordPlay", "wwwroot", "data");
const CHECKPOINT_INTERVAL = 500;
const CHUNK_SIZE = 200;

// ---- CLI ARGS ----
const args = process.argv.slice(2);
function getArg(name, def) {
    const idx = args.indexOf("--" + name);
    return idx >= 0 && args[idx + 1] ? parseInt(args[idx + 1]) : def;
}
const START_LEVEL = getArg("start", 20000);
const END_LEVEL = getArg("end", 46000);
const DELAY_MS = getArg("delay", 500);

// ---- HELPERS ----
function fetchPage(url) {
    const mod = url.startsWith("https") ? https : http;
    return new Promise((resolve, reject) => {
        const req = mod.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml",
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let loc = res.headers.location;
                if (!loc.startsWith("http")) loc = new URL(loc, url).href;
                res.resume();
                return fetchPage(loc).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            }
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve(data));
        });
        req.on("error", reject);
        req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout: " + url)); });
    });
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---- PARSE LEVEL PAGE ----
function parseLevelPage(html, levelNum) {
    // Extract words from <div class="words">
    // Format: <span class="letter">A</span><span class="letter">C</span><span class="letter">T</span><br />
    const words = [];
    const wordsMatch = html.match(/class="words">([\s\S]*?)<\/div>/i);
    if (wordsMatch) {
        const wordsHtml = wordsMatch[1];
        // Split by <br /> to get individual words
        const wordParts = wordsHtml.split(/<br\s*\/?>/);
        for (const part of wordParts) {
            // Extract letters from <span class="letter">X</span>
            const letterRe = /class="letter">([A-Za-z])<\/span>/g;
            let lm;
            let word = "";
            while ((lm = letterRe.exec(part)) !== null) {
                word += lm[1].toUpperCase();
            }
            if (word.length >= 2 && !words.includes(word)) {
                words.push(word);
            }
        }
    }

    // Derive letters from the longest word
    // In Wordscapes, the available letters are always the letters of the longest answer word
    let letters = "";
    if (words.length > 0) {
        const longest = words.reduce((a, b) => a.length >= b.length ? a : b);
        letters = longest;
    }

    // Extract group/pack from title: "Wordscapes Sunrise Rise - Level 1"
    // or "Wordscapes Master levels - Level 6001"
    let group = "Master";
    let pack = "";
    const titleMatch = html.match(/<h1[^>]*>Wordscapes\s+(?:Master levels\s*-|(\w[\w\s]*?)\s+(\w+)\s*-)\s*Level\s+(\d+)/i);
    if (titleMatch) {
        if (titleMatch[1]) {
            group = titleMatch[1].trim();
            pack = titleMatch[2] ? titleMatch[2].trim() : "";
        }
    }

    // Also try to get pack from the next/prev navigation link
    // <a href="/wordscapes-answers/sunrise-rise-level-2/">RISE Level 2</a>
    if (!pack) {
        const navMatch = html.match(/next-button[^>]*><a[^>]+>([A-Z][A-Z\s]*?)\s+Level\s+\d+/i);
        if (navMatch) {
            pack = navMatch[1].trim();
        }
    }

    // For master levels, try to extract pack name from prev/next links
    if (group === "Master" && !pack) {
        const packMatch = html.match(/href="\/wordscapes-answers\/[^"]*-([a-z]+(?:-\d+)?)-level-\d+\//i);
        if (packMatch) {
            pack = packMatch[1].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        }
    }

    return {
        level: levelNum,
        group,
        pack: pack || "Unknown",
        letters,
        words
    };
}

// ---- CHECKPOINT MANAGEMENT ----
function loadCheckpoint() {
    if (fs.existsSync(CHECKPOINT_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8"));
            console.log(`Resuming from checkpoint: ${Object.keys(data.levels || {}).length} levels already scraped`);
            return data;
        } catch (e) {
            console.log("Checkpoint corrupt, starting fresh");
        }
    }
    return { levels: {}, errors: [], notFound: [] };
}

function saveCheckpoint(state) {
    ensureDir(CHECKPOINT_DIR);
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(state));
}

// ---- MAIN SCRAPE LOOP ----
async function scrape() {
    console.log("=== WordPlay Level Scraper (gameanswers.net) ===");
    console.log(`Range: levels ${START_LEVEL} to ${END_LEVEL}`);
    console.log(`Delay: ${DELAY_MS}ms between requests\n`);

    const state = loadCheckpoint();

    let newScraped = 0;
    let newErrors = 0;
    let skipped = 0;
    let notFound = 0;
    const startTime = Date.now();
    let consecutiveNotFound = 0;

    for (let level = START_LEVEL; level <= END_LEVEL; level++) {
        // Skip already scraped
        if (state.levels[level]) {
            skipped++;
            continue;
        }

        // Skip known not-found levels
        if (state.notFound && state.notFound.includes(level)) {
            skipped++;
            continue;
        }

        const url = `${BASE_URL}/wordscapes-answers/wordscapes-level-${level}-answers/`;

        try {
            const html = await fetchPage(url);
            const data = parseLevelPage(html, level);

            if (data.words.length === 0) {
                console.log(`  Warning: Level ${level}: no words found`);
                state.errors.push({ level, url, error: "no words" });
                newErrors++;
                consecutiveNotFound++;
            } else {
                state.levels[level] = data;
                newScraped++;
                consecutiveNotFound = 0;
            }
        } catch (err) {
            if (err.message.includes("404")) {
                // Level doesn't exist
                if (!state.notFound) state.notFound = [];
                state.notFound.push(level);
                notFound++;
                consecutiveNotFound++;
            } else {
                console.log(`  Error: Level ${level}: ${err.message}`);
                state.errors.push({ level, url, error: err.message });
                newErrors++;
            }
        }

        // Stop if we've hit 100+ consecutive missing levels (past the end of data)
        if (consecutiveNotFound >= 100) {
            console.log(`\n  100 consecutive missing levels — likely past the end of available data.`);
            console.log(`  Stopping at level ${level}.`);
            break;
        }

        await sleep(DELAY_MS);

        // Progress update every 50 levels
        const total = newScraped + newErrors + notFound;
        if (total > 0 && total % 50 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = (total / (elapsed || 1)).toFixed(1);
            const levelCount = Object.keys(state.levels).length;
            const pct = (((level - START_LEVEL) / (END_LEVEL - START_LEVEL)) * 100).toFixed(1);
            console.log(`  [${elapsed}s] ${pct}% | Total: ${levelCount} levels | New: ${newScraped} | 404s: ${notFound} | Errors: ${newErrors} | ${rate} req/s | Level ${level}`);
        }

        // Checkpoint
        if (total > 0 && total % CHECKPOINT_INTERVAL === 0) {
            saveCheckpoint(state);
            console.log(`  Checkpoint saved (${Object.keys(state.levels).length} levels)`);
        }
    }

    saveCheckpoint(state);

    const totalLevels = Object.keys(state.levels).length;
    console.log(`\n=== COMPLETE ===`);
    console.log(`Total levels scraped: ${totalLevels}`);
    console.log(`New this run: ${newScraped}`);
    console.log(`Skipped (already had): ${skipped}`);
    console.log(`Not found (404): ${notFound}`);
    console.log(`Errors: ${newErrors}`);

    // Merge with existing data from wordscapescheat scraper and output
    await mergeAndOutput(state);
}

// ---- MERGE WITH WORDSCAPESCHEAT DATA AND OUTPUT ----
async function mergeAndOutput(gaState) {
    ensureDir(OUTPUT_DIR);

    // Load wordscapescheat checkpoint if it exists
    const wcFile = path.join(CHECKPOINT_DIR, "progress.json");
    let allLevels = {};

    if (fs.existsSync(wcFile)) {
        try {
            const wcData = JSON.parse(fs.readFileSync(wcFile, "utf8"));
            console.log(`\nMerging with wordscapescheat data (${Object.keys(wcData.levels || {}).length} levels)...`);
            for (const [num, lv] of Object.entries(wcData.levels || {})) {
                allLevels[num] = lv;
            }
        } catch (e) {
            console.log("Could not load wordscapescheat checkpoint:", e.message);
        }
    }

    // Add gameanswers data (overwrites wordscapescheat for overlapping levels)
    for (const [num, lv] of Object.entries(gaState.levels || {})) {
        // Only add if we don't already have it from wordscapescheat (prefer that source)
        if (!allLevels[num]) {
            allLevels[num] = lv;
        }
    }

    const levelNums = Object.keys(allLevels).map(Number).sort((a, b) => a - b);
    console.log(`\nGenerating output files for ${levelNums.length} total levels...`);

    // 1. Pack index
    const packIndex = [];
    let curGroup = null, curPack = null;
    for (const num of levelNums) {
        const lv = allLevels[num];
        if (lv.group !== curGroup || lv.pack !== curPack) {
            packIndex.push({ group: lv.group, pack: lv.pack, start: num, end: num });
            curGroup = lv.group;
            curPack = lv.pack;
        } else {
            packIndex[packIndex.length - 1].end = num;
        }
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, "level-index.json"), JSON.stringify(packIndex, null, 2));
    console.log(`  level-index.json (${packIndex.length} packs)`);

    // 2. Chunk files
    let chunkCount = 0;
    for (let i = 0; i < levelNums.length; i += CHUNK_SIZE) {
        const chunk = levelNums.slice(i, i + CHUNK_SIZE);
        const startLv = chunk[0];
        const endLv = chunk[chunk.length - 1];

        const data = {};
        for (const num of chunk) {
            const lv = allLevels[num];
            data[num] = [lv.letters, lv.words, lv.group, lv.pack];
        }

        const fname = `levels-${String(startLv).padStart(6, "0")}-${String(endLv).padStart(6, "0")}.json`;
        fs.writeFileSync(path.join(OUTPUT_DIR, fname), JSON.stringify(data));
        chunkCount++;
    }
    console.log(`  ${chunkCount} chunk files`);

    // 3. Chunk manifest
    const manifest = [];
    for (let i = 0; i < levelNums.length; i += CHUNK_SIZE) {
        const chunk = levelNums.slice(i, i + CHUNK_SIZE);
        const startLv = chunk[0];
        const endLv = chunk[chunk.length - 1];
        manifest.push({
            file: `levels-${String(startLv).padStart(6, "0")}-${String(endLv).padStart(6, "0")}.json`,
            start: startLv,
            end: endLv
        });
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, "chunk-manifest.json"), JSON.stringify(manifest, null, 2));
    console.log(`  chunk-manifest.json`);

    console.log(`\nOutput directory: ${OUTPUT_DIR}`);
}

// ---- RUN ----
scrape().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
