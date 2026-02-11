# WordPlay

Word puzzle game — mobile-first PWA built with ASP.NET Core .NET 10.

## Quick Start

1. Open `WordPlay.sln` in Visual Studio 2022
2. Press F5 (or Ctrl+F5)
3. Browse to https://localhost:5001

## Project Structure

- `WordPlay/wwwroot/js/app.js` — Main game logic, rendering, touch interactions
- `WordPlay/wwwroot/js/crossword.js` — Grid generator with strict adjacency rules
- `WordPlay/wwwroot/js/levels.js` — Original hand-curated levels
- `WordPlay/wwwroot/js/level-loader.js` — Chunked level loader for 46,000+ levels
- `WordPlay/wwwroot/data/` — Level data split into chunked JSON files
- `WordPlay/wwwroot/css/app.css` — All styles and animations
- `WordPlay/wwwroot/sw.js` — Service worker for offline support
- `scraper/` — Level scraping and icon generation tools
