# Dictionary Definitions Feature — Design Spec

**Date:** 2026-03-28
**Status:** Approved

## Overview

Add the ability to tap on a completed (found) word in the crossword grid to see its definition in a modal popup. Definitions are pre-generated and bundled as a cached data file, working fully offline.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Trigger | Tap on revealed cell | Most discoverable; no extra UI chrome needed |
| Intersection cells | Not tappable | Avoids ambiguity of which word was tapped; simplifies implementation |
| Data source | Pre-baked `definitions.json` | Works offline, zero runtime API calls, small cache footprint (~2-3 MB) |
| Definition generation | AI-generated via Claude | 100% coverage of casual-dict words including obscure ones; consistent tone; one-time effort using existing Max subscription |
| Modal style | Dark Glass | Matches existing WordPlay modal aesthetic |
| Content depth | Multiple numbered definitions with part of speech | Richer than single-line; similar to reference screenshot from competitor |

## Data Format

### Dictionary File: `wwwroot/data/definitions.json`

```json
{
  "SEDAN": { "p": "noun", "d": ["A closed automobile with a fixed roof and seating for four or more", "An enclosed chair carried on poles, used in the 17th-18th centuries"] },
  "OWN": { "p": "verb, adj", "d": ["To have rightful possession of", "To acknowledge or admit", "Belonging to oneself"] },
  "AIS": { "p": "noun", "d": ["Plural of ai, a three-toed sloth"] }
}
```

- Keys: uppercase words (matching game format)
- `p`: part(s) of speech, comma-separated if multiple
- `d`: array of 1-3 concise definitions (one sentence each, no examples or etymologies)
- Short key names to minimize file size
- Estimated size: ~2.5-3.5 MB uncompressed, ~1-1.5 MB gzipped

### Generation Tool: `tools/generate-definitions.js`

- Reads all words from `tools/casual-dict.txt` (~27K words)
- Outputs a JSON structure that Claude Code will populate during interactive sessions
- The script provides the word list; Claude generates definitions in batches of ~100 words, returning JSON that the script merges into the output file
- Resume capability: on restart, loads existing output and skips already-defined words
- Output: `wwwroot/data/definitions.json`
- No API key needed — runs within Claude Code sessions using existing Max subscription

## Service Worker & Loading

### Cache Strategy

- No `sw.js` code changes needed — the existing fetch handler already caches any request matching the `/data/` path prefix into `DATA_CACHE` with a cache-first strategy
- `definitions.json` is automatically handled the same way as level data chunks
- To force re-download after updating the file, bump the `?v=` query string in the fetch URL (e.g., `?v=1` to `?v=2`). Bumping `DATA_CACHE` version is only needed to clean up stale cache entries, not to trigger re-fetch.

### App Loading

- New global variable: `let DEFINITIONS = null;`
- Fetch `/data/definitions.json?v=1` at app startup, after level data loads (non-blocking)
- Parse into `DEFINITIONS` object for O(1) lookups by word
- Graceful degradation: if fetch fails (offline before first cache), `DEFINITIONS` stays null — taps show nothing

## Grid Interaction

### Cell Tap Detection

Build `cellWordCount` and `cellToWord` maps once per crossword change (level load or layout toggle), not on every `renderGrid()` call:

- `cellWordCount`: for each `"row,col"` key, how many placements use it
- `cellToWord`: for single-owner cells, which word owns them

In `renderGrid()`, when rendering a revealed cell (`isR = true`):

1. Check that the **owning word is in `state.foundWords`** — not just that the cell is revealed. A cell can be individually hinted (`state.revealedCells`) before the word is fully found; attaching a handler there would leak the word as a spoiler.
2. If the cell belongs to exactly one word AND that word is found → attach `onclick` calling `showDefinition(word)`, set `cursor: pointer`
3. If intersection cell, word not found, or `DEFINITIONS` is null → set `div.onclick = null` and `cursor: ""` (required for in-place DOM update cleanup)

### Guards

- Skip handler if `state.pickMode` is active (target hint mode owns taps)
- Skip if `DEFINITIONS` is null (data not loaded yet)

### Discoverability

- No special visual styling on tappable cells — users discover naturally by tapping found words

## Definition Modal

### Function: `showDefinition(word)`

1. Look up `DEFINITIONS[word]`
2. If not found → show toast "No definition available", return
3. Create/reuse modal overlay (`id="definition-modal"`)
4. Display Dark Glass modal:
   - Word as title in `theme.accent`, bold, letter-spaced
   - Inner frosted glass panel containing:
     - Part of speech in small uppercase muted text
     - Numbered definitions with accent-colored numbers
     - Scrollable inner panel if definitions overflow
   - Close button at bottom (gradient accent, matching existing modals)
5. Close via: Close button, X button, or tap outside modal

### Layout Compatibility

- Works identically in crossword and flow layouts (both use `crossword.placements`)
- Standalone coin words and regular words both tappable (same single-word-cell rule)

## Files Changed

| File | Change |
|------|--------|
| `tools/generate-definitions.js` | New — definition generation script |
| `wwwroot/data/definitions.json` | New — pre-baked dictionary data |
| `wwwroot/js/app.js` | Load definitions; cell word maps; click handlers on revealed cells; `showDefinition()` modal; `GUIDE_SECTIONS` entry |
| `wwwroot/css/app.css` | Definition modal styles (if needed beyond inline) |
| `wwwroot/sw.js` | Version bumps only |
| `wwwroot/index.html` | Version bump only |
| `README.md` | Document dictionary feature |

## Out of Scope

- Definitions for bonus words (only grid words are tappable)
- Pronunciation audio or phonetic spelling
- Word history or etymology
- Sharing definitions
- Definitions visible before word is found (no spoilers)
