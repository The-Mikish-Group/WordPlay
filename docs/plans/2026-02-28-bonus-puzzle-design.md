# Bonus Puzzle Feature Design

## Overview

A special puzzle mode triggered by in-game achievements. One bonus puzzle can be pending at a time. The player enters voluntarily via a home screen button, plays a star-collecting variant of a previously completed level, and earns coins plus a grand prize for collecting all stars.

## State & Data Model

### New State Fields

```javascript
state.bonusPuzzle = {
    available: false,       // Is the bonus button showing on home?
    trigger: null,          // "pack" | "speed" | "streak" | "daily"
    levelNum: null,         // Random completed level to replay
    fw: [],                 // Found words
    bf: [],                 // Bonus words found
    rc: [],                 // Revealed cells
    sf: false,              // Standalone found
    starsCollected: 0,      // 0-9 stars collected so far
    starPoints: 0,          // 0-3 (each = 3 stars collected)
    coinsEarned: 0,         // Coins accumulated during this bonus
    completed: false,
}
state.isBonusMode = false

// Achievement tracking (persisted)
state.speedLevels = []      // Timestamps of recent level completions
state.loginStreak = 0       // Consecutive days played
state.lastPlayDate = null   // "YYYY-MM-DD" of last play
```

### Star Placement

- 9 stars distributed across crossword words
- Words with 5+ letters get 2 stars, others get 1
- Stars placed on specific cells, always visible (gold star overlay)
- Distribution algorithm assigns stars to words until 9 are placed

### Persistence

- Save format bumped to v4
- `bonusPuzzle`, `speedLevels`, `loginStreak`, `lastPlayDate` added to save/load
- Server sync merges `bonusPuzzle` like `dailyPuzzle`: prefer completed > more stars > latest

## Achievement Triggers

Four triggers, any one makes the bonus button appear (if none already pending):

1. **Pack completion** - Complete all levels in a pack
2. **Speed milestone** - 10 levels completed within 60 minutes
3. **Daily login streak** - 3+ consecutive days played (resets after triggering)
4. **Daily puzzle completion** - Finish today's daily puzzle

One-at-a-time rule: if `bonusPuzzle.available` is already true, new triggers are silently ignored.

Level selection: random from `Object.keys(state.levelHistory)` (completed levels).

## Home Screen Button

### Placement

- New row between daily puzzle row and center "Word Play" heading
- If daily puzzle button IS showing: bonus button appears in a row below it
- If daily puzzle button is NOT showing: bonus button appears where daily row would be
- Uses negative margins (same technique as daily puzzle row) to avoid pushing heading down

### Button Style

- Star icon, gold/star color scheme
- Text: "Bonus Puzzle" with star icon
- Pulse animation similar to daily puzzle button
- Disappears when player enters the bonus (whether completed or forfeited)

## In-Game UI

### Header Layout (Bonus Mode)

```
[Back btn] [Center: "Bonus Puzzle" / level subtitle] [Right: coins + star slots]
```

- Center: "Bonus Puzzle" label with level info
- Right side: coin display on top, 3 star slots below (replaces daily/free button area)
- Stars start as empty/dim outlines, fill gold when earned (every 3rd star collected)

### Grid Star Markers

- 9 cells have a visible gold star overlay (slightly transparent)
- Always visible, never hidden
- When a starred word is found, each star animates from its cell to the right-side star display

### Animation Sequence (per starred word found)

1. Stars fly from cell to star area (~400ms)
2. Every 3rd star: one of the 3 star slots fills with celebratory pulse
3. Then coins fly from cell to coin display (+10 per star)

### Hints

- Hints (letter, target, rocket) prefer non-starred cells
- Only reveal starred cells when no other unrevealed cells remain
- This preserves the challenge of earning stars through word-finding

## Completion & Rewards

### During Play

- Each star collected = +10 coins (fly animation to coin display)
- Every 3rd star = star slot fills (fly animation + pulse)

### Completion Modal

- "Bonus Complete!" with star emoji
- Stars earned display: e.g., "3/3" filled stars or "2/3"
- If all 9 stars (3/3 points): "Grand Prize: +500 coins!" with celebration
- Total coins earned during the bonus
- Button: "Collect & Return Home"

### Grand Prize

- All 9 stars collected = 500 bonus coins + coins earned in play
- Fewer than 9 stars = only coins earned in play (no grand prize)

### Forfeit

- Back button triggers confirmation: "Leave bonus puzzle? You'll lose your progress and the bonus prize."
- If confirmed: keep coins already earned, set `bonusPuzzle.available = false`, return home
- Coins earned during play are kept (already added to `state.coins` during play)

### Next Bonus

- Starts completely fresh: 0 stars, new random level from completed levels
- Previous bonus state is fully cleared
