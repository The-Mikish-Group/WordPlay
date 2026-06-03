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

function puzzle(words) {
  return { letters: "AEGLNRT", center: "G", wordSet: new Set(words) };
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

test("validateWord: accepts a valid answer", () => {
  assert.deepStrictEqual(core.validateWord("ANGLE", puzzle(["ANGLE"])), { ok: true });
});

test("rankThresholds: 7 ranks, ceil of percentage of maxScore", () => {
  const t = core.rankThresholds(100);
  assert.strictEqual(t.length, 7);
  assert.strictEqual(t[0].name, "Worker");
  assert.strictEqual(t[0].at, 0);
  assert.strictEqual(t[6].name, "Queen Bee");
  assert.strictEqual(t[6].at, 70); // ceil(100 * 0.70)
  assert.strictEqual(t[1].at, 6); // Forager 6%
});

test("currentRankIndex: highest rank whose threshold is met", () => {
  assert.strictEqual(core.currentRankIndex(0, 100), 0);
  assert.strictEqual(core.currentRankIndex(10, 100), 1);
  assert.strictEqual(core.currentRankIndex(69, 100), 5);
  assert.strictEqual(core.currentRankIndex(70, 100), 6);
});

test("ringPct: percent toward Queen Bee, capped at 100", () => {
  assert.strictEqual(core.ringPct(0, 100), 0);
  assert.strictEqual(core.ringPct(35, 100), 50); // 35 / 70
  assert.strictEqual(core.ringPct(70, 100), 100);
  assert.strictEqual(core.ringPct(200, 100), 100);
});

test("newlyReachedRanks: returns unclaimed reached rank indices", () => {
  assert.deepStrictEqual(core.newlyReachedRanks(20, 100, []), [1, 2]);
  assert.deepStrictEqual(core.newlyReachedRanks(20, 100, [1]), [2]);
  assert.deepStrictEqual(core.newlyReachedRanks(20, 100, [1, 2]), []);
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
