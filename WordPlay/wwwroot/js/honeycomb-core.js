// ============================================================
// WordPlay — Honeycomb pure logic (no DOM).
// Dual export: window.HoneycombCore (browser) + module.exports (Node tests).
// ============================================================
(function (global) {
  "use strict";

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

  var api = {
    scoreWord: scoreWord,
    isPangram: isPangram,
    validateWord: validateWord
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HoneycombCore = api;
})(typeof window !== "undefined" ? window : globalThis);
