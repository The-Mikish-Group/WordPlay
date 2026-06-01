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
    // Common (8) — discovery, value 1
    { id: "worker",    name: "Worker Bee",    tier: "common",    perk: { type: "coinPerWord",   value: 1 }, flavor: "The tireless backbone of the hive.",            source: "discovery" },
    { id: "forager",   name: "Forager Bee",   tier: "common",    perk: { type: "honeyPerGoal",  value: 1 }, flavor: "Always returns with a little extra honey.",       source: "discovery" },
    { id: "gleaner",   name: "Gleaner Bee",   tier: "common",    perk: { type: "coinPerWord",   value: 1 }, flavor: "Never leaves a single crumb of nectar behind.",    source: "discovery" },
    { id: "clover",    name: "Clover Bee",    tier: "common",    perk: { type: "honeyPerGoal",  value: 1 }, flavor: "Happiest in a field of lucky clover.",            source: "discovery" },
    { id: "dewdrop",   name: "Dewdrop Bee",   tier: "common",    perk: { type: "honeycombCoins",value: 1 }, flavor: "Sips the morning dew before anyone wakes.",        source: "discovery" },
    { id: "sprig",     name: "Sprig Bee",     tier: "common",    perk: { type: "honeycombCoins",value: 1 }, flavor: "A sprightly youngster, quick to the comb.",        source: "discovery" },
    { id: "pollen",    name: "Pollen Bee",    tier: "common",    perk: { type: "coinPerWord",   value: 1 }, flavor: "Dusted head to toe in golden pollen.",            source: "discovery" },
    { id: "blossom",   name: "Blossom Bee",   tier: "common",    perk: { type: "honeyPerGoal",  value: 1 }, flavor: "Drawn to the very first blossom of spring.",       source: "discovery" },
    // Uncommon (8) — discovery, value 2 (+ dailyHint)
    { id: "scout",     name: "Scout Bee",     tier: "uncommon",  perk: { type: "honeycombCoins",value: 2 }, flavor: "First to find the sweetest words.",               source: "discovery" },
    { id: "nurse",     name: "Nurse Bee",     tier: "uncommon",  perk: { type: "dailyHint",     value: 1 }, flavor: "Tends the brood and lends a daily hand.",         source: "discovery" },
    { id: "dancer",    name: "Dancer Bee",    tier: "uncommon",  perk: { type: "coinPerWord",   value: 2 }, flavor: "Waggles directions to the richest flowers.",      source: "discovery" },
    { id: "gardener",  name: "Gardener Bee",  tier: "uncommon",  perk: { type: "honeyPerGoal",  value: 2 }, flavor: "Tends a secret garden behind the hive.",          source: "discovery" },
    { id: "thistle",   name: "Thistle Bee",   tier: "uncommon",  perk: { type: "honeycombCoins",value: 2 }, flavor: "Thrives where the prickly thistles grow.",        source: "discovery" },
    { id: "lavender",  name: "Lavender Bee",  tier: "uncommon",  perk: { type: "honeyPerGoal",  value: 2 }, flavor: "Carries the calming scent of lavender fields.",   source: "discovery" },
    { id: "sunflower", name: "Sunflower Bee", tier: "uncommon",  perk: { type: "coinPerWord",   value: 2 }, flavor: "Turns to follow the sun all day long.",           source: "discovery" },
    { id: "bramble",   name: "Bramble Bee",   tier: "uncommon",  perk: { type: "honeycombCoins",value: 2 }, flavor: "At home in the tangled bramble hedge.",           source: "discovery" },
    // Rare (7) — discovery, value 2–3
    { id: "drone",     name: "Drone Bee",     tier: "rare",      perk: { type: "coinPerWord",   value: 2 }, flavor: "Lazy, but lucky with coin.",                      source: "discovery" },
    { id: "sentinel",  name: "Sentinel Bee",  tier: "rare",      perk: { type: "honeyPerGoal",  value: 2 }, flavor: "Guards the hive and hoards the honey.",           source: "discovery" },
    { id: "amber",     name: "Amber Bee",     tier: "rare",      perk: { type: "coinPerWord",   value: 3 }, flavor: "Wings the warm gold of fossilized amber.",        source: "discovery" },
    { id: "nectarine", name: "Nectarine Bee", tier: "rare",      perk: { type: "honeyPerGoal",  value: 3 }, flavor: "Sweetest forager in all the orchard.",            source: "discovery" },
    { id: "honeydew",  name: "Honeydew Bee",  tier: "rare",      perk: { type: "honeycombCoins",value: 3 }, flavor: "Glistens with a coat of sticky honeydew.",        source: "discovery" },
    { id: "dusk",      name: "Dusk Bee",      tier: "rare",      perk: { type: "dailyHint",     value: 1 }, flavor: "Forages by twilight when others rest.",           source: "discovery" },
    { id: "marigold",  name: "Marigold Bee",  tier: "rare",      perk: { type: "coinPerWord",   value: 3 }, flavor: "Blazes bright as a marigold in bloom.",           source: "discovery" },
    // Epic (4) — milestone
    { id: "regent",    name: "Regent Bee",    tier: "epic",      perk: { type: "honeycombCoins",value: 5 }, flavor: "Rewards a true Honeycomb champion.",              source: "milestone:honeycombQueen" },
    { id: "warden",    name: "Warden Bee",    tier: "epic",      perk: { type: "honeyPerGoal",  value: 4 }, flavor: "Keeps the hive's watch, day after faithful day.",  source: "milestone:dailyStreak7" },
    { id: "artisan",   name: "Artisan Bee",   tier: "epic",      perk: { type: "honeycombCoins",value: 5 }, flavor: "Crafts comb of impossible precision.",            source: "milestone:tierHard" },
    { id: "luminary",  name: "Luminary Bee",  tier: "epic",      perk: { type: "coinPerWord",   value: 4 }, flavor: "A legend whispered across five hundred meadows.",  source: "milestone:reachLevel500" },
    // Legendary (3) — milestone
    { id: "monarch",   name: "Monarch Bee",   tier: "legendary", perk: { type: "coinPerWord",   value: 3 }, flavor: "Crowned for completing a whole Quest.",           source: "milestone:questComplete" },
    { id: "empress",   name: "Empress Bee",   tier: "legendary", perk: { type: "honeyPerGoal",  value: 5 }, flavor: "Beloved ruler of a hive made whole.",             source: "milestone:allCommons" },
    { id: "solstice",  name: "Solstice Bee",  tier: "legendary", perk: { type: "honeycombCoins",value: 8 }, flavor: "The ancient golden bee of the longest day.",      source: "milestone:tierMaster" }
  ];

  var _byId = {};
  for (var i = 0; i < BEES.length; i++) _byId[BEES[i].id] = BEES[i];

  function getBee(id) { return _byId[id] || null; }

  var PERK_TYPES = ["coinPerWord", "honeyPerGoal", "honeycombCoins", "dailyHint"];

  function activePerks(activeIds) {
    var out = {};
    for (var t = 0; t < PERK_TYPES.length; t++) out[PERK_TYPES[t]] = 0;
    if (!activeIds) return out;
    var limit = Math.min(activeIds.length, MAX_ACTIVE);
    for (var i = 0; i < limit; i++) {
      var bee = getBee(activeIds[i]);
      if (!bee) continue;
      out[bee.perk.type] = (out[bee.perk.type] || 0) + bee.perk.value;
    }
    return out;
  }

  function canEquip(hive, id) {
    if (!hive) return false;
    var bees = hive.bees || [];
    var active = hive.active || [];
    if (bees.indexOf(id) === -1) return false;       // must own it
    if (active.indexOf(id) !== -1) return false;      // not already active
    if (active.length >= MAX_ACTIVE) return false;    // hive full
    return true;
  }

  var TIER_WEIGHT = { common: 100, uncommon: 45, rare: 18, epic: 6, legendary: 2 };

  function tierWeight(tier) { return TIER_WEIGHT[tier] || 1; }

  function discoveryPool() {
    var out = [];
    for (var i = 0; i < BEES.length; i++) if (BEES[i].source === "discovery") out.push(BEES[i].id);
    return out;
  }

  // Weighted pick from discoveryPool minus ownedIds. rng() -> [0,1). Null if exhausted.
  function pickDiscovery(ownedIds, rng) {
    ownedIds = ownedIds || [];
    var candidates = [];
    var total = 0;
    var pool = discoveryPool();
    for (var i = 0; i < pool.length; i++) {
      if (ownedIds.indexOf(pool[i]) !== -1) continue;
      var w = tierWeight(getBee(pool[i]).tier);
      candidates.push({ id: pool[i], w: w });
      total += w;
    }
    if (candidates.length === 0) return null;
    var r = (rng ? rng() : 0.5) * total;
    for (var j = 0; j < candidates.length; j++) {
      r -= candidates[j].w;
      if (r < 0) return candidates[j].id;
    }
    return candidates[candidates.length - 1].id;
  }

  // Milestone predicates. context is a plain facts object supplied by the DOM layer.
  var MILESTONE_PREDICATES = {
    honeycombQueen: function (ctx) { return (ctx.honeycombRankIndex || 0) >= 6; },
    questComplete:  function (ctx) { return (ctx.questsCompleted || 0) >= 1; },
    dailyStreak7:   function (ctx) { return (ctx.dailyStreak || 0) >= 7; },
    tierHard:       function (ctx) { return (ctx.difficultyTier || 0) >= 2; },
    tierMaster:     function (ctx) { return (ctx.difficultyTier || 0) >= 4; },
    reachLevel500:  function (ctx) { return (ctx.highestLevel || 0) >= 500; },
    allCommons:     function (ctx) {
      var owned = ctx.ownedIds || [];
      var commons = commonIds();
      for (var i = 0; i < commons.length; i++) if (owned.indexOf(commons[i]) === -1) return false;
      return true;
    }
  };
  var MILESTONE_KEYS = Object.keys(MILESTONE_PREDICATES);

  function evaluateMilestones(context) {
    context = context || {};
    var owned = context.ownedIds || [];
    var out = [];
    for (var i = 0; i < BEES.length; i++) {
      var b = BEES[i];
      if (b.source.indexOf("milestone:") !== 0) continue;
      if (owned.indexOf(b.id) !== -1) continue;
      var key = b.source.slice("milestone:".length);
      var pred = MILESTONE_PREDICATES[key];
      if (pred && pred(context)) out.push(b.id);
    }
    return out;
  }

  function commonIds() {
    var out = [];
    for (var i = 0; i < BEES.length; i++) if (BEES[i].tier === "common") out.push(BEES[i].id);
    return out;
  }

  var api = {
    MAX_ACTIVE: MAX_ACTIVE,
    BEES: BEES,
    getBee: getBee,
    activePerks: activePerks,
    canEquip: canEquip,
    PERK_TYPES: PERK_TYPES,
    tierWeight: tierWeight,
    discoveryPool: discoveryPool,
    pickDiscovery: pickDiscovery,
    evaluateMilestones: evaluateMilestones,
    MILESTONE_KEYS: MILESTONE_KEYS,
    commonIds: commonIds
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HiveCore = api;
})(typeof window !== "undefined" ? window : globalThis);
