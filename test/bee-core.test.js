const test = require("node:test");
const assert = require("node:assert");
const core = require("../WordPlay/wwwroot/js/bee-core.js");

test("BEES registry has the 8 starter bees with required fields", () => {
  assert.strictEqual(core.BEES.length, 8);
  for (const b of core.BEES) {
    assert.ok(b.id && typeof b.id === "string");
    assert.ok(b.name && typeof b.name === "string");
    assert.ok(["common","uncommon","rare","epic","legendary"].includes(b.tier));
    assert.ok(["coinPerWord","honeyPerGoal","honeycombCoins","dailyHint"].includes(b.perk.type));
    assert.ok(Number.isFinite(b.perk.value));
    assert.ok(typeof b.flavor === "string" && b.flavor.length > 0);
    assert.ok(b.source === "discovery" || b.source.startsWith("milestone:"));
  }
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
