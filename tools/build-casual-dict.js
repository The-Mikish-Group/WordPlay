#!/usr/bin/env node
// Build the casual game dictionary and test key word viability
const fs = require("fs");
const path = require("path");

const TOOLS = __dirname;

// Small blocklist: words with inflated Google frequency from non-English web content
const BLOCKLIST = new Set([
    "shri",   // Hindi honorific
    "sri",    // Same
    "che",    // Che Guevara inflates frequency
    "shi",    // Japanese/Chinese
    "hai",    // Japanese 'yes'
    "dari",   // Afghan language name
    "dhal",   // variant spelling of dal
]);

// Load sources
const wsGridWords = new Set();
const orig = JSON.parse(fs.readFileSync(path.join(TOOLS, "..", "scraper", "checkpoints", "progress-gameanswers.json"), "utf-8")).levels;
for (const [num, entry] of Object.entries(orig)) {
    for (const w of (entry.words || [])) wsGridWords.add(w.toLowerCase());
}

const freqLines = fs.readFileSync(path.join(TOOLS, "word-freq.txt"), "utf-8").split("\n");
const wordFreq = {};
for (const line of freqLines) {
    const parts = line.split("\t");
    if (parts.length === 2) wordFreq[parts[0].toLowerCase()] = parseInt(parts[1]);
}

const enable = new Set(
    fs.readFileSync(path.join(TOOLS, "enable1.txt"), "utf-8")
        .split(/\r?\n/).map(w => w.trim().toLowerCase())
        .filter(w => w.length >= 3 && w.length <= 8 && /^[a-z]+$/i.test(w))
);

// Build casual word list
const casualWords = new Set();

// 1. Wordscapes grid words (proven casual-friendly)
for (const w of wsGridWords) {
    if (enable.has(w) && w.length >= 3 && w.length <= 8) {
        casualWords.add(w);
    }
}
const fromWS = casualWords.size;

// 2. High-frequency ENABLE words (tiered by length)
for (const w of enable) {
    if (casualWords.has(w)) continue;
    const freq = wordFreq[w] || 0;
    const len = w.length;

    let threshold;
    if (len <= 3) threshold = 2000000;
    else if (len === 4) threshold = 800000;
    else if (len === 5) threshold = 400000;
    else threshold = 100000;

    if (freq >= threshold) {
        casualWords.add(w);
    }
}

// 3. Remove blocklisted words
for (const w of BLOCKLIST) casualWords.delete(w);

const fromFreq = casualWords.size - fromWS;
console.log("Casual dict: " + fromWS + " from Wordscapes + " + fromFreq + " from frequency = " + casualWords.size + " total");

// Stats by length
const byLen = {};
for (const w of casualWords) {
    const len = w.length;
    if (!byLen[len]) byLen[len] = 0;
    byLen[len]++;
}
console.log("\nBy length:");
for (const [len, count] of Object.entries(byLen).sort((a, b) => a[0] - b[0])) {
    console.log("  " + len + " letters: " + count);
}

// Save
const sorted = [...casualWords].sort();
fs.writeFileSync(path.join(TOOLS, "casual-dict.txt"), sorted.join("\n"));
console.log("\nSaved to tools/casual-dict.txt");

// Verification
const checks = [
    ["shri", false], ["hisn", false], ["rhus", false], ["rins", false],
    ["software", true], ["miracle", true], ["grumbles", true], ["roasted", true],
    ["thunder", true], ["whisper", true], ["kitchen", true], ["dolphin", true],
];
console.log("\nVerification:");
for (const [w, expected] of checks) {
    const got = casualWords.has(w);
    console.log("  " + w.padEnd(12) + (got ? "IN " : "OUT") + "  " + (got === expected ? "ok" : "WRONG"));
}

// Test key word viability
const words = [...casualWords];
function findWordsFromKey(keyWord) {
    const available = {};
    for (const ch of keyWord.toLowerCase()) available[ch] = (available[ch] || 0) + 1;
    const results = [];
    for (const word of words) {
        if (word.length > keyWord.length) continue;
        const needed = {};
        let valid = true;
        for (const ch of word) {
            needed[ch] = (needed[ch] || 0) + 1;
            if (!available[ch] || needed[ch] > available[ch]) { valid = false; break; }
        }
        if (valid) results.push(word);
    }
    return results;
}

// Sample 300 random key words per length
console.log("\nKey word viability (sampling 300 each):");
for (const keyLen of [6, 7, 8]) {
    const candidates = words.filter(w => w.length === keyLen);
    const shuffled = candidates.sort(() => 0.5 - Math.random());
    const sample = shuffled.slice(0, 300);
    let viable = 0;
    for (const kw of sample) {
        const found = findWordsFromKey(kw);
        if (found.length >= 7) viable++;
    }
    const pct = (viable / sample.length * 100).toFixed(0);
    const est = Math.round(candidates.length * viable / sample.length);
    console.log("  " + keyLen + "-letter: " + viable + "/300 viable (" + pct + "%), ~" + est + " of " + candidates.length + " total");
}
