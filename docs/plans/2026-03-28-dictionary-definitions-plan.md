# Dictionary Definitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let players tap found words in the grid to see their definitions in an offline-capable modal.

**Architecture:** A pre-baked `definitions.json` file (~27K words) is loaded at startup into a global `DEFINITIONS` object. Non-intersection revealed cells get click handlers that open a themed modal. The file is cached by the existing service worker `/data/` handler.

**Tech Stack:** Vanilla JS, CSS, existing service worker DATA_CACHE

**Spec:** `docs/plans/2026-03-28-dictionary-definitions-design.md`

---

### Task 1: Create the definition generation tool

**Files:**
- Create: `tools/generate-definitions.js`

This tool reads the casual dictionary and outputs a scaffold JSON that Claude Code will populate with definitions in batches.

- [ ] **Step 1: Write the generation tool**

```javascript
// tools/generate-definitions.js
// Usage: node generate-definitions.js
//
// Reads casual-dict.txt and creates/updates definitions.json.
// Outputs the word list in batches for Claude to define.
// Resume-safe: skips words already in the output file.

const fs = require('fs');
const path = require('path');

const DICT_PATH = path.join(__dirname, 'casual-dict.txt');
const OUT_PATH = path.join(__dirname, '..', 'WordPlay', 'wwwroot', 'data', 'definitions.json');
const BATCH_SIZE = 100;

// Load existing definitions (resume support)
let definitions = {};
if (fs.existsSync(OUT_PATH)) {
    definitions = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
    console.log(`Loaded ${Object.keys(definitions).length} existing definitions.`);
}

// Load word list
const words = fs.readFileSync(DICT_PATH, 'utf8')
    .split('\n')
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length > 0);

console.log(`Dictionary has ${words.length} words.`);

// Find words still needing definitions
const remaining = words.filter(w => !definitions[w]);
console.log(`${remaining.length} words still need definitions.`);

if (remaining.length === 0) {
    console.log('All words defined! Nothing to do.');
    process.exit(0);
}

// Output batches for Claude to process
const batches = [];
for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    batches.push(remaining.slice(i, i + BATCH_SIZE));
}
console.log(`${batches.length} batches of ~${BATCH_SIZE} words remaining.`);
console.log('\nNext batch of words to define:');
console.log(JSON.stringify(batches[0]));

// Save helper: merge new definitions into file
// Called after Claude provides a batch of definitions
function saveBatch(newDefs) {
    Object.assign(definitions, newDefs);
    fs.writeFileSync(OUT_PATH, JSON.stringify(definitions, null, 0));
    console.log(`Saved. Total: ${Object.keys(definitions).length} / ${words.length}`);
}

// Export for use in interactive sessions
if (typeof module !== 'undefined') {
    module.exports = { definitions, remaining, batches, saveBatch, OUT_PATH };
}
```

- [ ] **Step 2: Verify the tool runs and shows the first batch**

Run: `cd D:\Projects\Repos\WordPlay && node tools/generate-definitions.js`

Expected: Output showing word count, remaining count, and first batch of ~100 words as JSON array.

- [ ] **Step 3: Commit**

```bash
git add tools/generate-definitions.js
git commit -m "feat: add dictionary definition generation tool"
```

---

### Task 2: Generate definitions data (interactive Claude sessions)

**Files:**
- Create: `WordPlay/wwwroot/data/definitions.json`

This task runs interactively across Claude Code turns. For each batch of ~100 words, Claude generates definitions and the results are merged into the output file.

- [ ] **Step 1: Generate definitions in batches**

For each batch, Claude should:
1. Run `node tools/generate-definitions.js` to see the next batch
2. Generate definitions for those words in this JSON format:
   ```json
   {"WORD": {"p": "noun", "d": ["First definition", "Second definition"]}}
   ```
   Rules for definitions:
   - `p`: part(s) of speech, comma-separated (e.g., "noun, verb")
   - `d`: array of 1-3 concise definitions, one sentence each
   - No examples, etymology, or pronunciation
   - Keep definitions brief but accurate
3. Merge into definitions.json using the tool's saveBatch or by direct file write
4. Repeat until all words are defined

- [ ] **Step 2: Verify completeness**

Run: `node -e "const d=require('./WordPlay/wwwroot/data/definitions.json'); console.log('Total definitions:', Object.keys(d).length)"`

Expected: ~27,537 definitions.

- [ ] **Step 3: Check file size**

Run: `ls -la WordPlay/wwwroot/data/definitions.json` and check gzip size with `gzip -c WordPlay/wwwroot/data/definitions.json | wc -c`

Expected: ~2-4 MB raw, ~1-2 MB gzipped.

- [ ] **Step 4: Commit**

```bash
git add WordPlay/wwwroot/data/definitions.json
git commit -m "feat: add pre-baked dictionary definitions for ~27K words"
```

---

### Task 3: Load definitions at app startup

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:339` (globals), `app.js:7257` (init)

- [ ] **Step 1: Add the global variable**

At `app.js:340`, after the `standaloneWord` declaration, add:

```javascript
let DEFINITIONS = null;
```

- [ ] **Step 2: Add the loader function**

Before the `init()` function (around line 7215), add:

```javascript
async function loadDefinitions() {
    try {
        const resp = await fetch('/data/definitions.json?v=1');
        if (resp.ok) DEFINITIONS = await resp.json();
    } catch (e) { /* offline before first cache — definitions unavailable */ }
}
```

- [ ] **Step 3: Call it from init(), non-blocking**

At `app.js:7257`, after `await recompute();` and before `restoreLevelState();`, add:

```javascript
    loadDefinitions(); // non-blocking, no await — definitions load in background
```

- [ ] **Step 4: Verify definitions load**

Open the app in browser, open DevTools console, wait a moment, then type `DEFINITIONS` — should show the dictionary object. If offline (no cache yet), should be `null`.

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: load definitions.json at startup"
```

---

### Task 4: Build cell-to-word maps

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:339` (globals), `app.js:430` (after placedWords set in recompute), `app.js:752` (after placedWords set in toggleLayout)

- [ ] **Step 1: Add map globals**

At `app.js:339`, extend the globals line or add after it:

```javascript
let _cellWordCount = {};  // "row,col" → number of words using this cell
let _cellToWord = {};     // "row,col" → word (only for cells owned by exactly 1 word)
```

- [ ] **Step 2: Add the map builder function**

After the new globals, add:

```javascript
function buildCellWordMaps() {
    _cellWordCount = {};
    _cellToWord = {};
    if (!crossword) return;
    for (const p of crossword.placements) {
        for (const c of p.cells) {
            const k = c.row + "," + c.col;
            _cellWordCount[k] = (_cellWordCount[k] || 0) + 1;
            _cellToWord[k] = p.word; // overwritten if >1 word, but we only use it when count===1
        }
    }
    // Clear cellToWord for intersections
    for (const k in _cellWordCount) {
        if (_cellWordCount[k] > 1) delete _cellToWord[k];
    }
}
```

- [ ] **Step 3: Call after placedWords is set in recompute()**

In `recompute()`, at `app.js:430` (after `placedWords = crossword.placements.map(p => p.word);`), add:

```javascript
    buildCellWordMaps();
```

- [ ] **Step 4: Call after placedWords is set in toggleLayout()**

In `toggleLayout()`, at `app.js:752` (after `placedWords = crossword.placements.map(p => p.word);`), add:

```javascript
    buildCellWordMaps();
```

- [ ] **Step 5: Verify in console**

Load a level, open DevTools, type `_cellToWord` — should show a map of "row,col" → word strings, with intersection cells absent.

- [ ] **Step 6: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: build cell-to-word maps for definition lookup"
```

---

### Task 5: Add click handlers to revealed cells

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:2798-2803` (revealed cell branch in renderGrid)

- [ ] **Step 1: Replace the revealed cell branch**

Replace the block at lines 2798-2803:

```javascript
            } else if (isR) {
                div.style.background = theme.accent;
                div.style.border = "none";
                div.style.color = "#fff";
                div.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";
                div.textContent = cell;
```

With:

```javascript
            } else if (isR) {
                div.style.background = theme.accent;
                div.style.border = "none";
                div.style.color = "#fff";
                div.style.textShadow = "0 1px 2px rgba(0,0,0,0.3)";
                div.textContent = cell;
                // Definition tap: non-intersection cells of fully found words
                const defWord = _cellToWord[k];
                if (defWord && !state.pickMode && DEFINITIONS && state.foundWords.includes(defWord)) {
                    div.style.cursor = "pointer";
                    div.onclick = () => showDefinition(defWord);
                } else {
                    div.style.cursor = "";
                    div.onclick = null;
                }
```

Key guards:
- `_cellToWord[k]` — only cells belonging to exactly one word (no intersections)
- `!state.pickMode` — target hint mode takes priority
- `DEFINITIONS` — data must be loaded
- `state.foundWords.includes(defWord)` — prevents spoilers from individually hinted cells

- [ ] **Step 2: Visual test**

Load a level, find a word. Tap a non-intersection letter of that word — nothing should happen yet (showDefinition doesn't exist). But the cursor should change to pointer on hover (desktop). Intersection cells should have no pointer cursor.

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add definition click handlers to revealed grid cells"
```

---

### Task 6: Create the definition modal

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add showDefinition function before renderGrid)

- [ ] **Step 1: Add the showDefinition function**

Add this function before `renderGrid()` (around line 2655):

```javascript
function showDefinition(word) {
    if (!DEFINITIONS) return;
    const entry = DEFINITIONS[word];
    if (!entry) {
        showToast("No definition available", "rgba(255,255,255,0.5)", true);
        return;
    }
    let overlay = document.getElementById("definition-modal");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "definition-modal";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";

    const defsHtml = entry.d.map((def, i) =>
        `<div class="def-entry"><span class="def-num" style="color:${theme.accent}">${i + 1}.</span> ${def}</div>`
    ).join("");

    overlay.innerHTML = `
        <div class="modal-box def-modal-box">
            <div class="def-close" id="def-close-x">&times;</div>
            <div class="def-title" style="color:${theme.accent}">${word}</div>
            <div class="def-panel">
                <div class="def-pos">${entry.p}</div>
                ${defsHtml}
            </div>
            <button class="modal-next-btn" id="def-close-btn"
                style="background:linear-gradient(180deg,${theme.accent},${theme.accent}bb);border:2px solid ${theme.accent};box-shadow:0 4px 14px ${theme.accent}60,inset 0 1px 1px rgba(255,255,255,0.4);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.3);margin-top:16px">
                Close
            </button>
        </div>
    `;

    const close = () => { overlay.style.display = "none"; };
    document.getElementById("def-close-btn").onclick = close;
    document.getElementById("def-close-x").onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
}
```

- [ ] **Step 2: Add CSS styles**

Add to `WordPlay/wwwroot/css/app.css`, at the end of the modal styles section (after `.modal-box`):

```css
/* Definition modal */
.def-modal-box { position: relative; max-width: 320px; }
.def-close { position: absolute; top: 12px; right: 16px; color: rgba(255,255,255,0.4); font-size: 24px; cursor: pointer; line-height: 1; }
.def-close:hover { color: rgba(255,255,255,0.7); }
.def-title { font-size: 26px; font-weight: 800; letter-spacing: 2px; text-align: center; margin-bottom: 16px; }
.def-panel { background: rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; max-height: 45vh; overflow-y: auto; text-align: left; }
.def-pos { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.7); margin-bottom: 10px; }
.def-entry { font-size: 15px; line-height: 1.55; color: #e8e0f0; margin-bottom: 10px; }
.def-entry:last-child { margin-bottom: 0; }
.def-num { font-weight: 700; margin-right: 4px; }
```

- [ ] **Step 3: End-to-end test**

Load a level, find a word. Tap a non-intersection cell of a found word. The definition modal should appear with the word title, part of speech, and numbered definitions. Test:
- Close via Close button
- Close via X
- Close via tap outside
- Intersection cells should NOT open the modal
- Unfound word cells (even if hinted) should NOT open the modal
- Pick mode (target hint) should NOT trigger definition

- [ ] **Step 4: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: add definition modal with dark glass styling"
```

---

### Task 7: Update guide and docs

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:6444` (GUIDE_SECTIONS)
- Modify: `README.md`

- [ ] **Step 1: Add guide section**

In `GUIDE_SECTIONS` array (around line 6444), add a new entry after the "Grid Layouts" entry:

```javascript
    { icon: "\uD83D\uDCD6", title: "Word Definitions", body: "Curious about a word? Tap any found word in the grid to see its definition! A popup shows the part of speech and meaning. Only non-intersecting letters are tappable \u2014 look for cells that belong to just one word." },
```

- [ ] **Step 2: Update README.md**

Add a brief mention of the dictionary feature in the appropriate section of README.md.

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js README.md
git commit -m "docs: add dictionary feature to guide and README"
```

---

### Task 8: Version bump and final verification

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:5` (APP_VERSION)
- Modify: `WordPlay/wwwroot/sw.js:1` (CACHE_NAME)
- Modify: `WordPlay/wwwroot/sw.js` and `WordPlay/wwwroot/index.html` (?v= query strings)

- [ ] **Step 1: Bump versions**

- `APP_VERSION` in `app.js` line 5: increment (e.g., "1.4.4" → "1.4.5" or as appropriate)
- `CACHE_NAME` in `sw.js` line 1: increment (e.g., "wordplay-v105" → "wordplay-v106")
- `?v=` in `sw.js` ASSETS array: increment all (e.g., `?v=55` → `?v=56`)
- `?v=` in `index.html` script/link tags: increment all to match sw.js

- [ ] **Step 2: Full end-to-end verification**

1. Clear browser cache / use incognito
2. Load the app — definitions.json should load (check Network tab)
3. Play a level, find a word
4. Tap a non-intersection cell → definition modal appears
5. Verify modal styling matches Dark Glass design
6. Verify intersection cells are not tappable
7. Verify hinted-but-not-found cells are not tappable
8. Verify pick mode overrides definition taps
9. Go offline (DevTools → Network → Offline), reload → definitions still work from cache
10. Check the Player Guide → "Word Definitions" section appears

- [ ] **Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html
git commit -m "chore: bump version for dictionary definitions feature"
```
