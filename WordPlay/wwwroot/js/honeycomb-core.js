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

  var api = { scoreWord: scoreWord };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.HoneycombCore = api;
})(typeof window !== "undefined" ? window : globalThis);
