// ============================================================
// WordPlay — Crossword Grid Generator
//
// Strict adjacency rules:
// 1. New cells: ALL perpendicular neighbors must be empty
// 2. Intersection cells must cross from opposite direction
// 3. No cell used by more than 2 words (one H, one V)
// 4. Empty cell required before/after each word
//
// Strategy: try many orderings × both orientations, pick best
// ============================================================

function generateCrosswordGrid(words) {
    if (!words || !words.length) return { grid: [], placements: [], rows: 0, cols: 0 };

    const orderings = [];

    // Longest first
    orderings.push([...words].sort((a, b) => b.length - a.length));
    // Shortest first
    orderings.push([...words].sort((a, b) => a.length - b.length));
    // Interleaved long/short
    const byLen = [...words].sort((a, b) => b.length - a.length);
    const interleaved = [];
    let lo = 0, hi = byLen.length - 1;
    while (lo <= hi) {
        interleaved.push(byLen[lo++]);
        if (lo <= hi) interleaved.push(byLen[hi--]);
    }
    orderings.push(interleaved);
    // Seeded shuffles
    for (let seed = 0; seed < 8; seed++) {
        const a = [...words];
        let s = seed * 31 + 7;
        for (let i = a.length - 1; i > 0; i--) {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            const j = s % (i + 1);
            [a[i], a[j]] = [a[j], a[i]];
        }
        orderings.push(a);
    }

    let best = null;
    for (const order of orderings) {
        for (const firstDir of ["h", "v"]) {
            const result = _buildGrid(order, firstDir);
            if (!best || result.placements.length > best.placements.length) {
                best = result;
                if (best.placements.length === words.length) return best;
            }
        }
    }
    return best;
}

function _buildGrid(sortedWords, firstDir) {
    const G = 28;
    const grid = [];
    const cellDir = [];
    for (let r = 0; r < G; r++) {
        grid.push(new Array(G).fill(null));
        cellDir.push(new Array(G).fill(null));
    }
    const placements = [];
    const placedSet = new Set();

    function mark(word, r0, c0, dir) {
        const cells = [];
        for (let i = 0; i < word.length; i++) {
            const r = dir === "h" ? r0 : r0 + i;
            const c = dir === "h" ? c0 + i : c0;
            grid[r][c] = word[i];
            cells.push({ row: r, col: c, letter: word[i] });
            if (cellDir[r][c] === null) cellDir[r][c] = dir;
            else if (cellDir[r][c] !== dir) cellDir[r][c] = "x";
        }
        placements.push({ word, row: r0, col: c0, direction: dir, cells });
        placedSet.add(word);
    }

    function canPlace(word, r0, c0, dir) {
        const len = word.length;
        for (let i = 0; i < len; i++) {
            const r = dir === "h" ? r0 : r0 + i;
            const c = dir === "h" ? c0 + i : c0;
            if (r < 0 || r >= G || c < 0 || c >= G) return false;
        }
        if (dir === "h") {
            if (c0 > 0 && grid[r0][c0 - 1] !== null) return false;
            if (c0 + len < G && grid[r0][c0 + len] !== null) return false;
        } else {
            if (r0 > 0 && grid[r0 - 1][c0] !== null) return false;
            if (r0 + len < G && grid[r0 + len][c0] !== null) return false;
        }
        let ix = 0, nc = 0;
        for (let i = 0; i < len; i++) {
            const r = dir === "h" ? r0 : r0 + i;
            const c = dir === "h" ? c0 + i : c0;
            if (grid[r][c] !== null) {
                if (grid[r][c] !== word[i]) return false;
                if (cellDir[r][c] === dir || cellDir[r][c] === "x") return false;
                ix++;
            } else {
                if (dir === "h") {
                    if (r > 0 && grid[r - 1][c] !== null) return false;
                    if (r < G - 1 && grid[r + 1][c] !== null) return false;
                } else {
                    if (c > 0 && grid[r][c - 1] !== null) return false;
                    if (c < G - 1 && grid[r][c + 1] !== null) return false;
                }
                nc++;
            }
        }
        return ix > 0 && nc > 0;
    }

    function findBest(word) {
        let br = -1, bc = -1, bd = "", bs = -Infinity;
        for (const p of placements) {
            for (let pi = 0; pi < p.word.length; pi++) {
                for (let ci = 0; ci < word.length; ci++) {
                    if (p.word[pi] !== word[ci]) continue;
                    const nd = p.direction === "h" ? "v" : "h";
                    const ir = p.cells[pi].row, ic = p.cells[pi].col;
                    const r0 = nd === "h" ? ir : ir - ci;
                    const c0 = nd === "h" ? ic - ci : ic;
                    if (canPlace(word, r0, c0, nd)) {
                        let sc = 0;
                        for (let k = 0; k < word.length; k++) {
                            const r = nd === "h" ? r0 : r0 + k;
                            const c = nd === "h" ? c0 + k : c0;
                            if (grid[r][c] === word[k]) sc += 10;
                        }
                        sc -= (Math.abs((nd === "h" ? r0 : r0 + word.length / 2) - G / 2)
                            + Math.abs((nd === "h" ? c0 + word.length / 2 : c0) - G / 2)) * 0.3;
                        if (sc > bs) { bs = sc; br = r0; bc = c0; bd = nd; }
                    }
                }
            }
        }
        return bs > -Infinity ? { r: br, c: bc, d: bd } : null;
    }

    // Place first word
    const first = sortedWords[0];
    const mid = Math.floor(G / 2);
    const sr = firstDir === "v" ? Math.floor((G - first.length) / 2) : mid;
    const sc = firstDir === "h" ? Math.floor((G - first.length) / 2) : mid;
    mark(first, sr, sc, firstDir);

    // Multi-pass
    for (let pass = 0; pass < 8; pass++) {
        let progress = 0;
        for (const word of sortedWords) {
            if (placedSet.has(word)) continue;
            const spot = findBest(word);
            if (spot) { mark(word, spot.r, spot.c, spot.d); progress++; }
        }
        if (progress === 0) break;
    }

    // Trim to bounding box
    let minR = G, maxR = 0, minC = G, maxC = 0;
    for (const p of placements) {
        for (const c of p.cells) {
            if (c.row < minR) minR = c.row;
            if (c.row > maxR) maxR = c.row;
            if (c.col < minC) minC = c.col;
            if (c.col > maxC) maxC = c.col;
        }
    }
    if (!placements.length) return { grid: [], placements: [], rows: 0, cols: 0 };

    const rows = maxR - minR + 1, cols = maxC - minC + 1;
    const trimmedGrid = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(grid[r + minR][c + minC]);
        }
        trimmedGrid.push(row);
    }

    const trimmedPlacements = placements.map(p => ({
        ...p,
        row: p.row - minR,
        col: p.col - minC,
        cells: p.cells.map(c => ({ ...c, row: c.row - minR, col: c.col - minC })),
    }));

    return { grid: trimmedGrid, placements: trimmedPlacements, rows, cols };
}

// ============================================================
// Standalone Coin Word Extraction
//
// If a generated crossword exceeds maxDim rows or cols, try
// removing a 4-5 letter edge word to shrink the grid. The
// removed word is then injected back into empty space in the
// first or last row of the new grid (never adding rows/cols).
// ============================================================
function extractStandaloneWord(words, maxDim) {
    if (typeof maxDim !== "number") maxDim = 12;
    const initial = generateCrosswordGrid(words);
    if (initial.rows <= maxDim && initial.cols <= maxDim) {
        return { crossword: initial, standalone: null };
    }

    // Find candidates: 4-5 letter placed words on a grid edge
    const candidates = [];
    for (const p of initial.placements) {
        if (p.word.length < 4 || p.word.length > 5) continue;
        const onEdge = p.cells.some(c =>
            c.row === 0 || c.row === initial.rows - 1 ||
            c.col === 0 || c.col === initial.cols - 1
        );
        if (onEdge) candidates.push(p.word);
    }
    if (!candidates.length) {
        // Fallback: check for naturally-detached words in the original grid
        const detached = _findDetachedWord(initial);
        if (detached) return { crossword: initial, standalone: detached };
        return { crossword: initial, standalone: null };
    }

    // Try removing each candidate, measure shrinkage, collect all viable options
    const viable = [];
    for (const cand of candidates) {
        const reduced = words.filter(w => w !== cand);
        const result = generateCrosswordGrid(reduced);
        if (result.placements.length < reduced.length) continue;
        const oldMax = Math.max(initial.rows, initial.cols);
        const newMax = Math.max(result.rows, result.cols);
        const shrink = oldMax - newMax;
        if (shrink >= 2) viable.push({ word: cand, result, shrink });
    }

    // Try each viable candidate (best shrink first) through injection
    viable.sort((a, b) => b.shrink - a.shrink);
    for (const v of viable) {
        if (_injectStandalone(v.result, v.word)) {
            return { crossword: v.result, standalone: v.word };
        }
    }

    // Fallback: check for naturally-detached words in the original grid
    const detached = _findDetachedWord(initial);
    if (detached) return { crossword: initial, standalone: detached };

    return { crossword: initial, standalone: null };
}

// Check if any 4-5 letter horizontal word in the first or last row
// is already naturally detached (no vertical neighbors on any cell,
// gap before/after). If found, mark its placement as standalone.
function _findDetachedWord(cw) {
    const { grid, placements, rows, cols } = cw;
    for (const p of placements) {
        if (p.word.length < 4 || p.word.length > 5) continue;
        if (p.direction !== "h") continue;
        if (p.row !== 0 && p.row !== rows - 1) continue;

        const adjRow = p.row === 0 ? 1 : p.row - 1;
        let detached = true;
        for (const c of p.cells) {
            // Check the adjacent row cell is empty
            if (adjRow >= 0 && adjRow < rows && grid[adjRow][c.col] !== null) {
                detached = false;
                break;
            }
        }
        if (!detached) continue;

        // Verify gap before and after the word in its row
        if (p.col > 0 && grid[p.row][p.col - 1] !== null) continue;
        if (p.col + p.word.length < cols && grid[p.row][p.col + p.word.length] !== null) continue;

        // This word is naturally detached — mark it as standalone
        p.standalone = true;
        return p.word;
    }
    return null;
}

// Place the standalone word in contiguous empty cells of the
// last row (preferred) or first row. Returns true on success.
// Enforces adjacency: no occupied cell in the neighboring row
// directly above/below any letter, and empty gaps before/after.
function _injectStandalone(cw, word) {
    const { grid, placements, rows, cols } = cw;
    if (word.length > cols) return false;

    for (const targetRow of [rows - 1, 0]) {
        // The adjacent row toward the grid interior
        const adjRow = targetRow === 0 ? 1 : targetRow - 1;

        // Find all valid start positions in this row
        // A position is valid if:
        //  - all cells in [col0 .. col0+len-1] are empty in targetRow
        //  - all cells in [col0 .. col0+len-1] are empty in adjRow
        //  - cell before (col0-1) in targetRow is empty or OOB
        //  - cell after (col0+len) in targetRow is empty or OOB
        let bestCol0 = -1, bestScore = -Infinity;

        for (let col0 = 0; col0 <= cols - word.length; col0++) {
            // Gap before
            if (col0 > 0 && grid[targetRow][col0 - 1] !== null) continue;
            // Gap after
            if (col0 + word.length < cols && grid[targetRow][col0 + word.length] !== null) continue;

            let valid = true;
            for (let i = 0; i < word.length; i++) {
                const c = col0 + i;
                // Must be empty in target row
                if (grid[targetRow][c] !== null) { valid = false; break; }
                // Must be empty in adjacent row (no fake 2-cell groups)
                if (grid[adjRow][c] !== null) { valid = false; break; }
            }
            if (!valid) continue;

            // Score: prefer centered placement
            const mid = (col0 + col0 + word.length - 1) / 2;
            const score = -Math.abs(mid - (cols - 1) / 2);
            if (score > bestScore) { bestScore = score; bestCol0 = col0; }
        }

        if (bestCol0 < 0) continue;

        const cells = [];
        for (let i = 0; i < word.length; i++) {
            grid[targetRow][bestCol0 + i] = word[i];
            cells.push({ row: targetRow, col: bestCol0 + i, letter: word[i] });
        }
        placements.push({ word, row: targetRow, col: bestCol0, direction: "h", cells, standalone: true });
        return true;
    }
    return false; // no valid space — skip standalone
}
