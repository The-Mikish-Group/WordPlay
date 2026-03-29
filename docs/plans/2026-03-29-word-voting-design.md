# Word Voting & Removal Feature — Design Spec

**Date:** 2026-03-29
**Status:** Approved

## Overview

Allow signed-in players to flag words they consider too hard, obscure, or inappropriate via the definition modal. Admins review flagged words in the admin panel and can ban words, which are then filtered out at runtime. Banned words are reversible (unban) without requiring level data file changes.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Who can vote | Signed-in users only | Prevents spam/duplicates, votes tied to user IDs |
| Vote mechanism | Simple flag toggle | Lowest friction; one tap in definition modal |
| Word removal | Runtime banned-words list | Reversible, no file rewrites, crossword regenerates dynamically |
| Banned list storage | Server DB + client localStorage (1hr TTL) | Authoritative server source, fast client lookups |
| Admin review location | Section in existing admin panel | Follows established patterns, no new navigation |
| Admin actions | Ban / Dismiss / Unban | Ban removes word; Dismiss clears votes; Unban restores word |

## Database Schema

### WordVotes Table

| Column | Type | Notes |
|--------|------|-------|
| Id | int (PK) | Auto-increment |
| Word | nvarchar(20) | Uppercase, indexed |
| UserId | int (FK → Users) | Who voted |
| CreatedAt | datetime | When they voted |

Unique constraint on (Word, UserId) — one vote per user per word.

### BannedWords Table

| Column | Type | Notes |
|--------|------|-------|
| Id | int (PK) | Auto-increment |
| Word | nvarchar(20) | Uppercase, unique indexed |
| BannedById | int (FK → Users) | Which admin banned it |
| BannedAt | datetime | When it was banned |

## API Endpoints

### Player Endpoints (require auth)

**`POST /api/word-votes`**
- Body: `{ "word": "ALDOLASE" }`
- Server normalizes word: `.Trim().ToUpperInvariant()`, validates 2-20 alpha characters only
- Creates a vote for the authenticated user
- Returns 200 if created, 409 if already voted

**`DELETE /api/word-votes/{word}`**
- Removes the authenticated user's vote for this word
- Returns 200 if removed, 404 if no vote existed

**`GET /api/word-votes/mine`**
- Returns array of words the authenticated user has voted for: `["ALDOLASE", "AMANITA"]`
- Called on app load after auth to populate client-side vote state

### Public Endpoint (no auth)

**`GET /api/banned-words`**
- Returns array of banned words: `["ALDOLASE", "CEREUS"]`
- Public, no auth required — all clients need this to filter levels

### Admin Endpoints (require admin role)

**`GET /api/admin/word-votes`**
- Returns aggregated vote data sorted by count descending:
  ```json
  [{ "word": "ALDOLASE", "votes": 7 }, { "word": "AMANITA", "votes": 4 }]
  ```

**`GET /api/admin/banned-words`**
- Returns banned words with metadata:
  ```json
  [{ "word": "ALDOLASE", "bannedAt": "2026-03-29T...", "bannedById": 1 }]
  ```

**`POST /api/admin/banned-words`**
- Body: `{ "word": "ALDOLASE" }`
- Adds word to BannedWords table, also deletes all votes for that word
- Returns 200

**`DELETE /api/admin/banned-words/{word}`**
- Removes word from BannedWords table (unban)
- Returns 200

**`DELETE /api/admin/word-votes/{word}`**
- Dismiss: deletes all votes for a word without banning
- Clears it from the review queue
- Returns 200

## Player Voting UX

### Definition Modal Changes

- Add a flag button between the definition panel and the Close button
- Styled as a subtle secondary button (not the accent gradient)
- States:
  - Not voted: "🚩 Flag for Review" — muted/outline style
  - Voted: "🚩 Flagged" — filled/highlighted style
- Tapping toggles the vote via API
- Only visible when `isSignedIn()` returns true

### Vote State Tracking

- On app load (after auth): call `GET /api/word-votes/mine` non-blocking, store result in a global `Set` (`_myWordVotes`). This only affects modal UI, so no need to await.
- When definition modal opens: check `_myWordVotes.has(word)` for button state
- On flag: `POST /api/word-votes` → add to local set → update button
- On unflag: `DELETE /api/word-votes/{word}` → remove from local set → update button
- API failure: show toast "Couldn't save vote", don't change button state
- Offline / not signed in: hide the flag button entirely

## Banned Words Runtime Filtering

### Loading

- New function `loadBannedWords()` called during `init()`, **must be awaited before `recompute()`** since filtering depends on the banned set
- Fetches `GET /api/banned-words`, stores in global `Set` (`_bannedWords`)
- Cached in `localStorage` key `wordplay-banned` with timestamp
- If cache is less than 1 hour old, use cache instead of fetching
- If fetch fails (including service worker 503 offline response) and no cache, `_bannedWords` is empty (no words filtered)
- Must check `resp.ok` before parsing — the service worker returns `{error: "offline"}` with status 503 when offline

### Filtering in level.words usage

Rather than filtering at each of the 6+ sites that read `level.words`, **mutate `level.words` and `level.bonus` once after load** in `recompute()`, before any downstream code reads them:

```javascript
// At the top of recompute(), after level data is loaded:
if (_bannedWords.size > 0) {
    level.words = level.words.filter(w => !_bannedWords.has(w));
    if (level.bonus) level.bonus = level.bonus.filter(w => !_bannedWords.has(w));
}
```

This ensures all downstream consumers (crossword generation, standalone extraction, toggleLayout, daily/bonus zen restore) automatically see filtered words without modification.

### Minimum Word Count Guard

After filtering, if `level.words.length < 2`, fall back to unfiltered words for that level. This prevents degenerate states from aggressive banning:

```javascript
const unfilteredWords = [...level.words]; // save before filtering
level.words = level.words.filter(w => !_bannedWords.has(w));
if (level.words.length < 2) level.words = unfilteredWords; // safety fallback
```

### Effect on Gameplay

- Crossword regenerates without banned word — fewer words, possibly smaller grid
- `totalRequired` decreases naturally
- Level is still completable
- Already-found instances of a banned word are filtered out on state restore (existing `placedWords` filter in `restoreLevelState`)
- Takes effect at next `recompute()` (level load or navigation)

## Admin Panel — Flagged Words Review

### "Flagged Words" Section

- Added below existing admin panel sections
- Header: "🚩 Flagged Words"
- Fetches `GET /api/admin/word-votes`
- Table sorted by vote count (most flagged first)
- Each row shows:
  - Word name + vote count badge
  - First definition from `DEFINITIONS[word]` if available (show "No definition" if missing)
  - **Ban** button — bans word, removes from review list
  - **Dismiss** button — clears all votes without banning

### "Banned Words" Sub-Section

- Lists currently banned words via `GET /api/admin/banned-words`
- Each row: word + ban date + **Unban** button
- Follows existing admin panel styling

## Files Changed

| File | Change |
|------|--------|
| `WordPlay/Program.cs` | Add WordVote and BannedWord models, DbSet registrations, 8 new API endpoints |
| `WordPlay/Data/WordPlayDb.cs` | Add WordVote and BannedWord DbSet declarations |
| `WordPlay/wwwroot/js/app.js` | loadBannedWords(), loadMyVotes(), filter in recompute(), flag button in showDefinition(), admin panel Flagged Words section |
| `WordPlay/wwwroot/css/app.css` | Flag button styles, admin flagged words table styles |
| `WordPlay/wwwroot/sw.js` | Version bumps |
| `WordPlay/wwwroot/index.html` | Version bumps |

## Database Migration

- New tables created via EF Core migration or manual SQL
- No existing data affected

## Out of Scope

- Difficulty rating (1-5 scale) — may add later if simple flag proves insufficient
- Category tagging (proper noun, scientific, etc.) — admins judge from the definition
- Batch word removal from data files — using runtime filter instead
- Voting on bonus words — only grid words are tappable
- Anonymous voting — requires sign-in
- Rate limiting on vote endpoints — low risk given small user base
