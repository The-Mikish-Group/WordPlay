#!/usr/bin/env node
// ============================================================
// WordPlay Level Generator & Enhancer
//
// Usage:
//   node level-generator.js analyze [chunkFile]    - Analyze existing levels, find missing words
//   node level-generator.js enhance [chunkFile]    - Enhance levels by adding missing bonus words
//   node level-generator.js generate [count]       - Generate new harder levels (default: 200)
//   node level-generator.js stats                  - Show statistics across all levels
//   node level-generator.js search <letters>       - Find all words from a letter set
// ============================================================

const fs = require("fs");
const path = require("path");

const DICT_FILE = path.join(__dirname, "enable1.txt");
const DATA_DIR = path.join(__dirname, "..", "WordPlay", "wwwroot", "data");
const MANIFEST_FILE = path.join(DATA_DIR, "chunk-manifest.json");
const INDEX_FILE = path.join(DATA_DIR, "level-index.json");

// ---- DICTIONARY ----
let _dict = null;        // Set of all valid words (lowercase)
let _dictByLen = {};     // length -> [words]

function loadDictionary() {
    if (_dict) return;
    const raw = fs.readFileSync(DICT_FILE, "utf-8");
    const words = raw.split(/\r?\n/).filter(w => w.length >= 3 && w.length <= 8);
    _dict = new Set(words);
    _dictByLen = {};
    for (const w of words) {
        const len = w.length;
        if (!_dictByLen[len]) _dictByLen[len] = [];
        _dictByLen[len].push(w);
    }
    console.log(`Dictionary loaded: ${_dict.size} words (3-8 letters)`);
}

// ---- CORE: Find all valid words from a letter set ----
function findAllWords(letterSet) {
    const letters = letterSet.toLowerCase();
    const available = {};
    for (const ch of letters) {
        available[ch] = (available[ch] || 0) + 1;
    }

    const results = [];
    for (const word of _dict) {
        if (word.length > letters.length) continue;
        // Check if word can be made from available letters
        const needed = {};
        let valid = true;
        for (const ch of word) {
            needed[ch] = (needed[ch] || 0) + 1;
            if (!available[ch] || needed[ch] > available[ch]) {
                valid = false;
                break;
            }
        }
        if (valid) results.push(word);
    }
    return results.sort((a, b) => a.length - b.length || a.localeCompare(b));
}

// ---- ANALYZE: Find missing words in existing levels ----
function analyzeChunk(chunkFile) {
    loadDictionary();
    const filePath = path.join(DATA_DIR, chunkFile);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    let totalMissing = 0;
    let totalLevels = 0;
    const results = [];

    for (const [lvNum, entry] of Object.entries(data)) {
        const [letters, words, group, pack, bonus] = entry;
        const existingWords = new Set([
            ...words.map(w => w.toLowerCase()),
            ...(bonus || []).map(w => w.toLowerCase()),
        ]);

        const allValid = findAllWords(letters);
        const missing = allValid.filter(w => !existingWords.has(w));

        if (missing.length > 0) {
            totalMissing += missing.length;
            results.push({
                level: parseInt(lvNum),
                letters,
                currentWords: words.length,
                currentBonus: (bonus || []).length,
                totalExisting: existingWords.size,
                allValid: allValid.length,
                missing: missing,
            });
        }
        totalLevels++;
    }

    results.sort((a, b) => a.level - b.level);

    console.log(`\nAnalysis of ${chunkFile}:`);
    console.log(`  Levels: ${totalLevels}`);
    console.log(`  Levels with missing words: ${results.length}`);
    console.log(`  Total missing words: ${totalMissing}`);

    // Show top 10 levels with most missing words
    const top = results.sort((a, b) => b.missing.length - a.missing.length).slice(0, 10);
    console.log(`\nTop levels with most missing words:`);
    for (const r of top) {
        console.log(`  Level ${r.level} [${r.letters}]: ${r.currentWords} words + ${r.currentBonus} bonus = ${r.totalExisting} known, ${r.allValid} possible, ${r.missing.length} missing`);
        console.log(`    Missing: ${r.missing.join(", ")}`);
    }

    return results;
}

// ---- ENHANCE: Add missing words as bonus words ----
function enhanceChunk(chunkFile, dryRun = false) {
    loadDictionary();
    const filePath = path.join(DATA_DIR, chunkFile);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    let enhanced = 0;
    let addedWords = 0;

    for (const [lvNum, entry] of Object.entries(data)) {
        const [letters, words, group, pack, bonus] = entry;
        const existingWords = new Set([
            ...words.map(w => w.toLowerCase()),
            ...(bonus || []).map(w => w.toLowerCase()),
        ]);

        const allValid = findAllWords(letters);
        const missing = allValid.filter(w => !existingWords.has(w));

        if (missing.length > 0) {
            const newBonus = [...(bonus || []), ...missing.map(w => w.toUpperCase())];
            entry[4] = newBonus;
            enhanced++;
            addedWords += missing.length;
        }
    }

    console.log(`\nEnhanced ${enhanced} levels, added ${addedWords} bonus words`);

    if (!dryRun && enhanced > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data));
        console.log(`Saved to ${chunkFile}`);
    } else if (dryRun) {
        console.log("(dry run - no files modified)");
    }
}

// ---- STATS: Analyze word counts across all levels ----
function showStats() {
    loadDictionary();
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));

    const wordCountBuckets = {};
    let totalLevels = 0;
    let totalWithBonus = 0;
    let maxWordLevel = { level: 0, count: 0, letters: "" };
    let letterLengths = {};
    let totalPossibleMissing = 0;
    let levelsChecked = 0;

    // Sample every 10th chunk for speed
    const chunksToCheck = manifest.filter((_, i) => i % 10 === 0);
    console.log(`Sampling ${chunksToCheck.length} of ${manifest.length} chunks...`);

    for (const chunk of chunksToCheck) {
        const filePath = path.join(DATA_DIR, chunk.file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        for (const [lvNum, entry] of Object.entries(data)) {
            const [letters, words, group, pack, bonus] = entry;
            const wc = words.length;
            wordCountBuckets[wc] = (wordCountBuckets[wc] || 0) + 1;
            totalLevels++;
            if (bonus && bonus.length > 0) totalWithBonus++;

            const ll = letters.length;
            letterLengths[ll] = (letterLengths[ll] || 0) + 1;

            if (wc > maxWordLevel.count) {
                maxWordLevel = { level: parseInt(lvNum), count: wc, letters };
            }

            // Check missing words for sampled levels
            if (levelsChecked < 500) {
                const existingWords = new Set([
                    ...words.map(w => w.toLowerCase()),
                    ...(bonus || []).map(w => w.toLowerCase()),
                ]);
                const allValid = findAllWords(letters);
                totalPossibleMissing += allValid.length - existingWords.size;
                levelsChecked++;
            }
        }
    }

    console.log(`\n=== Level Statistics (sampled ${totalLevels} levels) ===`);
    console.log(`\nWord count distribution:`);
    for (const wc of Object.keys(wordCountBuckets).sort((a, b) => a - b)) {
        const count = wordCountBuckets[wc];
        const bar = "#".repeat(Math.min(50, Math.round(count / totalLevels * 200)));
        console.log(`  ${wc.toString().padStart(3)} words: ${count.toString().padStart(5)} levels ${bar}`);
    }

    console.log(`\nLetter set lengths:`);
    for (const ll of Object.keys(letterLengths).sort((a, b) => a - b)) {
        const count = letterLengths[ll];
        console.log(`  ${ll} letters: ${count} levels (${(count / totalLevels * 100).toFixed(1)}%)`);
    }

    console.log(`\nLevels with bonus words: ${totalWithBonus} / ${totalLevels} (${(totalWithBonus / totalLevels * 100).toFixed(1)}%)`);
    console.log(`Level with most words: Level ${maxWordLevel.level} [${maxWordLevel.letters}] with ${maxWordLevel.count} words`);
    console.log(`\nMissing words (sampled ${levelsChecked} levels): avg ${(totalPossibleMissing / levelsChecked).toFixed(1)} missing per level`);
}

// ---- SEARCH: Find all words from a letter set ----
function searchLetters(letters) {
    loadDictionary();
    const words = findAllWords(letters);
    console.log(`\nLetters: ${letters.toUpperCase()}`);
    console.log(`Found ${words.length} valid words:\n`);

    const byLen = {};
    for (const w of words) {
        const len = w.length;
        if (!byLen[len]) byLen[len] = [];
        byLen[len].push(w.toUpperCase());
    }
    for (const len of Object.keys(byLen).sort((a, b) => a - b)) {
        console.log(`  ${len}-letter (${byLen[len].length}): ${byLen[len].join(", ")}`);
    }
    return words;
}

// ---- GENERATE: Create new harder levels ----
function generateLevels(count = 200) {
    loadDictionary();

    console.log(`\nGenerating ${count} new levels with 7-8 letters...`);
    const generated = [];
    const usedLetterSets = new Set();

    // Strategy: Pick good letter combos that produce many words
    // We want 10-15+ words per level with 7-8 unique letters

    // Common English letter frequencies for weighting
    const vowels = "aeiou";
    const commonCons = "bcdfghlmnprst";
    const rareCons = "jkqvwxyz";

    // Pre-filter dictionary words by letter composition for efficiency
    // Build a map: sorted-letters -> [words that use subsets of those letters]
    // This is too expensive for all combos, so we use random generation + validation

    let attempts = 0;
    const maxAttempts = count * 50;

    while (generated.length < count && attempts < maxAttempts) {
        attempts++;

        // Generate a random 7-8 letter set
        const numLetters = Math.random() < 0.4 ? 7 : 8;
        const numVowels = numLetters <= 7
            ? (2 + Math.floor(Math.random() * 2))  // 2-3 vowels for 7 letters
            : (2 + Math.floor(Math.random() * 3));  // 2-4 vowels for 8 letters

        const numCons = numLetters - numVowels;
        let letterArr = [];

        // Pick vowels (allow some repeats)
        const usedVowels = new Set();
        for (let i = 0; i < numVowels; i++) {
            let v;
            if (i < 2 || Math.random() < 0.3) {
                // First two vowels are unique; later ones might repeat
                do { v = vowels[Math.floor(Math.random() * vowels.length)]; }
                while (usedVowels.has(v) && usedVowels.size < vowels.length);
            } else {
                v = vowels[Math.floor(Math.random() * vowels.length)];
            }
            usedVowels.add(v);
            letterArr.push(v);
        }

        // Pick consonants (mostly common, occasionally rare)
        const usedCons = new Set();
        for (let i = 0; i < numCons; i++) {
            let c;
            const pool = Math.random() < 0.1 ? rareCons : commonCons;
            do { c = pool[Math.floor(Math.random() * pool.length)]; }
            while (usedCons.has(c) && usedCons.size < pool.length);
            usedCons.add(c);
            letterArr.push(c);
        }

        // Sort and deduplicate for comparison
        const sorted = letterArr.sort().join("");
        if (usedLetterSets.has(sorted)) continue;

        // Find all valid words
        const letters = letterArr.join("");
        const words = findAllWords(letters);

        // Filter: we want at least 10 words, with at least one using 6+ letters
        if (words.length < 10) continue;
        const longWords = words.filter(w => w.length >= 6);
        if (longWords.length === 0) continue;

        // Pick the longest word as the "key word" (displayed letters)
        const keyWord = longWords[longWords.length - 1];

        // Split into main words (shown) and bonus words
        // Main words: mix of lengths, 7-12 words
        // Bonus: everything else
        const mainCount = Math.min(Math.max(7, Math.floor(words.length * 0.5)), 14);
        const mainWords = selectMainWords(words, mainCount, keyWord);
        const bonusWords = words.filter(w => !mainWords.includes(w));

        usedLetterSets.add(sorted);
        generated.push({
            letters: keyWord.toUpperCase(),
            words: mainWords.map(w => w.toUpperCase()),
            bonus: bonusWords.map(w => w.toUpperCase()),
            totalWords: words.length,
        });

        if (generated.length % 50 === 0) {
            console.log(`  Generated ${generated.length}/${count} levels (${attempts} attempts)`);
        }
    }

    console.log(`\nGenerated ${generated.length} levels in ${attempts} attempts`);

    // Show stats
    const wordCounts = generated.map(g => g.words.length);
    const totalCounts = generated.map(g => g.totalWords);
    console.log(`  Main words: min=${Math.min(...wordCounts)}, max=${Math.max(...wordCounts)}, avg=${(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length).toFixed(1)}`);
    console.log(`  Total words: min=${Math.min(...totalCounts)}, max=${Math.max(...totalCounts)}, avg=${(totalCounts.reduce((a, b) => a + b, 0) / totalCounts.length).toFixed(1)}`);

    // Show sample
    console.log(`\nSample generated levels:`);
    for (let i = 0; i < Math.min(5, generated.length); i++) {
        const g = generated[i];
        console.log(`  [${g.letters}] ${g.words.length} main + ${g.bonus.length} bonus = ${g.totalWords} total`);
        console.log(`    Main: ${g.words.join(", ")}`);
        console.log(`    Bonus: ${g.bonus.slice(0, 10).join(", ")}${g.bonus.length > 10 ? "..." : ""}`);
    }

    return generated;
}

function selectMainWords(allWords, targetCount, keyWord) {
    // Always include the key word
    const main = [keyWord];
    const remaining = allWords.filter(w => w !== keyWord);

    // Group by length
    const byLen = {};
    for (const w of remaining) {
        const len = w.length;
        if (!byLen[len]) byLen[len] = [];
        byLen[len].push(w);
    }

    // Ensure we have a mix of lengths
    // Priority: include at least one of each available length
    const lengths = Object.keys(byLen).sort((a, b) => a - b);
    for (const len of lengths) {
        if (main.length >= targetCount) break;
        const pick = byLen[len][Math.floor(Math.random() * byLen[len].length)];
        if (!main.includes(pick)) main.push(pick);
    }

    // Fill remaining slots from longer words (more challenging)
    const remainingPool = remaining.filter(w => !main.includes(w));
    remainingPool.sort((a, b) => b.length - a.length); // prefer longer words
    for (const w of remainingPool) {
        if (main.length >= targetCount) break;
        main.push(w);
    }

    return main.sort((a, b) => a.length - b.length || a.localeCompare(b));
}

// ---- UPGRADE: Replace 6-letter levels with harder 7-8 letter ones ----
function getUpgradeRate(levelNum) {
    // Graduated difficulty: more 7-8 letter levels as you progress
    if (levelNum < 8000) return 0;
    if (levelNum < 15000) return 0.05;   //  5% - gentle introduction
    if (levelNum < 30000) return 0.10;   // 10%
    if (levelNum < 60000) return 0.20;   // 20%
    if (levelNum < 100000) return 0.30;  // 30%
    return 0;  // 100k+ already has 7 letters natively
}

function getUpgradeLetterCount(levelNum) {
    // Early on mostly 7-letter, later mix in 8-letter
    if (levelNum < 15000) return 7;                           // only 7-letter
    if (levelNum < 30000) return Math.random() < 0.15 ? 8 : 7;  // 15% chance of 8
    if (levelNum < 60000) return Math.random() < 0.25 ? 8 : 7;  // 25% chance of 8
    return Math.random() < 0.35 ? 8 : 7;                     // 35% chance of 8
}

// For levels with 7 letters already, upgrade some to 8-letter
function getUpgradeRate8(levelNum) {
    if (levelNum < 80000) return 0;
    if (levelNum < 100000) return 0.05;  //  5% become 8-letter
    if (levelNum < 130000) return 0.10;  // 10% become 8-letter
    if (levelNum < 155997) return 0.20;  // 20% become 8-letter
    return 0;  // generated levels, skip
}

function generateOneLevel(numLetters, minWords) {
    const vowels = "aeiou";
    const commonCons = "bcdfghlmnprst";
    const rareCons = "jkqvwxyz";

    for (let attempt = 0; attempt < 200; attempt++) {
        const numVowels = numLetters <= 7
            ? (2 + Math.floor(Math.random() * 2))
            : (2 + Math.floor(Math.random() * 3));
        const numCons = numLetters - numVowels;
        let letterArr = [];

        const usedVowels = new Set();
        for (let i = 0; i < numVowels; i++) {
            let v;
            do { v = vowels[Math.floor(Math.random() * vowels.length)]; }
            while (usedVowels.has(v) && usedVowels.size < vowels.length);
            usedVowels.add(v);
            letterArr.push(v);
        }

        const usedCons = new Set();
        for (let i = 0; i < numCons; i++) {
            let c;
            const pool = Math.random() < 0.1 ? rareCons : commonCons;
            do { c = pool[Math.floor(Math.random() * pool.length)]; }
            while (usedCons.has(c) && usedCons.size < pool.length);
            usedCons.add(c);
            letterArr.push(c);
        }

        const letters = letterArr.join("");
        const words = findAllWords(letters);
        if (words.length < minWords) continue;

        const longWords = words.filter(w => w.length >= 6);
        if (longWords.length === 0) continue;

        const keyWord = longWords[longWords.length - 1];
        const mainCount = Math.min(Math.max(7, Math.floor(words.length * 0.5)), 14);
        const mainWords = selectMainWords(words, mainCount, keyWord);
        const bonusWords = words.filter(w => !mainWords.includes(w));

        return {
            letters: keyWord.toUpperCase(),
            words: mainWords.map(w => w.toUpperCase()),
            bonus: bonusWords.map(w => w.toUpperCase()),
        };
    }
    return null;
}

function upgradeLevels(dryRun = false) {
    loadDictionary();
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));

    // Use a seeded PRNG so upgrades are deterministic
    let seed = 42;
    function seededRandom() {
        seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
        return seed / 0x7fffffff;
    }

    let totalUpgraded = 0;
    let totalBy7 = 0;
    let totalBy8 = 0;
    const rangeCounts = {};

    for (const chunk of manifest) {
        // Skip generated Summit levels
        if (chunk.start >= 155997) continue;

        const filePath = path.join(DATA_DIR, chunk.file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        let chunkUpgraded = 0;

        for (const [lvNum, entry] of Object.entries(data)) {
            const num = parseInt(lvNum);
            const currentLetterLen = entry[0].length;

            let shouldUpgrade = false;
            let targetLetters = 0;

            if (currentLetterLen <= 6) {
                // 6-letter levels: upgrade to 7 or 8 based on graduated rate
                const rate = getUpgradeRate(num);
                if (rate > 0 && seededRandom() < rate) {
                    targetLetters = getUpgradeLetterCount(num);
                    shouldUpgrade = true;
                }
            } else if (currentLetterLen === 7) {
                // 7-letter levels (100k+): upgrade some to 8
                const rate = getUpgradeRate8(num);
                if (rate > 0 && seededRandom() < rate) {
                    targetLetters = 8;
                    shouldUpgrade = true;
                }
            }

            if (!shouldUpgrade) continue;

            const newLevel = generateOneLevel(targetLetters, 10);
            if (!newLevel) continue;

            // Preserve group/pack from original
            const [, , group, pack] = entry;
            data[lvNum] = [
                newLevel.letters,
                newLevel.words,
                group,
                pack,
                newLevel.bonus,
            ];
            chunkUpgraded++;
            totalUpgraded++;
            if (targetLetters === 7) totalBy7++;
            else totalBy8++;

            // Track by range
            const rangeKey = Math.floor(num / 10000) * 10000;
            rangeCounts[rangeKey] = (rangeCounts[rangeKey] || 0) + 1;
        }

        if (chunkUpgraded > 0 && !dryRun) {
            fs.writeFileSync(filePath, JSON.stringify(data));
        }
        if (chunkUpgraded > 0) {
            process.stdout.write(`\r  ${chunk.file}: upgraded ${chunkUpgraded} levels`);
        }
    }

    console.log(`\n\n=== Upgrade Summary ===`);
    console.log(`Total upgraded: ${totalUpgraded} (${totalBy7} to 7-letter, ${totalBy8} to 8-letter)`);
    console.log(`\nBy level range:`);
    for (const range of Object.keys(rangeCounts).sort((a, b) => a - b)) {
        const r = parseInt(range);
        const count = rangeCounts[range];
        const total = Math.min(10000, 155996 - r);
        const pct = (count / total * 100).toFixed(1);
        const bar = "#".repeat(Math.min(50, Math.round(count / 50)));
        console.log(`  ${String(r).padStart(6)}-${String(r + 9999).padStart(6)}: ${String(count).padStart(5)} upgraded (${pct}%) ${bar}`);
    }
    if (dryRun) console.log("\n(dry run - no files modified)");
}

// ---- SAVE GENERATED LEVELS ----
function saveGeneratedLevels(levels, startLevel) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));
    const index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));

    // Determine group/pack names for new levels
    // We'll use a new group name to distinguish generated levels
    const groupName = "Summit";
    const packNames = ["Peak", "Ridge", "Crest", "Apex", "Zenith",
        "Spire", "Crown", "Aerie", "Vertex", "Pinnacle"];

    // Build chunk data
    const chunkSize = 200;
    const chunks = [];
    let currentChunk = {};
    let chunkStart = startLevel;
    let packIdx = 0;
    let inPackCount = 0;

    for (let i = 0; i < levels.length; i++) {
        const lvNum = startLevel + i;
        const lvData = levels[i];

        // Pack changes every 25 levels
        if (inPackCount >= 25) {
            packIdx = (packIdx + 1) % packNames.length;
            inPackCount = 0;
        }

        currentChunk[lvNum] = [
            lvData.letters,
            lvData.words,
            groupName,
            packNames[packIdx],
            lvData.bonus,
        ];
        inPackCount++;

        // New chunk every 200 levels
        if (Object.keys(currentChunk).length >= chunkSize || i === levels.length - 1) {
            const chunkEnd = lvNum;
            const fileName = `levels-${String(chunkStart).padStart(6, "0")}-${String(chunkEnd).padStart(6, "0")}.json`;
            chunks.push({ file: fileName, start: chunkStart, end: chunkEnd, data: currentChunk });
            currentChunk = {};
            chunkStart = lvNum + 1;
        }
    }

    // Write chunk files
    for (const chunk of chunks) {
        const filePath = path.join(DATA_DIR, chunk.file);
        fs.writeFileSync(filePath, JSON.stringify(chunk.data));
        console.log(`  Wrote ${chunk.file} (${chunk.end - chunk.start + 1} levels)`);
        manifest.push({ file: chunk.file, start: chunk.start, end: chunk.end });
    }

    // Update index with new packs
    packIdx = 0;
    inPackCount = 0;
    let packStart = startLevel;
    for (let i = 0; i < levels.length; i++) {
        inPackCount++;
        if (inPackCount >= 25 || i === levels.length - 1) {
            index.push({
                group: groupName,
                pack: packNames[packIdx],
                start: packStart,
                end: startLevel + i,
            });
            packIdx = (packIdx + 1) % packNames.length;
            packStart = startLevel + i + 1;
            inPackCount = 0;
        }
    }

    // Write updated manifest and index
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
    console.log(`\nUpdated chunk-manifest.json and level-index.json`);
    console.log(`New levels: ${startLevel} - ${startLevel + levels.length - 1}`);
}

// ---- CLI ----
const [,, command, ...args] = process.argv;

switch (command) {
    case "analyze": {
        const file = args[0] || "levels-000001-000200.json";
        analyzeChunk(file);
        break;
    }
    case "enhance": {
        const file = args[0];
        if (!file) {
            console.log("Usage: node level-generator.js enhance <chunk-file>");
            console.log("  e.g. node level-generator.js enhance levels-000001-000200.json");
            console.log("\nTo enhance ALL chunks:");
            console.log("  node level-generator.js enhance --all");
            break;
        }
        if (file === "--all") {
            const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));
            let totalAdded = 0;
            for (const chunk of manifest) {
                loadDictionary();
                const filePath = path.join(DATA_DIR, chunk.file);
                const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
                let chunkAdded = 0;
                for (const [lvNum, entry] of Object.entries(data)) {
                    const [letters, words, group, pack, bonus] = entry;
                    const existingWords = new Set([
                        ...words.map(w => w.toLowerCase()),
                        ...(bonus || []).map(w => w.toLowerCase()),
                    ]);
                    const allValid = findAllWords(letters);
                    const missing = allValid.filter(w => !existingWords.has(w));
                    if (missing.length > 0) {
                        entry[4] = [...(bonus || []), ...missing.map(w => w.toUpperCase())];
                        chunkAdded += missing.length;
                    }
                }
                if (chunkAdded > 0) {
                    fs.writeFileSync(filePath, JSON.stringify(data));
                    totalAdded += chunkAdded;
                }
                process.stdout.write(`\r  Enhanced ${chunk.file} (+${chunkAdded} words)`);
            }
            console.log(`\n\nTotal bonus words added: ${totalAdded}`);
        } else {
            enhanceChunk(file);
        }
        break;
    }
    case "generate": {
        const count = parseInt(args[0]) || 200;
        const levels = generateLevels(count);
        if (levels.length > 0 && args.includes("--save")) {
            const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));
            const lastLevel = manifest[manifest.length - 1].end;
            const startLevel = lastLevel + 1;
            saveGeneratedLevels(levels, startLevel);
        } else if (levels.length > 0) {
            console.log(`\nRun with --save to write levels to data files (starting at level ${
                JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8")).slice(-1)[0].end + 1
            })`);
        }
        break;
    }
    case "stats": {
        showStats();
        break;
    }
    case "search": {
        const letters = args[0];
        if (!letters) {
            console.log("Usage: node level-generator.js search <letters>");
            console.log("  e.g. node level-generator.js search DADDIES");
            break;
        }
        searchLetters(letters);
        break;
    }
    case "upgrade": {
        const dryRun = args.includes("--dry-run");
        upgradeLevels(dryRun);
        break;
    }
    default:
        console.log(`WordPlay Level Generator & Enhancer

Usage:
  node level-generator.js analyze [chunk-file]   Analyze a chunk, find missing words
  node level-generator.js enhance <chunk-file>   Add missing words as bonus words
  node level-generator.js enhance --all          Enhance ALL level chunks
  node level-generator.js generate [count]       Generate new harder levels
  node level-generator.js generate [count] --save  Generate AND save to data files
  node level-generator.js upgrade                Upgrade 6-letter levels to 7-8 (graduated)
  node level-generator.js upgrade --dry-run      Preview upgrade without modifying files
  node level-generator.js stats                  Show statistics across sampled levels
  node level-generator.js search <letters>       Find all words from letter set

Upgrade schedule (replaces existing 6-letter levels in-place):
   8k-15k:  5% upgraded to 7-letter
  15k-30k: 10% upgraded to 7-8 letter (15% chance of 8)
  30k-60k: 20% upgraded to 7-8 letter (25% chance of 8)
  60k-100k: 30% upgraded to 7-8 letter (35% chance of 8)
  100k-156k: 10-20% of 7-letter upgraded to 8-letter

Examples:
  node level-generator.js search DADDIES
  node level-generator.js analyze levels-015001-015200.json
  node level-generator.js enhance --all
  node level-generator.js generate 500 --save
  node level-generator.js upgrade`);
}
