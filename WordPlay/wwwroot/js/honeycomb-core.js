// ============================================================
// WordPlay — Honeycomb pure logic (no DOM).
// Dual export: window.HoneycombCore (browser) + module.exports (Node tests).
// ============================================================
(function (global) {
  "use strict";

  // Rank ladder. Progress is measured by WORDS FOUND toward a fixed target
  // (HIVE_TARGET), NOT by score fraction. Score-fraction made completion feel
  // unreachable: a 4-letter word is 1 point but a pangram is 14, so finding
  // many short words barely moved the bar. Word-count is what players actually
  // perceive ("after 12 words I'm done"). The 7 ranks are spread evenly across
  // the target, so you rank up every couple of words and Queen Bee == the
  // target == 100% == a completed hive. Points/pangram bonus still drive coins.
  var RANKS = [
    { name: "Worker"    },
    { name: "Forager"   },
    { name: "Builder"   },
    { name: "Drone"     },
    { name: "Keeper"    },
    { name: "Royal"     },
    { name: "Queen Bee" }
  ];

  // Words needed to fill the hive (reach Queen Bee / 100%). A puzzle with fewer
  // answers than this completes when all are found.
  var HIVE_TARGET = 12;
  function hiveTarget(wordCount) {
    return Math.min(HIVE_TARGET, wordCount || HIVE_TARGET);
  }

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

  // puzzle: { letters, center, wordSet: Set<UPPERCASE word>, bonusSet?: Set<UPPERCASE word> }
  // bonusSet holds real dictionary words that fit the hive but aren't scored answers,
  // so we can tell players "valid word, just not in today's hive" instead of a flat reject.
  function validateWord(word, puzzle) {
    var w = String(word).toUpperCase();
    if (w.length < 4) return { ok: false, reason: "short" };
    var center = String(puzzle.center).toUpperCase();
    if (w.indexOf(center) === -1) return { ok: false, reason: "center" };
    var allowed = {};
    var L = String(puzzle.letters).toUpperCase();
    for (var i = 0; i < L.length; i++) allowed[L[i]] = true;
    for (var k = 0; k < w.length; k++) if (!allowed[w[k]]) return { ok: false, reason: "badletter" };
    if (!puzzle.wordSet.has(w)) {
      if (puzzle.bonusSet && puzzle.bonusSet.has(w)) return { ok: false, reason: "unlisted" };
      return { ok: false, reason: "notword" };
    }
    return { ok: true };
  }

  // Evenly spread the 7 ranks across `target` words found: 0, target/6, ...,
  // target. `target` is a word-count goal (see hiveTarget), not a score.
  function rankThresholds(target) {
    var gaps = RANKS.length - 1;
    return RANKS.map(function (r, i) {
      return { name: r.name, at: Math.round((target * i) / gaps) };
    });
  }

  // `found` = words found so far; `target` = the hive's word goal.
  function currentRankIndex(found, target) {
    var t = rankThresholds(target), idx = 0;
    for (var i = 0; i < t.length; i++) if (found >= t[i].at) idx = i;
    return idx;
  }

  function ringPct(found, target) {
    var queen = rankThresholds(target)[RANKS.length - 1].at;
    if (queen <= 0) return 0;
    return Math.min(100, Math.round((found / queen) * 100));
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

  // djb2 string hash -> stable daily puzzle index.
  function pickDailyIndex(dateStr, poolLength) {
    if (!poolLength) return 0;
    var h = 5381;
    var s = String(dateStr);
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h % poolLength;
  }

  var api = {
    RANKS: RANKS,
    RANK_REWARDS: RANK_REWARDS,
    HIVE_TARGET: HIVE_TARGET,
    hiveTarget: hiveTarget,
    scoreWord: scoreWord,
    isPangram: isPangram,
    validateWord: validateWord,
    rankThresholds: rankThresholds,
    currentRankIndex: currentRankIndex,
    ringPct: ringPct,
    newlyReachedRanks: newlyReachedRanks,
    rewardForRank: rewardForRank,
    pickDailyIndex: pickDailyIndex
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HoneycombCore = api;
})(typeof window !== "undefined" ? window : globalThis);
