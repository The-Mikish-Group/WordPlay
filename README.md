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
2. **Find all words** to complete the crossword grid and advance to the next level
3. **Earn coins** for each word found and use them on hints when you're stuck
4. **Discover bonus words** — valid words not in the grid earn extra coins and progress toward free letter rewards

---

## Features

| Feature | Description |
|---------|-------------|
| **156,000+ levels** | Organized into themed packs (Nature, Animals, Food, Science, and many more) |
| **16 visual themes** | Sunrise, Forest, Canyon, Ocean, Aurora, and more — each with unique color palettes and gradient backgrounds |
| **Crossword grid** | Words interlock on a dynamically generated grid with animated entrance patterns |
| **Letter wheel** | Drag across letters to spell words with smooth touch interactions |
| **3 hint types** | Hint (random letter), Target (tap a cell), Rocket (reveals up to 5 letters) |
| **Rescue spin wheel** | When completely stuck, spin a prize wheel to win free hints, targets, rockets, or coins |
| **Bonus words** | Find extra valid words not on the grid; every 10 bonus words earns a free letter reveal |
| **Standalone coin word** | Special word worth 100 coins, shown with a pulsing coin animation |
| **Sound effects** | Synthesized Web Audio API sounds — no audio files needed |
| **Daily bonus** | Claim 100 free coins once per day |
| **Level map** | Browse all packs with snake-path navigation and progress tracking |
| **Cross-device sync** | Sign in with Google or Microsoft to sync progress across devices |
| **Leaderboard** | Monthly and all-time rankings with trophy animations and medals |
| **Contact form** | In-app support form with four-layer anti-spam protection |
| **Installable PWA** | Works offline with service worker caching; add to home screen on mobile |
| **Mobile-first design** | Optimized for phones with safe-area support, touch gestures, and responsive layout |

---

## Game Mechanics

### Coins

| Action | Coins |
|--------|-------|
| Find a placed word | +1 |
| Find a bonus word | +5 |
| Find the standalone coin word | +100 |
| Claim daily bonus | +100 |
| Rescue spin wheel | +50 or +100 |

| Hint | Cost |
|------|------|
| Hint (random letter) | 100 coins |
| Target (tap a cell) | 200 coins |
| Rocket (up to 5 letters) | 300 coins |

### Free Rewards

- Every **10 bonus words** found earns a free random letter reveal
- Every **10 levels** completed earns free hints, targets, and rockets

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

---

## Leaderboard

The leaderboard has two tabs:

- **This Month** — ranks players by levels gained since the start of the current month
- **All Time** — ranks players by highest level reached overall

Top 3 players receive medal badges. Your own entry is highlighted if you're on the board. You can opt out of appearing on the leaderboard from the settings menu.

Access the leaderboard from the trophy button in the game header.

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
│   │   │   ├── app.js                   # Game logic, rendering, sound, animations (~3,000 lines)
│   │   │   ├── crossword.js             # Grid generator with adjacency rules
│   │   │   ├── level-loader.js          # Chunked level loader for 156K+ levels
│   │   │   ├── levels.js               # Original hand-curated levels
│   │   │   ├── auth.js                  # Google & Microsoft sign-in, JWT management
│   │   │   └── sync.js                 # Push/pull/merge cloud sync
│   │   ├── css/
│   │   │   └── app.css                  # All styles, themes, and animations (~1,500 lines)
│   │   ├── data/
│   │   │   ├── chunk-manifest.json      # Maps chunk files to level ranges
│   │   │   ├── level-index.json         # Group/pack metadata with level ranges
│   │   │   └── levels-*.json            # Level data chunks (200 levels per file)
│   │   ├── icons/                       # PWA icons (32×32, 192×192)
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
  "v": 3,
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
  "ldc": "2026-02-23",
  "lh": { "1": ["CAR", "CAT", "ARC"] },
  "ip": { "42": { "fw": ["CAR"], "bf": [], "rc": [], "sf": false } }
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
| `ldc` | Last daily claim date |
| `lh` | Level history — completed levels and their found words |
| `ip` | In-progress state for levels navigated away from |

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
