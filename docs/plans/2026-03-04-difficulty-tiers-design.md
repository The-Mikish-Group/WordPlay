# Difficulty Tiers — Design

## Problem
New players who are experienced word game players must grind through hundreds of trivially easy levels (3-5 letters, 2-8 words). This is tedious and risks losing them before they reach engaging content.

## Solution
Let players choose a difficulty tier that offsets their starting level. Display levels remap to start at 1 — the offset is transparent. Players see real group/pack names for their actual underlying content.

## Tiers & Offsets

| Tier   | Offset | Pack Start | Tagline                  | Content Profile                     |
|--------|--------|------------|--------------------------|-------------------------------------|
| Easy   | 0      | Pack 1     | "New to word games"      | 3-5 letters, 2-9 words, 0-2 bonus  |
| Medium | 250    | Pack 11    | "I know my way around"   | 6 letters, 5-8 words, 0-5 bonus    |
| Hard   | 2000   | Pack 81    | "Bring it on"            | 6 letters, 6 words, 3-9 bonus      |
| Expert | 5000   | Pack 201   | "Challenge me"           | 6-7 letters, 6-8 words, 8-15 bonus |

Offsets are pack-aligned (multiples of 25) for clean map boundaries.

## Core Mechanic

- **Actual level** = offset + display level
- Player sees levels starting at 1, real group/pack names from offset data
- Stored in save: `dt` (tier index 0-3), `doff` (offset value)

## First Launch Modal

- Shown to ALL players who haven't chosen a tier (new + existing)
- 4 buttons: tier name + one-liner tagline
- Link to guide for details
- Cannot dismiss — must choose before playing

## Settings

- Dropdown showing current tier and higher tiers only (up only, never down)
- Changing tier recalculates: new actual level = new offset + levels completed
- Auto-updates when player is auto-promoted

## Auto-Promotion

When levels completed crosses the next tier boundary:
- Easy → Medium at 250 levels completed
- Medium → Hard at 1750 levels completed (offset 250 + 1750 = actual 2000)
- Hard → Expert at 3000 levels completed (offset 2000 + 3000 = actual 5000)

**Achievement dialog**: Trophy with growing flame/aura + confetti burst announcing the new tier.

## Speed Gating

- **Speed bonus spin**: Already gated by 5+ words per level (no change needed)
- **Speed milestone** (5 levels/hour → bonus puzzle): Disabled for Easy tier. Unlocks at Medium+.

## Guide

Detailed "Difficulty Tiers" section covering:
- What each tier means
- How offset works (transparent to player)
- Auto-promotion as achievement
- How to change in Settings (up only)
- Speed milestone unlock at Medium+

## Files to Modify

| File | Changes |
|------|---------|
| `app.js` | Tier chooser modal, offset logic in level loading, header/map remapping, auto-promotion check + achievement dialog, settings dropdown, guide section, speed milestone gating |
| `app.css` | Tier chooser modal styles, achievement dialog styles/animations (trophy + flame + confetti) |
| `sync.js` | Merge `dt` and `doff` fields |
