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
