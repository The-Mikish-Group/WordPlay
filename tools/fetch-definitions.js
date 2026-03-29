// tools/fetch-definitions.js
// Fetches definitions from Free Dictionary API for all grid words.
// Resume-safe: skips words already in definitions.json.
// Rate-limited to ~2 requests/second to be polite.
//
// Usage: node fetch-definitions.js
// Runs until all words are attempted. Ctrl+C safe (resume on restart).

const fs = require('fs');
const path = require('path');
const https = require('https');

const WORDS_PATH = path.join(__dirname, 'grid-words.txt');
const OUT_PATH = path.join(__dirname, '..', 'WordPlay', 'wwwroot', 'data', 'definitions.json');
const FAILED_PATH = path.join(__dirname, 'failed-words.txt');
const DELAY_MS = 550; // ~2 requests/sec

// Load existing definitions
let definitions = {};
if (fs.existsSync(OUT_PATH)) {
    definitions = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
}

// Load failed words (already attempted, no result)
let failed = new Set();
if (fs.existsSync(FAILED_PATH)) {
    failed = new Set(fs.readFileSync(FAILED_PATH, 'utf8').split('\n').filter(w => w.trim()));
}

// Load word list
const words = fs.readFileSync(WORDS_PATH, 'utf8')
    .split('\n')
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length > 0);

// Find remaining words
const remaining = words.filter(w => !definitions[w] && !failed.has(w));
console.log(`Total grid words: ${words.length}`);
console.log(`Already defined: ${Object.keys(definitions).length}`);
console.log(`Previously failed: ${failed.size}`);
console.log(`Remaining to fetch: ${remaining.length}`);

if (remaining.length === 0) {
    console.log('\nAll words attempted! Check failed-words.txt for gaps.');
    process.exit(0);
}

function fetchWord(word) {
    return new Promise((resolve) => {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    resolve(null);
                    return;
                }
                try {
                    const json = JSON.parse(data);
                    if (!Array.isArray(json) || json.length === 0) {
                        resolve(null);
                        return;
                    }
                    // Extract part of speech and definitions
                    const entry = json[0];
                    const parts = new Set();
                    const defs = [];
                    for (const meaning of (entry.meanings || [])) {
                        if (meaning.partOfSpeech) parts.add(meaning.partOfSpeech);
                        for (const def of (meaning.definitions || []).slice(0, 2)) {
                            if (defs.length < 3) defs.push(def.definition);
                        }
                    }
                    if (defs.length === 0) {
                        resolve(null);
                        return;
                    }
                    resolve({
                        p: [...parts].join(', '),
                        d: defs
                    });
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

function save() {
    fs.writeFileSync(OUT_PATH, JSON.stringify(definitions));
    fs.writeFileSync(FAILED_PATH, [...failed].join('\n'));
}

async function run() {
    let count = 0;
    const startTime = Date.now();
    const saveInterval = 50; // save every 50 words

    for (const word of remaining) {
        const result = await fetchWord(word);
        if (result) {
            definitions[word] = result;
        } else {
            failed.add(word);
        }
        count++;

        if (count % saveInterval === 0) {
            save();
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const rate = (count / (Date.now() - startTime) * 1000).toFixed(1);
            const eta = ((remaining.length - count) / rate / 60).toFixed(1);
            console.log(`[${count}/${remaining.length}] Defined: ${Object.keys(definitions).length} | Failed: ${failed.size} | ${rate}/sec | ETA: ${eta}min`);
        }

        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    save();
    console.log(`\nDone! Defined: ${Object.keys(definitions).length} | Failed: ${failed.size}`);
    console.log(`Failed words saved to: ${FAILED_PATH}`);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\nInterrupted! Saving progress...');
    save();
    console.log(`Saved ${Object.keys(definitions).length} definitions, ${failed.size} failed.`);
    process.exit(0);
});

run();
