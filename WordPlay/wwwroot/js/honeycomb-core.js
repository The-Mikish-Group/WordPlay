// ============================================================
// WordPlay — Honeycomb pure logic (no DOM).
// Dual export: window.HoneycombCore (browser) + module.exports (Node tests).
// ============================================================
(function (global) {
  "use strict";

  // Rank ladder: each rank is a fraction of the puzzle's maxScore.
  var RANKS = [
    { name: "Worker",    pct: 0.00 },
    { name: "Forager",   pct: 0.10 },
    { name: "Builder",   pct: 0.20 },
    { name: "Drone",     pct: 0.35 },
    { name: "Keeper",    pct: 0.50 },
    { name: "Royal",     pct: 0.70 },
    { name: "Queen Bee", pct: 0.90 }
  ];

  // Reward paid the first time each rank index is reached, once per day. Tunable.
  var RANK_REWARDS = [
    {},                       // 0 Worker
    { coins: 3 },             // 1 Forager
    { coins: 5 },             // 2 Builder
    { coins: 8 },             // 3 Drone
    { coins: 12 },            // 4 Keeper
    { coins: 15, jars: 10 },  // 5 Royal
    { coins: 25, jars: 20 }   // 6 Queen Bee
  ];

  function scoreWord(word, letters) {
    var w = String(word).toUpperCase();
    var base = w.length === 4 ? 1 : w.length;
    var distinct = {};
    for (var i = 0; i < w.length; i++) distinct[w[i]] = true;
    var L = String(letters).toUpperCase();
    var pangram = true;
    for (var j = 0; j < L.length; j++) {
      if (!distinct[L[j]]) { pangram = false; break; }
    }
    if (pangram) base += 7;
    return base;
  }

  function isPangram(word, letters) {
    var w = String(word).toUpperCase();
    var L = String(letters).toUpperCase();
    var d = {};
    for (var i = 0; i < w.length; i++) d[w[i]] = true;
    for (var j = 0; j < L.length; j++) if (!d[L[j]]) return false;
    return true;
  }

  // puzzle: { letters, center, wordSet: Set<UPPERCASE word> }
  function validateWord(word, puzzle) {
    var w = String(word).toUpperCase();
    if (w.length < 4) return { ok: false, reason: "short" };
    var center = String(puzzle.center).toUpperCase();
    if (w.indexOf(center) === -1) return { ok: false, reason: "center" };
    var allowed = {};
    var L = String(puzzle.letters).toUpperCase();
    for (var i = 0; i < L.length; i++) allowed[L[i]] = true;
    for (var k = 0; k < w.length; k++) if (!allowed[w[k]]) return { ok: false, reason: "badletter" };
    if (!puzzle.wordSet.has(w)) return { ok: false, reason: "notword" };
    return { ok: true };
  }

  function rankThresholds(maxScore) {
    return RANKS.map(function (r) {
      return { name: r.name, at: Math.ceil(maxScore * r.pct) };
    });
  }

  function currentRankIndex(score, maxScore) {
    var t = rankThresholds(maxScore), idx = 0;
    for (var i = 0; i < t.length; i++) if (score >= t[i].at) idx = i;
    return idx;
  }

  function ringPct(score, maxScore) {
    var t = rankThresholds(maxScore);
    var queen = t[t.length - 1].at;
    if (queen <= 0) return 0;
    return Math.min(100, Math.round((score / queen) * 100));
  }

  function newlyReachedRanks(score, maxScore, claimed) {
    claimed = claimed || [];
    var cur = currentRankIndex(score, maxScore);
    var out = [];
    for (var i = 1; i <= cur; i++) if (claimed.indexOf(i) === -1) out.push(i);
    return out;
  }

  function rewardForRank(index) {
    return RANK_REWARDS[index] || {};
  }

  var api = {
    RANKS: RANKS,
    RANK_REWARDS: RANK_REWARDS,
    scoreWord: scoreWord,
    isPangram: isPangram,
    validateWord: validateWord,
    rankThresholds: rankThresholds,
    currentRankIndex: currentRankIndex,
    ringPct: ringPct,
    newlyReachedRanks: newlyReachedRanks,
    rewardForRank: rewardForRank
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HoneycombCore = api;
})(typeof window !== "undefined" ? window : globalThis);
