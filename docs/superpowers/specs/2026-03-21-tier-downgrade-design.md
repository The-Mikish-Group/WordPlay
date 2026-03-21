# Allow Difficulty Tier Downgrade

**Date:** 2026-03-21
**Status:** Approved

## Problem

Players who set their difficulty tier too high are permanently locked in after 10 levels. There is no way to downgrade, which frustrates users who misjudged their skill level.

## Solution

Allow players to change their difficulty tier in either direction at any time via the settings menu. The display level stays the same — only the data offset changes. Tiers whose level capacity is smaller than the player's current `highestLevel` are hidden from the dropdown, naturally preventing impossible downgrades.

A new `tierCeiling` state field prevents auto-promotion from fighting a deliberate downgrade.

## Tier Capacity

Each tier supports a fixed number of display levels, determined by the gap between its offset and the next tier's offset:

| Tier   | Offset | Max Display Levels |
|--------|--------|--------------------|
| Easy   | 0      | 250                |
| Medium | 250    | 1,750              |
| Hard   | 2,000  | 3,000              |
| Expert | 5,000  | 10,000             |
| Master | 15,000 | unlimited          |

A tier appears in the dropdown only when `highestLevel <= tierCapacity`.

## State Changes

### New field

- `state.tierCeiling` (number, default `-1`): The tier index the player manually selected. When `>= 0`, auto-promotion will not promote past this tier. Cleared to `-1` when the player manually selects a higher tier.

### Persistence

- Saved as `tc` in the localStorage save object alongside existing `dt` (difficultyTier) and `doff` (difficultyOffset).
- Loaded with fallback: `state.tierCeiling = d.tc !== undefined ? d.tc : -1`
- Included in cross-device sync merge logic in `sync.js`.

## Code Changes

### 1. Initial state (~line 161)

Add `tierCeiling: -1` after `difficultyOffset`.

### 2. Save/load (~lines 526-527, 607-608)

- Load: `state.tierCeiling = d.tc !== undefined ? d.tc : -1`
- Save: add `tc: state.tierCeiling` to save object.

### 3. Dropdown rendering (~lines 4361-4380)

Replace the `canGoDown` / `levelsPlayed < 10` logic:

- For each tier, compute capacity: if a next tier exists, `capacity = nextTier.offset - tier.offset`; for Master, capacity is unlimited.
- Show the tier in the dropdown only if `state.highestLevel <= capacity` (or capacity is unlimited).
- Replace hint text. When `tierCeiling >= 0`: `"Auto-promotion paused. Select a higher tier to resume."` Otherwise: `"Higher tiers have harder puzzles."`

### 4. Tier change handler (~lines 4749-4770)

- Remove the downgrade block (`if (newIdx < state.difficultyTier && state.highestLevel >= 10 ...) return`).
- On downgrade (`newIdx < state.difficultyTier`): set `state.tierCeiling = newIdx`.
- On upgrade (`newIdx > state.difficultyTier`): clear `state.tierCeiling = -1` (restore organic promotion).
- Rest of handler (clear in-progress state, save, recompute) stays the same.

### 5. checkTierPromotion() (~line 2530)

Add an early return after the existing guards:

```javascript
if (state.tierCeiling >= 0 && state.difficultyTier >= state.tierCeiling) return;
```

This prevents auto-promotion from overriding the player's deliberate tier choice.

### 6. resetStateToDefaults() (~line 367)

Add `state.tierCeiling = -1;` after `state.difficultyOffset = 0;` so game resets clear the ceiling.

### 7. Sync (sync.js ~line 223)

Add `tc` to the merge logic, taking from the primary (higher `highestLevel`) device:

```javascript
merged.tc = primary.tc !== undefined ? primary.tc : -1;
```

This means a deliberate downgrade on a secondary device can be overwritten by the primary. This is intentional — the device that is further along owns the tier configuration, keeping `tc` consistent with `dt` and `doff`.

## What Does NOT Change

- Display level (`currentLevel`, `highestLevel`) is unaffected by tier changes.
- Coins, stats, expertise, and all other progress are preserved.
- The tier chooser dialog for new players (first play) is unchanged.
- Organic auto-promotion still works for players who never downgrade (tierCeiling stays -1).
- The existing behavior when upgrading tiers is unchanged.

## Edge Cases

- **Ghost completions**: When downgrading, levels 1 through `highestLevel - 1` on the new tier will appear completed even though the player never played those specific data levels. This is acceptable — the player chose to change tiers knowing they'd be at the same display level.
- **Tier cap overflow**: Prevented by hiding tiers from the dropdown when `highestLevel > capacity`.
- **Auto-promotion after downgrade**: Prevented by `tierCeiling`.
- **Admin override**: The `showAdmin` flag continues to bypass restrictions (though the capacity check still applies to prevent truly impossible states).
- **Speed milestones on Easy**: `checkSpeedMilestone()` blocks speed bonuses when `difficultyTier === 0`. After a downgrade to Easy, speed milestones will be blocked. This is correct for gameplay balance.
- **Game reset**: `resetStateToDefaults()` clears `tierCeiling` to `-1`, ensuring a fresh start.
