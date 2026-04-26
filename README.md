# WordPlay

A free word puzzle game with 156,000+ levels. Swipe letters on a wheel to spell words, fill crossword grids, and climb through themed level packs.

**Play now:** [wordplay.illustrate.net](https://wordplay.illustrate.net)

---

## Table of Contents

- [How to Play](#how-to-play)
- [Features](#features)
- [Game Mechanics](#game-mechanics)
- [Themes](#themes)
- [Accounts & Sync](#accounts--sync)
- [Leaderboard](#leaderboard)
- [Contact Form](#contact-form)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Formats](#data-formats)
- [Development](#development)
- [Configuration](#configuration)
- [License](#license)

---

## How to Play

1. **Swipe letters** around the wheel to spell words (minimum 3 letters)
2. **Find all words** to complete the grid and advance to the next level
3. **Earn coins** for each word found and use them on hints when you're stuck
4. **Discover bonus words** — valid words not in the grid earn extra coins and progress toward free letter rewards

---

## Features

| Feature | Description |
|---------|-------------|
| **156,000+ levels** | Organized into themed packs (Nature, Animals, Food, Science, and many more) |
| **16 visual themes** | Sunrise, Forest, Canyon, Ocean, Aurora, and more — each with unique color palettes and gradient backgrounds |
| **Two grid layouts** | Crossword (interlocking) and Flow (stacked rows) — toggle between them mid-game by tapping the header |
| **Letter wheel** | Drag across letters to spell words with smooth touch interactions; desktop users can also type words on the keyboard |
| **Difficulty tiers** | Five tiers (Easy, Medium, Hard, Expert, Master) that scale with your progress |
| **3 hint types** | Hint (random letter), Target (tap a cell), Rocket (reveals up to 5 letters) |
| **Rescue spin wheel** | When completely stuck, spin a prize wheel to win free hints, targets, rockets, or coins |
| **Bonus words** | Find extra valid words not on the grid; every 10 bonus words earns a free letter reveal |
| **Standalone coin word** | Special word worth 100 coins (200 on flow levels), shown with a pulsing coin animation |
| **Daily puzzle** | A fresh shared puzzle every day with a roaming coin for bonus rewards |
| **7-day daily streak** | Complete the daily puzzle 7 days in a row to earn 1,000 bonus coins — resets and repeats |
| **Bonus puzzle** | Earn star-filled puzzles through achievements — collect all 9 stars for a 500-coin grand prize |
| **Regular game stars** | ~50% of regular levels feature bonus stars worth 10 coins each; collect 9 for a grand prize |
| **Speed bonus** | Complete a level within 7 seconds per word to earn a free prize spin |
| **Flow levels** | Every 5th level uses a stacked layout with 3x coin rewards |
| **Expertise score** | Lifetime coins earned — displayed on the home screen and used for leaderboard points ranking |
| **Avatar** | Personalize your profile with an emoji or uploaded image |
| **Sound effects** | Synthesized Web Audio API sounds — no audio files needed |
| **Daily bonus** | Claim 100 free coins once per day |
| **Level map** | Browse all packs with snake-path navigation and progress tracking |
| **Cross-device sync** | Sign in with Google or Microsoft to sync progress across devices |
| **Leaderboard** | Monthly and all-time rankings by levels completed or points earned |
| **Contact form** | In-app support form with four-layer anti-spam protection |
| **Installable PWA** | Works offline with service worker caching; add to home screen on mobile |
| **Mobile-first design** | Optimized for phones with safe-area support, touch gestures, and responsive layout |

---

## Game Mechanics

### Coins

| Action | Coins (Regular) | Coins (Flow Level) |
|--------|-----------------|-------------------|
| Find a placed word | +1 | +3 |
| Find a bonus word | +5 | +15 |
| Find the standalone coin word | +100 | +200 |
| Complete daily puzzle | +100 | — |
| 7-day daily streak bonus | +1,000 | — |
| Claim daily bonus | +100 | — |
| Rescue spin wheel | +50 or +100 | — |
| Collect a bonus star | +10 | — |
| Grand prize (9 stars) | +500 | — |

| Hint | Cost |
|------|------|
| Hint (random letter) | 100 coins |
| Target (tap a cell) | 200 coins |
| Rocket (up to 5 letters) | 300 coins |

### Free Rewards

- Every **10 bonus words** found earns a free random letter reveal
- Every **10 levels** completed earns free hints; targets every 20 levels; rockets every 30 levels
- **Speed bonus**: complete a level within 7 seconds per word (5+ words required) for a free prize spin

### Stars

Stars appear on ~50% of regular levels (1-2 per level) and throughout bonus puzzles (9 per puzzle). Finding a word that contains a starred cell collects the star and awards 10 coins. Every 3 stars fills one banner star slot. Collecting all 9 stars (3 banner stars) awards a **500-coin grand prize** and resets the counter. In regular mode the grand prize is awarded inline; in bonus mode it ends the round.

### Grid Layouts

Two layout styles are available:

- **Crossword** — words interlock on a dynamically generated grid
- **Flow** — words stack in horizontal rows

Toggle between them during gameplay by tapping the pack name / level info in the header. A **Grid Layout** preference in Settings controls the default: Auto (game decides), Crossword, or Flow. All progress carries over when switching.

### Word Definitions

Tap any found word in the grid to see its definition. A modal shows the part of speech and numbered meanings. Only non-intersecting cells are tappable. Definitions are bundled offline as a pre-generated data file.

### Word Flagging

Signed-in players can flag words as too hard from the definition modal. Administrators review flagged words in the admin panel and can ban them — banned words are filtered from all levels at runtime without modifying level data files. Bans are reversible.

### Difficulty Tiers

| Tier | Levels | Description |
|------|--------|-------------|
| Easy | 1–250 | Short words (3–5 letters), perfect for beginners |
| Medium | 251–2,000 | Full 6-letter puzzles with moderate bonus words |
| Hard | 2,001–5,000 | Puzzles with 3–9 bonus words |
| Expert | 5,001–15,000 | Complex anagrams with 8–15+ bonus words |
| Master | 15,001+ | 7–8 letter puzzles with massive word counts for true word enthusiasts |

Tier is set automatically based on progress and can be changed in Settings. Tiers whose level capacity is smaller than your current level are hidden.

### Daily Puzzle

A fresh puzzle shared by all players each day. A coin appears on one word in the grid — find it for 25 bonus coins, then the coin moves to a new word. Complete the entire puzzle for a 100-coin bonus. Some dailies use a flow layout for variety.

**7-Day Streak:** Complete the daily puzzle 7 consecutive days to earn a 1,000-coin bonus with a celebration banner. The streak counter ("X/7 🔥") appears on the daily puzzle button, and progress is shown in the completion modal. After collecting the reward, the streak resets and you can earn it again every week. This is independent of the 3-day play streak that awards bonus puzzles.

### Bonus Puzzle

Earned through achievements: completing a level pack, finishing 5 levels in an hour, maintaining a 3-day play streak, or beating the daily puzzle. Inside, 9 stars are scattered across the grid. Collect all 9 for a 500-coin grand prize. Leaving the puzzle forfeits progress.

### Quests

A themed 7-day Quest runs continuously. The narrative: **the player's bees forage in the current quest's setting and bring honey 🍯 back to the hive**. Each Daily Goal completed adds jars to the hive. As the hive fills past each threshold, that threshold's reward pays out automatically — coins, more bees, hints, targets, rockets.

Each Quest has **8 milestone tiers** at 20 / 60 / 130 / 220 / 320 / 430 / 550 / 680 honey jars. The first 4 are reachable for active daily players; tiers 5-8 are stretch goals, with the tier 8 grand prize being a true windfall (1000 coins + 10 bees + 9 hint-bundle items).

The Quest screen's milestone row scrolls horizontally — when you open it, the next unclaimed tier auto-centers in view.

When a quest ends, the next themed quest begins automatically the next day. Quest themes cycle through original names (Spring Bloom, Honey Harvest, Coral Cove, etc.) — each reusing one of the 16 visual themes for art.

Tap the Quest banner below the level button on the home screen to open the full Quest screen.

### Daily Goals

Three goals per day, refreshing at midnight local time. Goals are deterministic by date — every player worldwide sees the same 3 goals on the same day. Goal templates include "play 5 levels", "find 8 words with 5+ letters", "complete a level without hints", "earn a speed bonus", and more.

Completing a goal auto-pays its reward (honey jars + small coin/hint reward) — no claim button needed. Yesterday's progress is gone at midnight; play daily to keep the streak.

### Bees

A new helper mechanic. A bee sits on a grid letter cell on certain levels — when the player finds the word containing that cell, the bee splits into 3 helper bees that fly out and reveal one random letter in 3 different unsolved words.

| Bee source | Reveals |
|---|---|
| Spawned bee (level-baked) | 3 letters |
| Won bee (from Quest milestone or spin wheel) | 4 letters |
| Both on same level | 7 letters |

Bee-level frequency scales with difficulty tier and is modulated by recent player pace. Faster players (4+ speed bonuses in the last hour) see bees less often; struggling players see them at the base rate.

| Tier | Base frequency | Effective % |
|---|---|---|
| Easy | every 8th | ~13% |
| Medium | every 6th | ~17% |
| Hard | every 5th | ~20% |
| Expert | every 4th | ~25% |
| Master | every 4th | ~25% |

Pace adjustments (added to the base frequency number — higher = rarer):
- 4+ speed bonuses in the last hour → +3 (much rarer)
- 2-3 speed bonuses → +1 (slightly rarer)
- 0-1 speed bonuses → no adjustment

### Rescue Spin Wheel

When you're stuck with no coins and no free hints, a spin wheel appears with 8 prize segments: free hints, targets, rockets, or coin prizes (50 or 100).

### Shuffle

Randomizes the letter positions on the wheel without changing which letters are available. Useful for spotting words you might have missed.

### Level Map

Browse all level packs organized into themed groups. Each group contains multiple packs, and each pack contains a set of levels. The map shows your progress with completion percentages, lock icons for future levels, and checkmarks for completed packs. Click any unlocked level to jump to it.

---

## Themes

The game cycles through 16 visual themes as you progress. Each theme defines a full color palette: background gradient, accent color, wheel style, grid cell colors, and text tones.

| # | Theme | Accent | Description |
|---|-------|--------|-------------|
| 1 | Sunrise | `#f4a535` | Warm orange and gold over purple |
| 2 | Forest | `#8ed87c` | Deep greens with leaf tones |
| 3 | Canyon | `#e8b44c` | Terracotta and sandy brown |
| 4 | Sky | `#6ec6f5` | Light blue and airy |
| 5 | Ocean | `#3ccfcf` | Teal and cyan depths |
| 6 | Lavender | `#d4a5e5` | Purple floral tones |
| 7 | Autumn | `#e89040` | Warm orange and amber |
| 8 | Midnight | `#8878c8` | Deep indigo and violet |
| 9 | Arctic | `#a0d4e8` | Icy blue and frost |
| 10 | Volcano | `#f06848` | Fiery red and magma |
| 11 | Meadow | `#a0d040` | Bright yellow-green |
| 12 | Storm | `#90a8d0` | Grey-blue and moody |
| 13 | Coral | `#f08ca0` | Pink coastal warmth |
| 14 | Aurora | `#60e0a0` | Green and teal glow |
| 15 | Desert | `#d0c060` | Sandy gold and dunes |
| 16 | Twilight | `#c080e0` | Purple dusk haze |

---

## Accounts & Sync

Sign in with **Google** or **Microsoft** to sync your progress across devices. Signing in is optional — the game works fully offline with local storage.

### How Sync Works

- **Push:** After every save, progress is pushed to the server (debounced 3 seconds)
- **Pull:** When the app regains focus (switching tabs, reopening the app), progress is pulled from the server and merged
- **Merge strategy:** Progress is monotonically increasing — you can't un-find a word or un-complete a level

| Field | Merge Rule |
|-------|------------|
| Coins, highest level, hints, levels completed | `max(local, server)` |
| Current-level state (found words, revealed cells) | Take from whichever save has the higher highest level |
| Level history | Union — for each level, keep the entry with more words |
| In-progress levels | Union — keep entry with more found words; skip if level is already in history |
| Sound preference | Always local (device-specific preference) |
| Last daily claim | Latest date |

### Display Name

On first sign-in you'll be prompted to choose a display name (3–20 characters, letters, numbers, and spaces). This name appears on the leaderboard. You can change it anytime from the settings menu.

### Avatar

Tap the avatar circle next to your name in Settings to personalize your profile. Choose an emoji, upload an image, or take a photo with your camera. Your avatar appears on the leaderboard.

### Account Deletion

Open Settings, scroll to your account section, and tap **Delete Account**. This permanently removes your account, progress, coins, and scores from the server. This cannot be undone.

---

## Leaderboard

The leaderboard has two tabs:

- **This Month** — ranks players by levels gained since the start of the current month
- **All Time** — ranks players by highest level reached overall

Within each tab, toggle between **By Levels** (levels completed) and **By Points** (expertise/lifetime coins earned).

Top 3 players receive medal badges. Your own entry is highlighted if you're on the board. You can opt out of appearing on the leaderboard from the settings menu.

Access the leaderboard from the trophy button in the game header or by tapping the expertise banner on the home screen.

---

## Contact Form

Users can submit support messages directly from the in-app menu. Messages are delivered via SMTP to the support inbox with the sender's email set as the reply-to address.

### Anti-Spam Protection

The contact form uses four layers of defense to block automated submissions:

| Layer | Mechanism | How It Works |
|-------|-----------|--------------|
| **Honeypot** | Hidden input field | An invisible `website` field is rendered off-screen. Bots that auto-fill all fields will populate it. If the server detects a value, it returns a fake success response to avoid tipping off the bot. |
| **JS Token** | Client-generated token | When the form opens, JavaScript computes a token (`wp-{hash}-{timestamp}`) from the open timestamp and browser fingerprint. Requests missing this token or with an invalid format are rejected. Bots that POST directly to the API without rendering the page will fail this check. |
| **Timing** | Minimum submission time | The form records when it was opened. Submissions made in under 3 seconds are rejected — no human can fill out four fields that fast. |
| **Rate Limit** | IP-based throttle | Maximum 3 submissions per 10 minutes per IP address. |

Layers are evaluated in order — honeypot and token checks are fast and cheap, so they run before any rate-limit bookkeeping or email validation.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla JavaScript (no frameworks), HTML5, CSS3 |
| **Audio** | Web Audio API — all sounds synthesized from oscillators, no audio files |
| **Backend** | ASP.NET Core (.NET 10) minimal API |
| **Database** | SQL Server via Entity Framework Core |
| **Auth** | Google Identity Services (GSI), MSAL.js (Microsoft), JWT Bearer tokens |
| **Email** | MailKit (SMTP with StartTls) for contact form delivery |
| **Offline** | Service worker with cache-first strategy for level data, network-first for app shell |
| **Level data** | Chunked JSON files (200 levels per file) loaded on demand |
| **Storage** | `localStorage` for game progress, synced to server when signed in |

---

## Project Structure

```
WordPlay/
├── WordPlay/                            # ASP.NET Core application
│   ├── wwwroot/                         # Static web files (served directly)
│   │   ├── js/
│   │   │   ├── app.js                   # Game logic, rendering, sound, animations (~7,000 lines)
│   │   │   ├── crossword.js             # Grid generator (crossword + flow layouts)
│   │   │   ├── level-loader.js          # Chunked level loader for 156K+ levels
│   │   │   ├── levels.js               # Original hand-curated levels
│   │   │   ├── auth.js                  # Google & Microsoft sign-in, JWT management
│   │   │   └── sync.js                 # Push/pull/merge cloud sync
│   │   ├── css/
│   │   │   └── app.css                  # All styles, themes, and animations (~2,500 lines)
│   │   ├── data/
│   │   │   ├── chunk-manifest.json      # Maps chunk files to level ranges
│   │   │   ├── level-index.json         # Group/pack metadata with level ranges
│   │   │   └── levels-*.json            # Level data chunks (200 levels per file)
│   │   ├── icons/                       # PWA icons (32x32, 192x192)
│   │   ├── images/bg/                   # Theme background images
│   │   ├── sw.js                        # Service worker — caching & offline support
│   │   ├── manifest.json                # PWA manifest
│   │   └── index.html                   # Single-page entry point
│   ├── Models/
│   │   ├── User.cs                      # User entity (provider, email, display name)
│   │   └── UserProgress.cs              # Progress entity (JSON blob + denormalized stats)
│   ├── Data/
│   │   └── WordPlayDb.cs                # Entity Framework Core DbContext
│   ├── Services/
│   │   └── AuthService.cs               # Token validation (Google/Microsoft) + JWT issuance
│   ├── Migrations/                      # EF Core database migrations
│   ├── Program.cs                       # App host + all API endpoints
│   ├── WordPlay.csproj                  # .NET 10 project file
│   └── appsettings.json                 # Configuration (gitignored — contains secrets)
├── scraper/                             # Level data scraping tools
├── tools/                               # Utility scripts
├── docs/plans/                          # Design and implementation plans
├── WordPlay.sln                         # Visual Studio solution
└── README.md
```

---

## Data Formats

### Level Data

Each chunk file (`levels-000001-000200.json`) is a flat JSON object keyed by level number:

```json
{
  "1": {
    "letters": "ACTR",
    "words": ["CAR", "CAT", "ARC", "ACT", "ART", "CART"],
    "bonus": ["AT", "TAR", "RAT"],
    "group": "Sunrise",
    "pack": "Rise"
  }
}
```

Levels 1–6,000 are hand-curated with themed groups. Levels 6,001+ use dynamically generated group and pack names that rotate through four themed series (Horizon, Depths, Summit, Twilight).

### Chunk Manifest

Maps each file to its level range for on-demand loading:

```json
[
  { "file": "levels-000001-000200.json", "start": 1, "end": 200 },
  { "file": "levels-000201-000400.json", "start": 201, "end": 400 }
]
```

### Save State

Game progress is stored in `localStorage` under `"wordplay-save"`:

```json
{
  "v": 7,
  "cl": 42,
  "fw": ["CAR", "CAT"],
  "bf": ["AT"],
  "co": 450,
  "hl": 50,
  "bc": 3,
  "rc": ["3,2"],
  "fh": 2,
  "ft": 0,
  "fr": 0,
  "lc": 42,
  "sf": false,
  "se": true,
  "lp": "auto",
  "ldc": "2026-02-23",
  "tce": 12500,
  "dp": null,
  "bp": null,
  "bh": [],
  "bst": 0,
  "sl": [],
  "ls": {},
  "lpd": null,
  "fc": 0,
  "dt": 1,
  "doff": 0,
  "ip": { "42": { "fw": ["CAR"], "bf": [], "rc": [], "sf": false, "rsc": [], "zen": false } }
}
```

| Key | Description |
|-----|-------------|
| `v` | Schema version |
| `cl` | Current level |
| `fw` | Found words (current level) |
| `bf` | Bonus words found (current level) |
| `co` | Coin balance |
| `hl` | Highest level reached |
| `bc` | Bonus counter (toward 10-word reward) |
| `rc` | Revealed cells from hints (`"row,col"` strings) |
| `fh` / `ft` / `fr` | Free hints / targets / rockets |
| `lc` | Total levels completed |
| `sf` | Standalone word found (current level) |
| `se` | Sound enabled |
| `lp` | Layout preference (`"auto"`, `"crossword"`, `"flow"`) |
| `ldc` | Last daily claim date |
| `tce` | Total coins earned (lifetime, never decreases — used for expertise) |
| `dp` | Daily puzzle state |
| `bp` | Bonus puzzle state |
| `bh` | Bonus puzzle history |
| `bst` | Bonus stars total (0–9, resets on grand prize) |
| `sl` | Speed levels (recent fast completions for bonus puzzle triggers) |
| `ls` | Login streak tracking |
| `lpd` | Last play date |
| `fc` | Flow levels completed |
| `dt` | Difficulty tier (0=Easy, 1=Medium, 2=Hard, 3=Expert, 4=Master) |
| `doff` | Difficulty offset (for tier-based level numbering) |
| `ip` | In-progress state for levels navigated away from |

In-progress entries (`ip`) additionally store `rsc` (regular star cells) and `zen` (whether flow layout was active, kept as `zen` key for save compatibility).

---

## Development

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- SQL Server (LocalDB, Express, or remote) — required only for auth & sync features

### Run Locally

```bash
cd WordPlay
dotnet run
```

Then open `https://localhost:5001`.

The game is fully playable without a database — auth and sync features simply won't be available.

### Using Visual Studio

1. Open `WordPlay.sln`
2. Press **F5** (or **Ctrl+F5** to run without debugger)

### Database Setup

If you want auth and sync features:

1. Create a SQL Server database
2. Configure the connection string in `appsettings.json` (see [Configuration](#configuration))
3. Run EF Core migrations:

```bash
cd WordPlay
dotnet ef database update
```

---

## Configuration

The `appsettings.json` file is gitignored because it contains secrets. Create one in the `WordPlay/` directory with this structure:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=True;"
  },
  "Auth": {
    "Jwt": {
      "Secret": "your-64-character-minimum-secret-key-here",
      "Issuer": "https://your-domain.com",
      "Audience": "wordplay-web"
    },
    "Google": {
      "ClientId": "your-google-client-id.apps.googleusercontent.com"
    },
    "Microsoft": {
      "ClientId": "your-microsoft-application-id",
      "TenantId": "common"
    }
  },
  "Smtp": {
    "Host": "your-smtp-host",
    "Port": 587,
    "UseSsl": true,
    "Username": "your-email@example.com",
    "Password": "your-smtp-password",
    "FromAddress": "noreply@example.com",
    "ToAddress": "support@example.com"
  }
}
```

### OAuth Setup

**Google:** Create credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Add your domain as an authorized JavaScript origin.

**Microsoft:** Register an app in [Microsoft Entra](https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps). Set the redirect URI to your domain and enable ID tokens under Authentication.

### API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/google` | — | Validate Google ID token, return JWT |
| `POST /api/auth/microsoft` | — | Validate Microsoft ID token, return JWT |
| `POST /api/auth/set-name` | JWT | Set display name (3–20 chars, alphanumeric + spaces) |
| `POST /api/auth/set-leaderboard` | JWT | Toggle leaderboard visibility |
| `GET /api/progress` | JWT | Fetch saved progress JSON |
| `POST /api/progress` | JWT | Save progress, extract denormalized fields |
| `GET /api/leaderboard` | — | Top players (query: `?top=50&period=month` or `?period=all`) |
| `POST /api/contact` | — | Submit contact form (four-layer anti-spam) |
| `GET /api/proxy` | — | CORS proxy for level data scraping |
| `POST /api/deploy-data` | — | Deploy chunked level data to server |

---

## Service Worker

The service worker (`sw.js`) uses different caching strategies depending on the request:

| Request Type | Strategy | Reason |
|-------------|----------|--------|
| `/api/*` | Network only | Auth and sync need real-time data; returns 503 JSON when offline |
| `/data/*` | Cache first | Level chunks are immutable; load from cache after first fetch |
| Everything else | Network first | Always try for the latest app shell; fall back to cache offline |

Cache versions are bumped on each deploy. Old caches are automatically cleaned up on service worker activation. The app checks for service worker updates every 60 seconds.

---

## License

All rights reserved.
