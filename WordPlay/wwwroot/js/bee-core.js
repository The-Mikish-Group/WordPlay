// ============================================================
// WordPlay — Bee Collection ("Active Hive") pure logic. No DOM.
// Dual export: window.HiveCore (browser) + module.exports (Node tests).
// ============================================================
(function (global) {
  "use strict";

  var MAX_ACTIVE = 3;

  // Starter registry (Plan 2A). Expanded to ~30 in Plan 2B.
  // perk.type ∈ coinPerWord | honeyPerGoal | honeycombCoins | dailyHint
  // source: "discovery" | "milestone:<key>"
  var BEES = [
    { id: "worker",   name: "Worker Bee",   tier: "common",    perk: { type: "coinPerWord",    value: 1 }, flavor: "The tireless backbone of the hive.",        source: "discovery" },
    { id: "forager",  name: "Forager Bee",  tier: "common",    perk: { type: "honeyPerGoal",    value: 1 }, flavor: "Always returns with a little extra honey.",   source: "discovery" },
    { id: "scout",    name: "Scout Bee",    tier: "uncommon",  perk: { type: "honeycombCoins",  value: 2 }, flavor: "First to find the sweetest words.",           source: "discovery" },
    { id: "nurse",    name: "Nurse Bee",    tier: "uncommon",  perk: { type: "dailyHint",       value: 1 }, flavor: "Tends the brood and lends a daily hand.",     source: "discovery" },
    { id: "drone",    name: "Drone Bee",    tier: "rare",      perk: { type: "coinPerWord",     value: 2 }, flavor: "Lazy, but lucky with coin.",                  source: "discovery" },
    { id: "sentinel", name: "Sentinel Bee", tier: "rare",      perk: { type: "honeyPerGoal",    value: 2 }, flavor: "Guards the hive and hoards the honey.",       source: "discovery" },
    { id: "regent",   name: "Regent Bee",   tier: "epic",      perk: { type: "honeycombCoins",  value: 5 }, flavor: "Rewards a true Honeycomb champion.",          source: "milestone:honeycombQueen" },
    { id: "monarch",  name: "Monarch Bee",  tier: "legendary", perk: { type: "coinPerWord",     value: 3 }, flavor: "Crowned for completing a whole Quest.",       source: "milestone:questComplete" }
  ];

  var _byId = {};
  for (var i = 0; i < BEES.length; i++) _byId[BEES[i].id] = BEES[i];

  function getBee(id) { return _byId[id] || null; }

  var api = {
    MAX_ACTIVE: MAX_ACTIVE,
    BEES: BEES,
    getBee: getBee
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HiveCore = api;
})(typeof window !== "undefined" ? window : globalThis);
