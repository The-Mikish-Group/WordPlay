const test = require("node:test");
const assert = require("node:assert");
const core = require("../WordPlay/wwwroot/js/bee-core.js");
const prompts = require("../tools/bee-prompts.json");

test("every registry bee has a prompt, and every prompt maps to a bee", () => {
  const ids = core.BEES.map(b => b.id).sort();
  const keys = Object.keys(prompts).sort();
  assert.deepStrictEqual(keys, ids);
});

test("every prompt has a non-empty desc and palette", () => {
  for (const k of Object.keys(prompts)) {
    assert.ok(prompts[k].desc && prompts[k].desc.length > 0, k + " desc");
    assert.ok(prompts[k].palette && prompts[k].palette.length > 0, k + " palette");
  }
});
