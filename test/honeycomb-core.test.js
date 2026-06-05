const test = require("node:test");
const assert = require("node:assert");
const core = require("../WordPlay/wwwroot/js/honeycomb-core.js");

test("scoreWord: 4 letters = 1 point", () => {
  assert.strictEqual(core.scoreWord("GLEN", "AEGLNRT"), 1);
});

test("scoreWord: 5+ letters = word length", () => {
  assert.strictEqual(core.scoreWord("ANGLE", "AEGLNRT"), 5);
  assert.strictEqual(core.scoreWord("GENERAL", "AEGLNRT"), 7);
});

test("scoreWord: pangram adds 7 bonus", () => {
  // TANGLER uses all of A,E,G,L,N,R,T -> 7 + 7 = 14
  assert.strictEqual(core.scoreWord("TANGLER", "AEGLNRT"), 14);
});

test("isPangram: true only when all 7 letters used", () => {
  assert.strictEqual(core.isPangram("TANGLER", "AEGLNRT"), true);
  assert.strictEqual(core.isPangram("ANGLE", "AEGLNRT"), false);
});

function puzzle(words, bonus) {
  return { letters: "AEGLNRT", center: "G", wordSet: new Set(words), bonusSet: new Set(bonus || []) };
}

test("validateWord: rejects words shorter than 4", () => {
  assert.deepStrictEqual(core.validateWord("GEL", puzzle(["GEL"])), { ok: false, reason: "short" });
});

test("validateWord: rejects words missing the center letter", () => {
  assert.deepStrictEqual(core.validateWord("LANE", puzzle(["LANE"])), { ok: false, reason: "center" });
});

test("validateWord: rejects words using letters outside the set", () => {
  assert.deepStrictEqual(core.validateWord("GOAT", puzzle(["GOAT"])), { ok: false, reason: "badletter" });
});

test("validateWord: rejects words not in the answer set", () => {
  assert.deepStrictEqual(core.validateWord("GNARL", puzzle([])), { ok: false, reason: "notword" });
});

test("validateWord: real word in bonus set reported as 'unlisted', not 'notword'", () => {
  assert.deepStrictEqual(core.validateWord("GNARL", puzzle([], ["GNARL"])), { ok: false, reason: "unlisted" });
});

test("validateWord: accepts a valid answer", () => {
  assert.deepStrictEqual(core.validateWord("ANGLE", puzzle(["ANGLE"])), { ok: true });
});

test("hiveTarget: caps at HIVE_TARGET, shrinks for tiny puzzles", () => {
  assert.strictEqual(core.hiveTarget(24), core.HIVE_TARGET); // 12
  assert.strictEqual(core.hiveTarget(12), 12);
  assert.strictEqual(core.hiveTarget(8), 8);                 // fewer answers than target
});

test("rankThresholds: 7 ranks evenly spread across the word target", () => {
  const t = core.rankThresholds(12);
  assert.strictEqual(t.length, 7);
  assert.strictEqual(t[0].name, "Worker");
  assert.strictEqual(t[0].at, 0);
  assert.strictEqual(t[6].name, "Queen Bee");
  assert.strictEqual(t[6].at, 12); // Queen Bee == target == 100%
  assert.deepStrictEqual(t.map(x => x.at), [0, 2, 4, 6, 8, 10, 12]);
});

test("currentRankIndex: highest rank whose word count is met", () => {
  assert.strictEqual(core.currentRankIndex(0, 12), 0);
  assert.strictEqual(core.currentRankIndex(2, 12), 1);
  assert.strictEqual(core.currentRankIndex(11, 12), 5);
  assert.strictEqual(core.currentRankIndex(12, 12), 6); // hive complete
});

test("ringPct: percent of words toward the target, capped at 100", () => {
  assert.strictEqual(core.ringPct(0, 12), 0);
  assert.strictEqual(core.ringPct(6, 12), 50);
  assert.strictEqual(core.ringPct(12, 12), 100);
  assert.strictEqual(core.ringPct(99, 12), 100);
});

test("newlyReachedRanks: returns unclaimed reached rank indices", () => {
  assert.deepStrictEqual(core.newlyReachedRanks(4, 12, []), [1, 2]);
  assert.deepStrictEqual(core.newlyReachedRanks(4, 12, [1]), [2]);
  assert.deepStrictEqual(core.newlyReachedRanks(4, 12, [1, 2]), []);
});

test("rewardForRank: Queen Bee pays coins + jars, Worker pays nothing", () => {
  assert.deepStrictEqual(core.rewardForRank(0), {});
  assert.ok(core.rewardForRank(6).coins > 0);
  assert.ok(core.rewardForRank(6).jars > 0);
});

test("pickDailyIndex: deterministic for a given date + pool size", () => {
  const a = core.pickDailyIndex("2026-06-01", 400);
  const b = core.pickDailyIndex("2026-06-01", 400);
  assert.strictEqual(a, b);
  assert.ok(a >= 0 && a < 400);
});

test("pickDailyIndex: different dates usually differ", () => {
  const a = core.pickDailyIndex("2026-06-01", 400);
  const b = core.pickDailyIndex("2026-06-02", 400);
  assert.notStrictEqual(a, b);
});

test("pickDailyIndex: empty pool returns 0", () => {
  assert.strictEqual(core.pickDailyIndex("2026-06-01", 0), 0);
});
