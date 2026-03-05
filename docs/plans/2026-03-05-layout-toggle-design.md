# Layout Toggle Design

## Overview

Allow players to toggle between crossword and flow/zen grid layouts mid-game by tapping the header-center area (pack name + level text). A settings preference controls the default layout.

## Layout Toggle Mechanic

- Tapping header-center during gameplay toggles between crossword and flow layout
- Regenerates the grid using the alternate layout function
- Preserves `foundWords` (word strings, layout-independent)
- Re-maps `revealedCells`: for each revealed "row,col" in the old layout, finds the corresponding letter's position in the new layout and marks it revealed
- In zen/flow mode, the standalone coin word becomes a regular stacked word (still awards coins when found)
- In crossword mode, it gets extracted back out as standalone (if applicable)
- Available in all modes: regular, daily, and bonus
- Star cells (`_regularStarCells` / `_bonusStarCells`) also get re-mapped to new positions

## Settings Preference

New setting in the main settings menu: **Grid Layout** with three choices:

- **Auto** (default): game's natural behavior (crossword for regular, flow for every-5th). Toggle available mid-game.
- **Crossword**: always starts in crossword layout. Toggle available mid-game.
- **Flow**: always starts in flow layout. Toggle available mid-game.

Stored in `state.layoutPref` and persisted in save data. Preference only controls the initial layout when entering a level.

## Guide Update

New guide entry titled "Grid Layouts" explaining:
- The two layout styles (crossword vs flow/stacked)
- How to toggle by tapping the level info in the header
- The Grid Layout preference in Settings
- All progress carries over when switching
