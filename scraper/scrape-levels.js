// ============================================================
// WordPlay Level Scraper
// Scrapes all levels from wordscapescheat.com
//
// Usage:  node scrape-levels.js [--start 1] [--end 20000] [--delay 500]
// Output: ../WordPlay/wwwroot/data/ (chunk files + index)
//
// The scraper:
//   1. Fetches the homepage to discover groups and packs
//   2. Fetches each group page to get exact pack→level mappings
//   3. Fetches the Master page for master-level packs
//   4. Iterates through each level URL, extracting letters + answers
//   5. Saves checkpoint files every 500 levels so you can resume
//   6. Outputs chunked JSON files for lazy loading in the app
//
// Resume: Just run again — it picks up from the last checkpoint.
// ============================================================

const https = require("https");
const fs = require("fs");
const path = require("path");

// ---- CONFIG ----
const BASE_URL = "https://www.wordscapescheat.com";
const CHECKPOINT_DIR = path.join(__dirname, "checkpoints");
const OUTPUT_DIR = path.join(__dirname, "..", "WordPlay", "wwwroot", "data");
const CHECKPOINT_INTERVAL = 500;
const CHUNK_SIZE = 200; // levels per chunk file

// ---- CLI ARGS ----
const args = process.argv.slice(2);
function getArg(name, def) {
    const idx = args.indexOf("--" + name);
    return idx >= 0 && args[idx + 1] ? parseInt(args[idx + 1]) : def;
}
const START_LEVEL = getArg("start", 1);
const END_LEVEL = getArg("end", 20000);
const DELAY_MS = getArg("delay", 500);

// ---- HELPERS ----
function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "text/html,application/xhtml+xml",
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let loc = res.headers.location;
                if (loc.startsWith("/")) loc = BASE_URL + loc;
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

// ---- STEP 1: PARSE HOMEPAGE FOR GROUPS ----
// HTML structure: <nav class='GroupSelectContainer'>
//   <h2><a href='/answers/sunrise'>Sunrise</a></h2>
//   <div class='levelRange'>Levels 1-12</div>
//   <a href='/answers/sunrise/rise' class='SelectButton ...'>RISE</a>
//   ...
// </nav>
function parseHomepage(html) {
    const groups = [];
    const groupRe = /<nav class='GroupSelectContainer'><h2><a href='\/answers\/([^']+)'>([^<]+)<\/a><\/h2><div class='levelRange'>Levels (\d+)-(\d+)<\/div>([\s\S]*?)<\/nav>/g;
    let m;
    while ((m = groupRe.exec(html)) !== null) {
        const slug = m[1];
        const name = m[2];
        const startLevel = parseInt(m[3]);
        const endLevel = parseInt(m[4]);
        const packSection = m[5];

        const packs = [];
        const packRe = /href='\/answers\/[^']+\/([^']+)'\s+class='SelectButton[^']*'>([^<]+)<\/a>/g;
        let pm;
        while ((pm = packRe.exec(packSection)) !== null) {
            packs.push({ slug: pm[1], name: pm[2] });
        }

        if (packs.length > 0) {
            groups.push({ name, slug, startLevel, endLevel, packs });
        }
    }
    return groups;
}

// ---- STEP 2: FETCH GROUP PAGES FOR PACK-LEVEL MAPPING ----
// Group page structure: <nav class='PackSelectContainer'>
//   <a href='/answers/forest/pine' class='SelectButton ...'>Pine<br/><small>Levels 13-20</small></a>
//   ...
// </nav>
async function buildPackIndex(groups) {
    const allPacks = [];

    for (const group of groups) {
        console.log(`  Fetching group page: ${group.name}...`);
        try {
            const html = await fetchPage(`${BASE_URL}/answers/${group.slug}`);

            // Parse pack links with level ranges
            const packRe = /href='\/answers\/[^']+\/([^']+)'\s+class='SelectButton[^']*'>([^<]+)<br\/><small>Levels (\d+)-(\d+)<\/small><\/a>/g;
            let pm;
            let found = 0;
            while ((pm = packRe.exec(html)) !== null) {
                allPacks.push({
                    groupName: group.name,
                    groupSlug: group.slug,
                    packSlug: pm[1],
                    packName: pm[2],
                    startLevel: parseInt(pm[3]),
                    endLevel: parseInt(pm[4])
                });
                found++;
            }

            if (found === 0) {
                // Fallback: divide evenly (shouldn't happen if parsing is correct)
                console.log(`    Warning: no pack-level ranges found, using even distribution`);
                const totalLevels = group.endLevel - group.startLevel + 1;
                const perPack = Math.ceil(totalLevels / group.packs.length);
                let lvNum = group.startLevel;
                for (const pack of group.packs) {
                    const packEnd = Math.min(lvNum + perPack - 1, group.endLevel);
                    allPacks.push({
                        groupName: group.name,
                        groupSlug: group.slug,
                        packSlug: pack.slug,
                        packName: pack.name,
                        startLevel: lvNum,
                        endLevel: packEnd
                    });
                    lvNum = packEnd + 1;
                }
            }
        } catch (err) {
            console.log(`    Error fetching ${group.name}: ${err.message}, using homepage data`);
            const totalLevels = group.endLevel - group.startLevel + 1;
            const perPack = Math.ceil(totalLevels / group.packs.length);
            let lvNum = group.startLevel;
            for (const pack of group.packs) {
                const packEnd = Math.min(lvNum + perPack - 1, group.endLevel);
                allPacks.push({
                    groupName: group.name,
                    groupSlug: group.slug,
                    packSlug: pack.slug,
                    packName: pack.name,
                    startLevel: lvNum,
                    endLevel: packEnd
                });
                lvNum = packEnd + 1;
            }
        }
        await sleep(DELAY_MS);
    }

    return allPacks;
}

// ---- STEP 3: PARSE MASTER PAGE ----
// Master page structure: <div class='MasterContainer'>
//   <nav class='GroupSelectContainer'>
//     <div class='levelRange'>Levels 6001-6080</div>
//     <a href='/answers/master/river' class='SelectButton ...'>RIVER</a>
//     ... (5 packs per 80-level block, 16 levels each)
//   </nav>
// </div>
async function buildMasterIndex() {
    console.log("  Fetching Master page...");
    const html = await fetchPage(`${BASE_URL}/answers/master`);
    const masterPacks = [];

    // Parse each 80-level block
    const blockRe = /<nav class='GroupSelectContainer'><div class='levelRange'>Levels (\d+)-(\d+)<\/div>([\s\S]*?)<\/nav>/g;
    let bm;
    while ((bm = blockRe.exec(html)) !== null) {
        const blockStart = parseInt(bm[1]);
        const blockEnd = parseInt(bm[2]);
        const packSection = bm[3];

        // Extract pack links
        const packs = [];
        const packRe = /href='\/answers\/master\/([^']+)'\s+class='SelectButton[^']*'>([^<]+)<\/a>/g;
        let pm;
        while ((pm = packRe.exec(packSection)) !== null) {
            packs.push({ slug: pm[1], name: pm[2] });
        }

        if (packs.length > 0) {
            const totalLevels = blockEnd - blockStart + 1;
            const perPack = Math.floor(totalLevels / packs.length);
            let lvNum = blockStart;
            for (let i = 0; i < packs.length; i++) {
                const isLast = i === packs.length - 1;
                const packEnd = isLast ? blockEnd : lvNum + perPack - 1;
                masterPacks.push({
                    groupName: "Master",
                    groupSlug: "master",
                    packSlug: packs[i].slug,
                    packName: packs[i].name,
                    startLevel: lvNum,
                    endLevel: packEnd
                });
                lvNum = packEnd + 1;
            }
        }
    }

    return masterPacks;
}

// ---- STEP 4: BUILD LEVEL URLs ----
// URLs use global level numbers: /answers/{group}/{pack}/{level_number}
function buildLevelUrls(packs) {
    const urls = [];
    for (const pack of packs) {
        for (let level = pack.startLevel; level <= pack.endLevel; level++) {
            // Encode pack slug properly (some have spaces like "view 2")
            const encodedGroup = encodeURIComponent(pack.groupSlug);
            const encodedPack = encodeURIComponent(pack.packSlug);
            urls.push({
                level,
                group: pack.groupName,
                pack: pack.packName,
                url: `${BASE_URL}/answers/${encodedGroup}/${encodedPack}/${level}`
            });
        }
    }
    urls.sort((a, b) => a.level - b.level);
    return urls;
}

// ---- STEP 5: PARSE A LEVEL PAGE ----
function parseLevelPage(html, meta) {
    // Extract letters — primary: text pattern
    let letters = "";
    const lettersMatch = html.match(/letters you can use on this level are\s*[\u2018\u2019''\u201C\u201D""]([A-Za-z]+)[\u2018\u2019''\u201C\u201D""]/i);
    if (lettersMatch) {
        letters = lettersMatch[1].toUpperCase();
    }

    // Fallback: extract from LetterTray divs
    if (!letters) {
        const trayMatch = html.match(/<div class=['"]LetterTray['"][^>]*>([\s\S]*?)(?:<\/div>\s*){2,}/i);
        if (trayMatch) {
            const letterDivRe = /<div>([A-Za-z])<\/div>/g;
            let lm;
            const trayLetters = [];
            while ((lm = letterDivRe.exec(trayMatch[1])) !== null) {
                trayLetters.push(lm[1].toUpperCase());
            }
            letters = trayLetters.join("");
        }
    }

    // Extract answer words from definition links
    const words = [];
    // Match both single and double quote href attributes
    const wordRe = /href=['"]\/definition\/[^'"]+['"][^>]*>([^<]+)<\/a>/gi;
    let wm;
    while ((wm = wordRe.exec(html)) !== null) {
        const w = wm[1].trim().toUpperCase();
        if (w && w.length >= 2 && /^[A-Z]+$/.test(w) && !words.includes(w)) {
            words.push(w);
        }
    }

    // Extract actual level number from page
    const levelMatch = html.match(/[Ll]evel\s+(\d+)/i);
    const actualLevel = levelMatch ? parseInt(levelMatch[1]) : meta.level;

    return {
        level: actualLevel,
        group: meta.group,
        pack: meta.pack,
        letters: letters,
        words: words
    };
}

// ---- STEP 6: CHECKPOINT MANAGEMENT ----
function loadCheckpoint() {
    const cpFile = path.join(CHECKPOINT_DIR, "progress.json");
    if (fs.existsSync(cpFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(cpFile, "utf8"));
            console.log(`Resuming from checkpoint: ${Object.keys(data.levels || {}).length} levels already scraped`);
            return data;
        } catch (e) {
            console.log("Checkpoint corrupt, starting fresh");
        }
    }
    return { levels: {}, errors: [] };
}

function saveCheckpoint(state) {
    ensureDir(CHECKPOINT_DIR);
    fs.writeFileSync(
        path.join(CHECKPOINT_DIR, "progress.json"),
        JSON.stringify(state)
    );
}

// ---- STEP 7: MAIN SCRAPE LOOP ----
async function scrape() {
    console.log("=== WordPlay Level Scraper ===");
    console.log(`Range: levels ${START_LEVEL} to ${END_LEVEL}`);
    console.log(`Delay: ${DELAY_MS}ms between requests\n`);

    // Phase 1: Parse homepage for groups
    console.log("Phase 1: Parsing homepage...");
    const homepage = await fetchPage(BASE_URL);
    const groups = parseHomepage(homepage);

    if (groups.length === 0) {
        console.error("\nERROR: Failed to parse groups from homepage.");
        console.error("The site structure may have changed. Check manually at:");
        console.error(BASE_URL);
        process.exit(1);
    }

    console.log(`Found ${groups.length} groups (levels 1-${groups[groups.length - 1].endLevel})\n`);

    // Phase 2: Fetch group pages for pack-level mapping
    console.log("Phase 2: Fetching group pages for pack-level mapping...");
    const packs = await buildPackIndex(groups);
    console.log(`  Mapped ${packs.length} non-Master packs\n`);

    // Phase 3: Parse Master page
    console.log("Phase 3: Fetching Master page...");
    const masterPacks = await buildMasterIndex();
    console.log(`  Mapped ${masterPacks.length} Master packs\n`);

    const allPacks = [...packs, ...masterPacks];

    // Save index
    ensureDir(CHECKPOINT_DIR);
    fs.writeFileSync(path.join(CHECKPOINT_DIR, "index.json"), JSON.stringify(allPacks, null, 2));

    // Phase 4: Build level URLs
    const allUrls = buildLevelUrls(allPacks);
    const maxLevel = allUrls.length > 0 ? allUrls[allUrls.length - 1].level : 0;
    console.log(`Total levels mapped: ${allUrls.length} (up to level ${maxLevel})`);

    // Filter to requested range
    const urls = allUrls.filter(u => u.level >= START_LEVEL && u.level <= END_LEVEL);
    console.log(`Levels in requested range: ${urls.length}\n`);

    if (urls.length === 0) {
        console.log("No levels to scrape in the given range.");
        return;
    }

    // Load existing progress
    const state = loadCheckpoint();

    let newScraped = 0;
    let newErrors = 0;
    let skipped = 0;
    const startTime = Date.now();

    for (let i = 0; i < urls.length; i++) {
        const meta = urls[i];

        // Skip already scraped
        if (state.levels[meta.level]) {
            skipped++;
            continue;
        }

        try {
            const html = await fetchPage(meta.url);
            const levelData = parseLevelPage(html, meta);

            if (levelData.words.length === 0) {
                console.log(`  Warning: Level ${meta.level} (${meta.group}/${meta.pack}): no words found`);
                state.errors.push({ level: meta.level, url: meta.url, error: "no words" });
                newErrors++;
            } else {
                state.levels[meta.level] = levelData;
                newScraped++;
            }
        } catch (err) {
            console.log(`  Error: Level ${meta.level}: ${err.message}`);
            state.errors.push({ level: meta.level, url: meta.url, error: err.message });
            newErrors++;
        }

        // Rate limiting
        await sleep(DELAY_MS);

        // Progress update every 50 levels
        const total = newScraped + newErrors;
        if (total > 0 && total % 50 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = (total / (elapsed || 1)).toFixed(1);
            const levelCount = Object.keys(state.levels).length;
            const pct = ((i / urls.length) * 100).toFixed(1);
            console.log(`  [${elapsed}s] ${pct}% | Total: ${levelCount} levels | New: ${newScraped} | Errors: ${newErrors} | ${rate} req/s | Level ${meta.level}`);
        }

        // Checkpoint save
        if (total > 0 && total % CHECKPOINT_INTERVAL === 0) {
            saveCheckpoint(state);
            console.log(`  Checkpoint saved (${Object.keys(state.levels).length} levels)`);
        }
    }

    // Final save
    saveCheckpoint(state);

    const totalLevels = Object.keys(state.levels).length;
    console.log(`\n=== COMPLETE ===`);
    console.log(`Total levels scraped: ${totalLevels}`);
    console.log(`New this run: ${newScraped}`);
    console.log(`Skipped (already had): ${skipped}`);
    console.log(`Errors: ${newErrors}`);

    // Output the data files
    await outputLevelFiles(state);
}

// ---- STEP 8: OUTPUT DATA FILES ----
async function outputLevelFiles(state) {
    ensureDir(OUTPUT_DIR);

    const levelNums = Object.keys(state.levels).map(Number).sort((a, b) => a - b);
    console.log(`\nGenerating output files for ${levelNums.length} levels...`);

    // 1. Pack index: group/pack structure with level ranges
    const packIndex = [];
    let curGroup = null, curPack = null;
    for (const num of levelNums) {
        const lv = state.levels[num];
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

    // 2. Chunk files: levels-000001-000200.json, etc.
    let chunkCount = 0;
    for (let i = 0; i < levelNums.length; i += CHUNK_SIZE) {
        const chunk = levelNums.slice(i, i + CHUNK_SIZE);
        const startLv = chunk[0];
        const endLv = chunk[chunk.length - 1];

        const data = {};
        for (const num of chunk) {
            const lv = state.levels[num];
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
