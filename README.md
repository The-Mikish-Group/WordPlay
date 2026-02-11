# WordPlay

Word puzzle game — mobile-first PWA built with ASP.NET Core .NET 10.

## Quick Start

1. Open `WordPlay.sln` in Visual Studio 2022
2. Press F5 (or Ctrl+F5)
3. Browse to https://localhost:5001

## Project Structure

- `wwwroot/js/levels.js` — Level data (60+ hand-curated levels)
- `wwwroot/js/crossword.js` — Grid generator with strict adjacency rules
- `wwwroot/js/app.js` — Main game logic, rendering, touch interactions
- `wwwroot/css/app.css` — All styles and animations
- `wwwroot/sw.js` — Service worker for offline support
- `CLAUDE-CODE-HANDOFF.md` — Phase 2 expansion spec

## Phase 2 TODO

See `CLAUDE-CODE-HANDOFF.md` for full spec:
- [ ] Procedural level generation (expand to 200+ levels)
- [ ] Full English dictionary for bonus word validation
- [ ] Generate proper PWA icons (192x192 and 512x512)
- [ ] Daily puzzle feature
- [ ] Test on iOS Safari and Android Chrome
