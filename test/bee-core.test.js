const test = require("node:test");
const assert = require("node:assert");
const core = require("../WordPlay/wwwroot/js/bee-core.js");

test("BEES registry has 30 bees with required fields", () => {
  assert.strictEqual(core.BEES.length, 30);
  const ids = new Set();
  for (const b of core.BEES) {
    assert.ok(b.id && typeof b.id === "string");
    assert.ok(!ids.has(b.id), "duplicate id " + b.id);
    ids.add(b.id);
    assert.ok(b.name && typeof b.name === "string");
    assert.ok(["common","uncommon","rare","epic","legendary"].includes(b.tier));
    assert.ok(["coinPerWord","honeyPerGoal","honeycombCoins","dailyHint"].includes(b.perk.type));
    assert.ok(Number.isFinite(b.perk.value));
    assert.ok(typeof b.flavor === "string" && b.flavor.length > 0);
    assert.ok(b.source === "discovery" || b.source.startsWith("milestone:"));
  }
});

test("registry tier counts are 8/8/7/4/3", () => {
  const c = {};
  for (const b of core.BEES) c[b.tier] = (c[b.tier] || 0) + 1;
  assert.deepStrictEqual(c, { common: 8, uncommon: 8, rare: 7, epic: 4, legendary: 3 });
});

test("commonIds returns exactly the 8 common ids", () => {
  const ids = core.commonIds();
  assert.strictEqual(ids.length, 8);
  for (const id of ids) assert.strictEqual(core.getBee(id).tier, "common");
});

test("getBee returns a bee by id, or null", () => {
  assert.strictEqual(core.getBee("worker").name, "Worker Bee");
  assert.strictEqual(core.getBee("nope"), null);
});

test("MAX_ACTIVE is 3", () => {
  assert.strictEqual(core.MAX_ACTIVE, 3);
});

test("activePerks sums equipped bees' perks, all types default 0", () => {
  assert.deepStrictEqual(core.activePerks([]), {
    coinPerWord: 0, honeyPerGoal: 0, honeycombCoins: 0, dailyHint: 0
  });
  // worker = coinPerWord 1, drone = coinPerWord 2, scout = honeycombCoins 2
  assert.deepStrictEqual(core.activePerks(["worker", "drone", "scout"]), {
    coinPerWord: 3, honeyPerGoal: 0, honeycombCoins: 2, dailyHint: 0
  });
});

test("activePerks ignores ids beyond the first 3 (defensive cap)", () => {
  const p = core.activePerks(["worker", "drone", "monarch", "scout"]);
  // worker1 + drone2 + monarch3 = 6 coinPerWord; scout (4th) ignored
  assert.strictEqual(p.coinPerWord, 6);
  assert.strictEqual(p.honeycombCoins, 0);
});

test("activePerks ignores unknown ids", () => {
  assert.deepStrictEqual(core.activePerks(["worker", "ghost"]), {
    coinPerWord: 1, honeyPerGoal: 0, honeycombCoins: 0, dailyHint: 0
  });
});

test("canEquip: must be owned, not already active, fewer than 3 active", () => {
  const owned = ["worker", "drone", "scout", "nurse"];
  assert.strictEqual(core.canEquip({ bees: owned, active: [] }, "worker"), true);
  assert.strictEqual(core.canEquip({ bees: owned, active: ["worker"] }, "worker"), false); // already active
  assert.strictEqual(core.canEquip({ bees: owned, active: [] }, "regent"), false); // not owned
  assert.strictEqual(core.canEquip({ bees: owned, active: ["worker","drone","scout"] }, "nurse"), false); // full
});

test("discoveryPool is only discovery-source bees", () => {
  const pool = core.discoveryPool();
  assert.ok(pool.includes("worker"));
  assert.ok(!pool.includes("regent"));   // milestone
  assert.ok(!pool.includes("monarch"));  // milestone
});

test("pickDiscovery excludes owned and returns from the pool", () => {
  // rng returns 0 -> first candidate after weighting expansion
  const id = core.pickDiscovery(["worker", "forager"], () => 0);
  assert.ok(core.discoveryPool().includes(id));
  assert.ok(id !== "worker" && id !== "forager");
});

test("pickDiscovery returns null when the discovery pool is exhausted", () => {
  const allDiscovery = core.discoveryPool();
  assert.strictEqual(core.pickDiscovery(allDiscovery, () => 0), null);
});

test("pickDiscovery is weighted toward commons (statistical)", () => {
  // Seeded-ish rng: cycle through fixed fractions; commons should dominate counts.
  let n = 0;
  const seq = [0.01, 0.2, 0.5, 0.8, 0.99];
  const rng = () => seq[(n++) % seq.length];
  const counts = {};
  for (let i = 0; i < 500; i++) {
    const id = core.pickDiscovery([], rng);
    counts[id] = (counts[id] || 0) + 1;
  }
  const commons = (counts.worker || 0) + (counts.forager || 0);
  const rares = (counts.drone || 0) + (counts.sentinel || 0);
  assert.ok(commons > rares, `commons ${commons} should exceed rares ${rares}`);
});

test("evaluateMilestones returns satisfied, not-yet-owned milestone bees", () => {
  // honeycombQueen requires rank index 6; questComplete requires >=1 quest done
  assert.deepStrictEqual(
    core.evaluateMilestones({ honeycombRankIndex: 6, questsCompleted: 0, ownedIds: [] }),
    ["regent"]);
  assert.deepStrictEqual(
    core.evaluateMilestones({ honeycombRankIndex: 6, questsCompleted: 2, ownedIds: [] }).sort(),
    ["monarch", "regent"]);
});

test("evaluateMilestones excludes already-owned bees", () => {
  assert.deepStrictEqual(
    core.evaluateMilestones({ honeycombRankIndex: 6, questsCompleted: 2, ownedIds: ["regent"] }),
    ["monarch"]);
});

test("evaluateMilestones never returns discovery bees", () => {
  const ids = core.evaluateMilestones({ honeycombRankIndex: 6, questsCompleted: 9, ownedIds: [] });
  for (const id of ids) assert.strictEqual(core.getBee(id).source.startsWith("milestone:"), true);
});

test("every milestone key referenced by a bee has a predicate", () => {
  for (const b of core.BEES) {
    if (b.source.startsWith("milestone:")) {
      const key = b.source.slice("milestone:".length);
      assert.ok(core.MILESTONE_KEYS.includes(key), `missing predicate for ${key}`);
    }
  }
});

test("new milestone predicates evaluate at their boundaries", () => {
  const base = { ownedIds: [] };
  assert.deepStrictEqual(core.evaluateMilestones({ ...base, dailyStreak: 7 }), ["warden"]);
  assert.deepStrictEqual(core.evaluateMilestones({ ...base, dailyStreak: 6 }), []);
  assert.deepStrictEqual(core.evaluateMilestones({ ...base, difficultyTier: 2 }), ["artisan"]);
  assert.deepStrictEqual(core.evaluateMilestones({ ...base, difficultyTier: 4 }).sort(), ["artisan", "solstice"]);
  assert.deepStrictEqual(core.evaluateMilestones({ ...base, highestLevel: 500 }), ["luminary"]);
  assert.deepStrictEqual(core.evaluateMilestones({ ...base, highestLevel: 499 }), []);
});

test("allCommons milestone unlocks empress only when all 8 commons owned", () => {
  const commons = core.commonIds();
  assert.deepStrictEqual(core.evaluateMilestones({ ownedIds: commons }), ["empress"]);
  // Missing one common -> not unlocked
  assert.deepStrictEqual(core.evaluateMilestones({ ownedIds: commons.slice(1) }), []);
});

test("evaluateMilestones returns all 7 milestone bees for a maxed-out player", () => {
  const ctx = {
    ownedIds: core.commonIds(), // owns all commons (satisfies allCommons) but no milestone bees yet
    honeycombRankIndex: 6, questsCompleted: 1,
    dailyStreak: 7, difficultyTier: 4, highestLevel: 500
  };
  // All 7 milestone bees unlock at once (empress included via allCommons):
  assert.deepStrictEqual(
    core.evaluateMilestones(ctx).sort(),
    ["artisan", "empress", "luminary", "monarch", "regent", "solstice", "warden"]);
});
