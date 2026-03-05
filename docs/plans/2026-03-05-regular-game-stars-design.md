# Regular Game Stars Design

## Overview

Extend the bonus star system to regular gameplay. Stars occasionally appear on regular level boards, contributing to the same banner star counter used by bonus puzzles. Collecting all 3 banner stars (9 board stars) awards a 500-coin grand prize without ending the level.

## Star Placement

- **20% chance** per regular level of stars appearing on the board
- Determined by seeded hash of the level number (consistent across reloads)
- **1-2 stars** placed on word cells when triggered
- Stars look and behave identically to bonus mode: gold star overlays on cells, revealed when the word containing the cell is found
- Each collected board star adds to `bonusStarsTotal` (shared counter with bonus mode) and awards +10 coins

## Header Display

- Regular game header gains a `bonus-star-display` element showing only earned banner stars (filled stars, no empty outlines, no background)
- Star fly animation targets this header element when a star is collected
- Header re-renders and plays bonus chime when a new banner star is earned (every 3 board stars)

## Completion Behavior

**Regular levels:** Collecting all 3 banner stars (9 total) does NOT end the level.
- Grand prize (500 coins) awarded immediately via toast + animation
- `bonusStarsTotal` resets to 0, header re-renders (stars disappear)
- Player continues and must finish the level normally
- Completion modal shows regular score; grand prize already celebrated in-game

**Bonus mode:** Unchanged. Hitting 9 stars still ends the round immediately.

## Persistence

- Star cells stored in `state.inProgress[levelNum]` with new fields: `starCells` (cell positions) and `starsCollected` (count collected this level)
- `bonusStarsTotal` already persisted and synced, no changes needed
- 20% roll uses seeded hash of level number, not Math.random()
