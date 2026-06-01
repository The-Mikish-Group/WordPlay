#!/usr/bin/env node
// ============================================================
// WordPlay — Honeycomb puzzle generator.
// Reads tools/casual-dict.txt (common words) and writes a pool of
// Spelling-Bee-style puzzles to wwwroot/data/honeycomb.json.
// Run: node tools/honeycomb-generator.js
// ============================================================
const fs = require("fs");
const path = require("path");
const core = require("../WordPlay/wwwroot/js/honeycomb-core.js");

const DICT = path.join(__dirname, "casual-dict.txt");
const OUT = path.join(__dirname, "..", "WordPlay", "wwwroot", "data", "honeycomb.json");

const MIN_WORDS = 20;
const MAX_WORDS = 60;
const POOL_TARGET = 400;
const TARGET_COUNT = 30; // prefer puzzles near this many answers

function distinctSorted(w) {
  return Array.from(new Set(w.split(""))).sort().join("");
}

function main() {
  const words = fs.readFileSync(DICT, "utf8")
    .split(/\r?\n/)
    .map(s => s.trim().toUpperCase())
    .filter(w => /^[A-Z]+$/.test(w) && w.length >= 4);

  // Candidate 7-letter sets = distinct-letter signature of any 7-distinct-letter word.
  const setKeys = new Set();
  for (const w of words) {
    if (new Set(w.split("")).size === 7) setKeys.add(distinctSorted(w));
  }

  const puzzles = [];
  for (const letters of setKeys) {
    const allowed = new Set(letters.split(""));
    const usable = words.filter(w => {
      for (const c of w) if (!allowed.has(c)) return false;
      return true;
    });

    let best = null;
    for (const center of letters) {
      const set = usable.filter(w => w.indexOf(center) !== -1);
      if (set.length < MIN_WORDS || set.length > MAX_WORDS) continue;
      const pangrams = set.filter(w => core.isPangram(w, letters));
      if (pangrams.length === 0) continue;
      const closeness = Math.abs(set.length - TARGET_COUNT);
      if (!best || closeness < best.closeness) {
        const maxScore = set.reduce((s, w) => s + core.scoreWord(w, letters), 0);
        best = {
          closeness,
          puzzle: {
            letters,
            center,
            words: set.slice().sort(),
            pangrams: pangrams.slice().sort(),
            maxScore
          }
        };
      }
    }
    if (best) puzzles.push(best.puzzle);
  }

  // Stable quality sort, then cap to the pool target.
  puzzles.sort((a, b) =>
    (b.pangrams.length - a.pangrams.length) ||
    (b.words.length - a.words.length) ||
    a.letters.localeCompare(b.letters)
  );
  const pool = puzzles.slice(0, POOL_TARGET);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ version: 1, puzzles: pool }));
  console.log(`Wrote ${pool.length} honeycomb puzzles to ${OUT}`);
}

main();
