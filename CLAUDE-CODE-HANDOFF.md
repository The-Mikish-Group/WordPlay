# WordPlay PWA — Claude Code Phase 2 Handoff

## Status

Tasks 1 (ASP.NET Core wrapper) and 4 (PWA manifest/service worker) are **DONE** — the project runs in Visual Studio. The vanilla JS conversion from the React prototype is complete.

**Remaining tasks for Claude Code:**
- Task 2: Procedural level generation (expand to 200+ levels)
- Task 3: Full English dictionary for bonus word validation
- Task 5: Daily puzzle (optional)
- Generate PWA icons (open /generate-icons.html and save to wwwroot/icons/)

---

## Project Structure

```
WordPlay/
├── WordPlay.sln
├── README.md
├── WordPlay/
│   ├── WordPlay.csproj        (.NET 10 web SDK)
│   ├── Program.cs               (static file host)
│   ├── Properties/launchSettings.json
│   └── wwwroot/
│       ├── index.html
│       ├── generate-icons.html  (open once to create PWA icons)
│       ├── manifest.json
│       ├── sw.js
│       ├── css/app.css
│       ├── js/
│       │   ├── app.js           (main game — vanilla JS)
│       │   ├── levels.js        (60+ hand-curated levels)
│       │   └── crossword.js     (grid generator)
│       └── icons/               (empty — use generate-icons.html)
```

---

## Task 2: Procedural Level Generation

Expand from 60 to 200+ levels. Create a build script that generates levels from a dictionary.

### Algorithm

1. Load dictionary (3-7 letter words only, common words preferred)
2. For each level:
   a. Pick a "seed word" (longer = harder)
   b. Find all valid words using only the seed word's letters (respecting frequency)
   c. Select 3-8 required words + tag remaining as bonus
   d. Verify the crossword generator can place at least 80% of required words
   e. Assign to a themed pack based on difficulty tier
3. Output into levels.js format

### Difficulty Tiers

| Tier | Groups | Letters | Required Words | Level Range |
|------|--------|---------|---------------|-------------|
| 1 | Sunrise | 3-4 | 2-4 | 1-30 |
| 2 | Forest | 4-5 | 4-7 | 31-80 |
| 3 | Canyon | 5-6 | 5-9 | 81-150 |
| 4 | Sky | 6-7 | 7-16 | 151-200+ |

Keep the existing 60 hand-curated levels as-is (they're better quality). Add procedurally generated levels after them.

---

## Task 3: Full Dictionary for Bonus Word Validation

Add `wwwroot/js/dictionary.js` and `wwwroot/data/words.txt`.

```javascript
// dictionary.js
let DICTIONARY = null;

async function loadDictionary() {
    const resp = await fetch('/data/words.txt');
    const text = await resp.text();
    DICTIONARY = new Set(text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length >= 3));
}

function isValidWord(word) {
    return DICTIONARY && DICTIONARY.has(word.toUpperCase());
}

function isValidWithLetters(word, availableLetters) {
    const avail = {};
    for (const ch of availableLetters.toUpperCase()) avail[ch] = (avail[ch] || 0) + 1;
    for (const ch of word.toUpperCase()) {
        if (!avail[ch] || avail[ch] <= 0) return false;
        avail[ch]--;
    }
    return true;
}
```

Update `handleWord()` in app.js — after checking required words and curated bonus list, also check:
```javascript
if (isValidWord(w) && isValidWithLetters(w, level.letters)) {
    // award bonus coin
}
```

Dictionary file: one word per line, uppercase, 3-7 letters. Use TWL or SOWPODS Scrabble word list filtered to common words. Target ~30K-50K words.

Add `<script src="/js/dictionary.js"></script>` to index.html BEFORE levels.js. Call `loadDictionary()` at app startup.

---

## Task 5: Daily Puzzle (Optional)

Deterministic puzzle from today's date — same puzzle for everyone.

```javascript
function getDailyPuzzle() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const longWords = [...DICTIONARY].filter(w => w.length >= 5 && w.length <= 7);
    const seedWord = longWords[seed % longWords.length];
    // ... generate puzzle from seed word
}
```

Add a "Daily" button in the header. Track daily completion separately in localStorage.

---

## Crossword Generator — Rules to Preserve

The generator in crossword.js is the most complex piece. These rules are critical:

1. **New empty cells**: ALL perpendicular neighbors must be empty
2. **Intersection cells**: Must cross from opposite direction only
3. **No triple-stacking**: A cell used by H+V can't take a third word
4. **Bookend spaces**: Cell before and after each word must be empty
5. **Multi-pass**: Try 12+ orderings × 2 orientations, pick best result
6. **Scoring**: More intersections (+10 each), more central (−0.3 × distance)

---

## GitHub Setup

Create under `The-Mikish-Group` organization as `WordPlay` repository.
