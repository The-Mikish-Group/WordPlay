# Admin Panel & Rabbit System Design

## Overview

Add role-based admin capabilities and a generalized "rabbit" pacing system that replaces the hardcoded Fast Eddie logic. Admins can manage users, correct data, create bot users, and assign rabbits to target players through an in-app admin panel.

## Data Model

### User table changes

Add `Role` column to `Users`:
- `"user"` (default) — normal player
- `"admin"` — can access admin panel and endpoints
- `"bot"` — system-only account, cannot sign in, exists for leaderboard and pacing

### New table: RabbitAssignments

| Column | Type | Description |
|--------|------|-------------|
| Id | int (PK) | Auto-increment |
| BotUserId | int (FK → Users) | The rabbit bot |
| TargetUserId | int (FK → Users) | The player being paced |
| IsActive | bool | Can pause/resume without deleting |
| CreatedAt | DateTime | When assigned |

Constraints:
- One bot can pace multiple users
- One user can only have one active rabbit at a time

## API & Auth

### JWT changes

Add `Role` claim to JWT token during sign-in so admin checks don't require a DB query.

### Admin endpoints (all require `Role = "admin"`)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/admin/users` | List all users with progress |
| `PUT /api/admin/users/{id}/progress` | Edit level, coins, powerups (bypasses level-decrease guard) |
| `PUT /api/admin/users/{id}/role` | Change user role |
| `PUT /api/admin/users/{id}/visibility` | Show/hide on leaderboard |
| `DELETE /api/admin/users/{id}` | Delete user account |
| `POST /api/admin/bots` | Create a new bot user |
| `GET /api/admin/rabbits` | List all rabbit assignments |
| `POST /api/admin/rabbits` | Assign a rabbit to a user |
| `DELETE /api/admin/rabbits/{id}` | Remove a rabbit assignment |

### Auth changes

- Reject sign-in for users with `Provider = "bot"` (bots can't authenticate)

## Admin UI

### Entry point

"Admin" button in Settings menu, visible only when signed-in user has `Role = "admin"`.

### User List (main admin screen)

- Table: name, role badge, level, total coins, monthly gains, last active
- Search/filter bar
- Tap row to open user detail
- "Create Bot" button

### User Detail

- Editable fields: level, coins on hand, total coins earned, free hints/targets/rockets
- Role selector: user / admin / bot
- Leaderboard visibility toggle
- Reset Progress / Delete User buttons (with confirmation)
- Rabbit assignment display and dropdown

### Rabbit Management

- List of active assignments: bot → target
- Add/pause/resume/delete assignments
- Bot creation: display name only, system creates `Role = "bot"`, `Provider = "bot"`

### Styling

Dark background consistent with game theme, table/form-oriented, no game animations. Functional tools screen.

## Pacing Engine

### Current state

Hardcoded in `/api/progress` POST: checks `Pacing:BridgetUserId` and `Pacing:EddieUserId` config values, only runs for Bridget.

### New approach

After saving any user's progress, query `RabbitAssignments` for active assignments targeting that user. Run the existing pacing algorithm for each assigned bot:
- Randomized 1-8 level lead (8% tie, 17% close, 75% comfortable)
- Monthly level and coin lead awareness
- Only bumps up, never decreases bot level

### Removed

- `Pacing:BridgetUserId` and `Pacing:EddieUserId` config values
- Hardcoded Eddie pacing block

## Migration Plan

### Database migration

1. Add `Role` column to `Users` (default `"user"`)
2. Create `RabbitAssignments` table
3. Set Word Dog (ID 1) → `Role = "admin"`
4. Set Fast Eddie (ID 9) → `Role = "bot"`, `Provider = "bot"`, `ProviderSubject = NULL`, `Email = NULL`
5. Insert `RabbitAssignment`: `BotUserId = 9, TargetUserId = 7, IsActive = true`
6. Add `Role` claim to JWT generation

### Code migration

1. Remove `Pacing:BridgetUserId` / `Pacing:EddieUserId` from `appsettings.json`
2. Replace hardcoded Eddie block with dynamic assignment lookup
3. Add admin API endpoints
4. Add admin UI screens gated by role
5. Reject `Provider = "bot"` in sign-in endpoints
