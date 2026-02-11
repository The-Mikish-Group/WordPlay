# WordPlay Level Scraper

Scrapes level data from wordscapescheat.com and outputs JSON files for the game app.

## Prerequisites

- Node.js (any recent version)
- Internet connection

## Usage

```bash
cd scraper

# Scrape all levels (will take many hours at default rate)
node scrape-levels.js

# Scrape a specific range (good for testing)
node scrape-levels.js --start 1 --end 100

# Faster scraping (shorter delay between requests)
node scrape-levels.js --start 1 --end 1000 --delay 300

# Resume after interruption (just run again — picks up from checkpoint)
node scrape-levels.js
```

## Options

| Flag      | Default  | Description                              |
|-----------|----------|------------------------------------------|
| --start   | 1        | First level to scrape                    |
| --end     | 200000   | Last level to scrape                     |
| --batch   | 50       | Batch size for progress reporting        |
| --delay   | 500      | Milliseconds between requests            |

## Output

Files are written to `WordPlay/wwwroot/data/`:

- **chunk-manifest.json** — Maps level ranges to chunk files
- **level-index.json** — Group/pack structure with level ranges
- **levels-NNNNNN-NNNNNN.json** — Chunk files (200 levels each)

Each chunk file has this format:
```json
{
  "1": ["CAT", ["CAT", "ACT"], "Sunrise", "Rise"],
  "2": ["WON", ["OWN", "NOW", "WON"], "Sunrise", "Rise"]
}
```

Format: `[letters, [answer_words], group_name, pack_name]`

## Checkpoints

Progress is saved every 500 levels to `scraper/checkpoints/progress.json`.
If interrupted, just run the script again — it resumes automatically.

## Time Estimates

At default 500ms delay:
- 100 levels: ~1 minute
- 1,000 levels: ~10 minutes
- 10,000 levels: ~1.5 hours
- 150,000 levels: ~21 hours

Tip: Start with `--start 10000 --end 10200` to grab levels near your current game position, then expand the range later.

## Scraping Strategy for 150k+ Levels

Since the full scrape takes ~21 hours, consider this approach:

1. **First run**: Scrape your current range + buffer  
   ```bash
   node scrape-levels.js --start 10000 --end 10500
   ```

2. **Background run**: Let the full scrape run overnight  
   ```bash
   node scrape-levels.js --start 1 --end 200000
   ```

3. **Resume anytime**: If it stops, just run again — it picks up where it left off.
