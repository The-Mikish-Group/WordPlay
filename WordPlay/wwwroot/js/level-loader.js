// ============================================================
// WordPlay — Dynamic Level Loader
// Loads levels from scraped JSON chunk files (lazy loading)
// Falls back to built-in levels if data/ files don't exist
// ============================================================

// ---- LEVEL CACHE ----
const _chunkCache = {};  // chunkFile -> { levelNum: [letters, words, group, pack] }
let _manifest = null;    // [{ file, start, end }, ...]
let _levelIndex = null;  // [{ group, pack, start, end }, ...]
let _maxLevel = 0;
let _useBuiltIn = false;

// ---- THEME ASSIGNMENT ----
// Maps group names to themes (cycling through available themes)
const GROUP_THEMES = {};
const THEME_LIST = ["sunrise", "forest", "canyon", "sky"];
let _themeIdx = 0;

function getThemeForGroup(group) {
    if (!GROUP_THEMES[group]) {
        GROUP_THEMES[group] = THEME_LIST[_themeIdx % THEME_LIST.length];
        _themeIdx++;
    }
    return GROUP_THEMES[group];
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
            return ALL_LEVELS[levelNum]; // already in the old format
        }
        return null;
    }

    // Dynamic loading
    const chunk = findChunkForLevel(levelNum);
    if (!chunk) return null;
    
    const data = await loadChunk(chunk);
    if (!data || !data[levelNum]) return null;
    
    const [letters, words, group, pack] = data[levelNum];
    
    return {
        levelNumber: levelNum,
        letters: letters.toLowerCase(),
        words: words.map(w => w.toUpperCase()),
        bonus: [],  // bonus words not scraped (would need separate logic)
        group: group,
        pack: pack,
        theme: getThemeForGroup(group)
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

// ---- PACK LISTING (for menu) ----
function getLevelPacks() {
    if (_useBuiltIn && typeof LEVEL_PACKS !== "undefined") {
        return LEVEL_PACKS;
    }
    
    if (!_levelIndex) return [];
    
    // Convert index to pack structure for the menu
    // Group adjacent packs under the same group
    const groups = {};
    for (const entry of _levelIndex) {
        const key = entry.group;
        if (!groups[key]) groups[key] = [];
        groups[key].push(entry);
    }
    
    return _levelIndex; // The menu will handle this format
}

function getMaxLevel() {
    return _maxLevel;
}

function isUsingBuiltIn() {
    return _useBuiltIn;
}
