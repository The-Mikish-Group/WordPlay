# User Avatars Design

**Goal:** Replace the colored-initials circles with customizable avatars — emoji presets, uploaded photos, or camera captures — stored in the database and displayed on the leaderboard and settings.

## Data Model

Add one nullable column to the User table: `AvatarData` (nvarchar(max)).

Values:
- `null` — colored circle with initials (current behavior, the fallback)
- `"emoji:fox"` — emoji preset rendered large in the circle
- `"data:image/jpeg;base64,..."` — custom cropped photo, 256x256 JPEG (~20-35KB)

No separate table. No file system storage. Base64 in the DB is deployment-safe on site4now shared hosting.

## Avatar Editor UI

Opens as a modal overlay (same pattern as display name prompt). Three tabs:

**Emoji Presets (default tab):** Grid of 12-16 emoji characters in circles. Tap to select, preview updates, tap Save. Suggested set: dog, cat, fox, unicorn, bear, panda, owl, frog, lion, monkey, robot, alien, ghost, octopus, butterfly, dragon.

**Upload Photo:** File input (JPEG/PNG/WebP, max 5MB). Cropper.js opens with circular crop area. Drag to reposition, scroll/pinch to zoom. Zoom slider + buttons. Live circular preview. Save exports 256x256 JPEG base64.

**Take Photo:** Camera via `getUserMedia`. Front/back toggle. Capture button snapshots to canvas. Mirror correction for front camera. Captured image feeds into the same Cropper.js crop flow.

## Entry Points

- **Settings menu:** Current avatar displayed at ~60px next to display name with pencil/edit overlay. Tap opens editor.
- No leaderboard tap-to-edit (settings only + profile area in settings).

## API

**`POST /api/auth/set-avatar`** — Accepts `{ avatarData }`. Validates emoji prefix against allowed list or base64 under 100KB starting with `data:image`. Saves to `User.AvatarData`. Returns `{ avatarData }`. Requires auth.

**`DELETE /api/auth/avatar`** — Clears AvatarData to null (revert to initials). Returns 200. Requires auth.

## Leaderboard Integration

Add `avatarData` to the leaderboard projection query. The rendering helper `renderAvatar(avatarData, name, size)` centralizes the three-way logic:

1. `avatarData` starts with `"emoji:"` — emoji character in colored circle
2. `avatarData` starts with `"data:image"` — `<img>` with `border-radius:50%; object-fit:cover`
3. Null/empty — current initials + deterministic color

Used in leaderboard rows, settings profile area, and admin user list. Default size 34px (leaderboard), 60px in settings.

## Cropper.js Integration

Loaded from CDN only when upload/camera tab is opened (no impact on initial page load). Config matches Fish-Smart's proven setup:

- `aspectRatio: 1`, `viewMode: 1`, `dragMode: 'move'`
- Fixed crop box (not movable/resizable), circular mask via CSS
- EXIF orientation handling, large image preprocessing (max 2048px)
- Export: `getCroppedCanvas({ width: 256, height: 256 }).toDataURL('image/jpeg', 0.85)`

Camera: `getUserMedia` with facingMode toggle, front-camera mirror correction via canvas `scale(-1, 1)`.

No server-side image processing — all cropping/resizing in browser canvas. Server validates and stores the base64 string.

## Client State

`_authState.user.avatarData` added, persisted in localStorage. Updated on set-avatar response (same pattern as setDisplayName).
