# WordPlay

A free word puzzle game with 156,000+ levels. Swipe letters on a wheel to spell words, fill crossword grids, and climb through themed level packs.

**Play now:** [wordplay.illustyrate.net](https://wordplay.illustyrate.net)

## How to Play

1. **Swipe letters** around the wheel to spell words
2. **Find all words** to complete the crossword grid and advance to the next level
3. **Earn coins** for each word found and use them on hints when you're stuck
4. **Discover bonus words** — valid words not in the grid earn extra coins and progress toward free letter rewards

## Features

- **156,000+ levels** organized into themed packs (Nature, Animals, Food, Science, and many more)
- **16 visual themes** — Sunrise, Forest, Canyon, Ocean, Aurora, and more, each with unique color palettes
- **Crossword grid** — words interlock on a dynamically generated grid
- **Letter wheel** — drag across letters to spell words with smooth touch interactions
- **Hint system** — three types of hints to help when stuck:
  - 💡 **Hint** — reveals a random unrevealed letter (100 coins)
  - 🎯 **Target** — tap any cell to reveal that specific letter (200 coins)
  - 🚀 **Rocket** — reveals up to 5 letters at once with staggered animation (300 coins)
- **Rescue Spin Wheel** — when completely stuck (no hints, no coins), spin a prize wheel to win free hints, targets, rockets, or coins
- **Bonus words** — find extra valid words not on the grid for bonus coins; every 10 bonus words earns a free letter reveal
- **Sound effects** — synthesized Web Audio API sounds for letter selection, word discovery, hints, coin spending, spin wheel, and grid entrance; toggleable in settings
- **Animated grid entrance** — five random patterns (diagonal sweeps, left/right, starburst) with ascending musical scale
- **Coin animations** — particles fly from your wallet to buttons when spending, and from center screen to wallet when earning
- **Daily bonus** — claim 100 free coins once per day
- **Level map** — browse all packs with snake-path navigation and progress tracking
- **Progress persistence** — saves to localStorage with in-progress state preserved across navigation
- **Installable PWA** — works offline with service worker caching; add to home screen on mobile
- **Mobile-first design** — optimized for phones with safe-area support, touch gestures, and responsive layout

## Tech Stack

- **Frontend:** Vanilla JavaScript (no frameworks), HTML5 Canvas, Web Audio API, CSS3
- **Backend:** ASP.NET Core (.NET 10) — serves static files
- **Storage:** localStorage for game progress
- **Offline:** Service worker with cache-first strategy
- **Level data:** Chunked JSON files loaded on demand

## Project Structure

```
WordPlay/
├── WordPlay/
│   ├── wwwroot/
│   │   ├── js/
│   │   │   ├── app.js           — Game logic, rendering, sound, animations
│   │   │   ├── crossword.js     — Grid generator with adjacency rules
│   │   │   ├── levels.js        — Original hand-curated levels
│   │   │   └── level-loader.js  — Chunked level loader for 156K+ levels
│   │   ├── css/
│   │   │   └── app.css          — All styles and animations
│   │   ├── data/                — Level data in chunked JSON files
│   │   ├── icons/               — PWA icons
│   │   ├── sw.js                — Service worker
│   │   ├── manifest.json        — PWA manifest
│   │   └── index.html           — Single-page entry point
│   └── Program.cs               — ASP.NET Core host
├── scraper/                     — Level data scraping and icon generation tools
└── README.md
```

## Development

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### Run Locally

```bash
cd WordPlay
dotnet run
```

Then open https://localhost:5001

### Using Visual Studio

1. Open `WordPlay.sln`
2. Press F5 (or Ctrl+F5 for without debugger)

## License

All rights reserved.
