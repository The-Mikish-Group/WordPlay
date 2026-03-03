// ============================================================
// WordPlay — Dynamic Level Loader
// Loads levels from scraped JSON chunk files (lazy loading)
// Falls back to built-in levels if data/ files don't exist
// ============================================================

// ---- LEVEL CACHE ----
const _chunkCache = {};  // chunkFile -> { levelNum: [letters, words, group, pack] }
const CHUNK_SIZE = 200;  // levels per chunk file
let _manifest = null;    // [{ file, start, end }, ...]
let _levelIndex = null;  // [{ group, pack, start, end }, ...]
let _maxLevel = 0;
let _useBuiltIn = false;

// ---- THEME ASSIGNMENT ----
const THEME_LIST = [
    "sunrise", "forest", "canyon", "sky",
    "ocean", "lavender", "autumn", "midnight",
    "arctic", "volcano", "meadow", "storm",
    "coral", "aurora", "desert", "twilight",
];

const GROUP_THEMES = {
    // sunrise
    "Daybreak": "sunrise", "Kindling": "sunrise", "Solstice": "sunrise", "Radiance": "sunrise", "Ember": "sunrise",
    // forest
    "Thicket": "forest", "Canopy": "forest", "Glade": "forest", "Fernwood": "forest", "Mossglen": "forest",
    // canyon
    "Gorge": "canyon", "Sandstone": "canyon", "Terrace": "canyon", "Bluffside": "canyon", "Escarpment": "canyon",
    // sky
    "Cirrus": "sky", "Zephyr": "sky", "Altair": "sky", "Windswept": "sky", "Loftward": "sky",
    // ocean
    "Seagrass": "ocean", "Riptide": "ocean", "Shallows": "ocean", "Undertow": "ocean", "Mariner": "ocean",
    // lavender
    "Wisteria": "lavender", "Orchid": "lavender", "Petal": "lavender", "Thistle": "lavender", "Foxglove": "lavender",
    // autumn
    "Copper": "autumn", "Harvest": "autumn", "Russet": "autumn", "Bracken": "autumn", "Goldenrod": "autumn",
    // midnight
    "Nebula": "midnight", "Eclipse": "midnight", "Cosmos": "midnight", "Eventide": "midnight", "Stardust": "midnight",
    // arctic
    "Permafrost": "arctic", "Glacier": "arctic", "Snowfield": "arctic", "Tundra": "arctic", "Icefall": "arctic",
    // volcano
    "Caldera": "volcano", "Obsidian": "volcano", "Magma": "volcano", "Basalt": "volcano", "Ashfall": "volcano",
    // meadow
    "Clover": "meadow", "Hayfield": "meadow", "Prairie": "meadow", "Pasture": "meadow", "Wildflower": "meadow",
    // storm
    "Nimbus": "storm", "Squall": "storm", "Overcast": "storm", "Tempest": "storm", "Cloudburst": "storm",
    // coral
    "Atoll": "coral", "Sandbar": "coral", "Tideline": "coral", "Driftwood": "coral", "Saltmarsh": "coral",
    // aurora
    "Boreal": "aurora", "Glimmer": "aurora", "Phosphor": "aurora", "Shimmer": "aurora", "Verdant": "aurora",
    // desert
    "Mirage": "desert", "Sagebrush": "desert", "Dustbowl": "desert", "Badlands": "desert", "Mesa": "desert",
    // twilight
    "Pinnacle": "twilight", "Ridgeline": "twilight", "Timberline": "twilight", "Cairn": "twilight", "Alpenglow": "twilight",
};

function getThemeForGroup(group) {
    return GROUP_THEMES[group] || "sunrise";
}

// Theme cycles per pack (every 25 levels) through all 16 themes
function getThemeForLevel(levelNum) {
    const packIdx = Math.floor((levelNum - 1) / 25);
    return THEME_LIST[packIdx % THEME_LIST.length];
}

function getThemeForPackStart(packStart) {
    return getThemeForLevel(packStart);
}

// ---- INITIALIZATION ----
async function initLevelLoader() {
    try {
        // Try loading the chunk manifest
        const resp = await fetch("data/chunk-manifest.json");
        if (!resp.ok) throw new Error("No manifest");
        _manifest = await resp.json();

        // Load the level index (group/pack structure)
        const idxResp = await fetch("data/level-index.json");
        if (idxResp.ok) {
            _levelIndex = await idxResp.json();
        }

        // Calculate max level
        if (_manifest.length > 0) {
            _maxLevel = _manifest[_manifest.length - 1].end;
        }

        console.log(`Level loader: ${_manifest.length} chunks, max level ${_maxLevel}`);
        return true;
    } catch (e) {
        console.log("Level loader: No scraped data found, using built-in levels");
        _useBuiltIn = true;

        // Fall back to built-in levels (from levels.js if it exists)
        if (typeof ALL_LEVELS !== "undefined" && ALL_LEVELS.length > 0) {
            _maxLevel = ALL_LEVELS.length;
            return true;
        }

        console.error("No levels available! Run the scraper first.");
        return false;
    }
}

// ---- CHUNK LOADING ----
function findChunkForLevel(levelNum) {
    if (!_manifest) return null;
    for (const chunk of _manifest) {
        if (levelNum >= chunk.start && levelNum <= chunk.end) {
            return chunk;
        }
    }
    return null;
}

async function loadChunk(chunkInfo) {
    if (_chunkCache[chunkInfo.file]) return _chunkCache[chunkInfo.file];

    try {
        const resp = await fetch("data/" + chunkInfo.file);
        if (!resp.ok) throw new Error(`Failed to load ${chunkInfo.file}`);
        const data = await resp.json();
        _chunkCache[chunkInfo.file] = data;
        return data;
    } catch (e) {
        console.error("Chunk load error:", e);
        return null;
    }
}

// ---- GET A LEVEL ----
// Returns: { letters, words, group, pack, theme, levelNumber }
async function getLevel(levelNum) {
    // Built-in fallback
    if (_useBuiltIn) {
        if (typeof ALL_LEVELS !== "undefined" && levelNum >= 0 && levelNum < ALL_LEVELS.length) {
            return ALL_LEVELS[levelNum];
        }
        return null;
    }

    // Dynamic loading
    const chunk = findChunkForLevel(levelNum);
    if (!chunk) return null;

    const data = await loadChunk(chunk);
    if (!data || !data[levelNum]) return null;

    const entry = data[levelNum];
    const [letters, words, group, pack] = entry;
    const bonus = entry[4] || [];

    return {
        levelNumber: levelNum,
        letters: letters.toLowerCase(),
        words: words.map(w => w.toUpperCase()),
        bonus: bonus.map(w => w.toUpperCase()),
        group,
        pack,
        theme: getThemeForLevel(levelNum)
    };
}

// ---- PRELOAD ADJACENT CHUNKS ----
// Preloads the current + next chunk so transitions are instant
async function preloadAround(levelNum) {
    if (_useBuiltIn || !_manifest) return;

    const chunk = findChunkForLevel(levelNum);
    if (chunk) await loadChunk(chunk);

    // Also preload next chunk
    const nextChunk = findChunkForLevel(levelNum + CHUNK_SIZE);
    if (nextChunk) loadChunk(nextChunk); // fire and forget
}

// ---- PACK LISTING (for menu/map) ----
let _cachedPacks = null;

function getLevelPacks() {
    if (_useBuiltIn && typeof LEVEL_PACKS !== "undefined") {
        return LEVEL_PACKS;
    }
    if (!_levelIndex) return [];
    if (_cachedPacks) return _cachedPacks;

    _cachedPacks = _levelIndex;
    return _cachedPacks;
}

function getMaxLevel() {
    return _maxLevel;
}
