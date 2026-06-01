const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const core = require("../WordPlay/wwwroot/js/honeycomb-core.js");

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "WordPlay", "wwwroot", "data", "honeycomb.json"), "utf8"));

test("pool is non-empty", () => {
  assert.ok(Array.isArray(data.puzzles) && data.puzzles.length > 0);
});

test("every puzzle is well-formed and self-consistent", () => {
  for (const p of data.puzzles) {
    assert.strictEqual(p.letters.length, 7, "7 letters");
    assert.strictEqual(new Set(p.letters.split("")).size, 7, "distinct letters");
    assert.ok(p.letters.includes(p.center), "center in letters");
    assert.ok(p.words.length >= 20 && p.words.length <= 60, "word count band");
    assert.ok(p.pangrams.length >= 1, "has a pangram");

    const wordSet = new Set(p.words);
    for (const w of p.words) {
      const v = core.validateWord(w, { letters: p.letters, center: p.center, wordSet });
      assert.ok(v.ok, `word ${w} valid in ${p.letters}/${p.center}`);
    }
    for (const pan of p.pangrams) {
      assert.ok(core.isPangram(pan, p.letters), `${pan} is a pangram`);
    }
    const computed = p.words.reduce((s, w) => s + core.scoreWord(w, p.letters), 0);
    assert.strictEqual(p.maxScore, computed, "maxScore matches sum");
  }
});
