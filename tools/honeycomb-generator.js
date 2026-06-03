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
const BIG_DICT = path.join(__dirname, "enable1.txt"); // broad real-word dictionary
const OUT = path.join(__dirname, "..", "WordPlay", "wwwroot", "data", "honeycomb.json");

const MIN_WORDS = 20;
const MAX_WORDS = 36;
const POOL_TARGET = 400;
const TARGET_COUNT = 24; // prefer puzzles near this many answers (gentler to clear)

function distinctSorted(w) {
  return Array.from(new Set(w.split(""))).sort().join("");
}

// Regular plural / inflected forms a player will reflexively try once the base
// word is accepted (FIFE -> FIFES, FENCE -> FENCES). Kept simple on purpose.
function familyForms(w) {
  var forms = [w + "S"];
  if (/(?:S|X|Z|CH|SH)$/.test(w)) forms.push(w + "ES");
  return forms;
}

function fitsHive(w, allowed) {
  for (const c of w) if (!allowed.has(c)) return false;
  return true;
}

// Turn a selected (letters, center, casual-dict set) into the shipped puzzle:
//  - expand answers to their regular plural forms when those are real and fit (#3)
//  - recompute pangrams + maxScore over the final answer set
//  - collect the "bonus" set: real words that fit the hive but aren't scored (#2)
function finalizePuzzle(best, allowed, big) {
  const { letters, center } = best;
  const accepted = new Set(best.set);
  for (const w of best.set) {
    for (const form of familyForms(w)) {
      if (big.has(form) && fitsHive(form, allowed)) accepted.add(form);
    }
  }

  const words = Array.from(accepted).sort();
  const pangrams = words.filter(w => core.isPangram(w, letters)).sort();
  const maxScore = words.reduce((s, w) => s + core.scoreWord(w, letters), 0);

  const bonus = [];
  for (const w of big) {
    if (w.indexOf(center) === -1 || accepted.has(w)) continue;
    if (fitsHive(w, allowed)) bonus.push(w);
  }
  bonus.sort();

  return { letters, center, words, pangrams, maxScore, bonus };
}

function main() {
  const words = fs.readFileSync(DICT, "utf8")
    .split(/\r?\n/)
    .map(s => s.trim().toUpperCase())
    .filter(w => /^[A-Z]+$/.test(w) && w.length >= 4);

  // Broad real-word set: used to (a) expand accepted answers to their regular
  // plural forms and (b) recognize real-but-unscored words for friendly feedback.
  const big = new Set(
    fs.readFileSync(BIG_DICT, "utf8")
      .split(/\r?\n/)
      .map(s => s.trim().toUpperCase())
      .filter(w => /^[A-Z]+$/.test(w) && w.length >= 4)
  );

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
        best = { closeness, letters, center, set };
      }
    }
    if (best) puzzles.push(finalizePuzzle(best, allowed, big));
  }

  // Stable quality sort: prefer puzzles near TARGET_COUNT (gentler), then
  // richer pangram variety, then alphabetical for determinism.
  puzzles.sort((a, b) =>
    (Math.abs(a.words.length - TARGET_COUNT) - Math.abs(b.words.length - TARGET_COUNT)) ||
    (b.pangrams.length - a.pangrams.length) ||
    a.letters.localeCompare(b.letters)
  );
  const pool = puzzles.slice(0, POOL_TARGET);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ version: 1, puzzles: pool }));
  console.log(`Wrote ${pool.length} honeycomb puzzles to ${OUT}`);
}

main();
