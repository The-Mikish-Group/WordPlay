# Word Voting & Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let players flag words as too hard from the definition modal, admins review and ban words, banned words are filtered from levels at runtime.

**Architecture:** Three layers — player voting via API, admin review panel, runtime banned-words filter. Two new database tables (WordVotes, BannedWords). Client loads banned list on startup and filters `level.words` before crossword generation. Votes stored server-side, admin panel shows aggregated flags.

**Tech Stack:** ASP.NET Core minimal API, EF Core, vanilla JS, existing auth system

**Spec:** `docs/plans/2026-03-29-word-voting-design.md`

---

### Task 1: Database models and migration

**Files:**
- Create: `WordPlay/Models/WordVote.cs`
- Create: `WordPlay/Models/BannedWord.cs`
- Modify: `WordPlay/Data/WordPlayDb.cs:10-13` (add DbSets)
- Modify: `WordPlay/Data/WordPlayDb.cs:15-49` (add OnModelCreating config)

- [ ] **Step 1: Create WordVote model**

Create `WordPlay/Models/WordVote.cs`:

```csharp
namespace WordPlay.Models;

public class WordVote
{
    public int Id { get; set; }
    public required string Word { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
}
```

- [ ] **Step 2: Create BannedWord model**

Create `WordPlay/Models/BannedWord.cs`:

```csharp
namespace WordPlay.Models;

public class BannedWord
{
    public int Id { get; set; }
    public required string Word { get; set; }
    public int BannedById { get; set; }
    public DateTime BannedAt { get; set; } = DateTime.UtcNow;
    public User BannedBy { get; set; } = null!;
}
```

- [ ] **Step 3: Add DbSets to WordPlayDb.cs**

After existing DbSet declarations (line 13), add:

```csharp
    public DbSet<WordVote> WordVotes => Set<WordVote>();
    public DbSet<BannedWord> BannedWords => Set<BannedWord>();
```

- [ ] **Step 4: Add model configuration in OnModelCreating**

After the `ProgressSnapshot` entity config (line 48), add:

```csharp
        modelBuilder.Entity<WordVote>(e =>
        {
            e.Property(v => v.Word).HasMaxLength(20);
            e.HasIndex(v => new { v.Word, v.UserId }).IsUnique();
            e.HasIndex(v => v.Word);
            e.HasOne(v => v.User).WithMany().HasForeignKey(v => v.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BannedWord>(e =>
        {
            e.Property(b => b.Word).HasMaxLength(20);
            e.HasIndex(b => b.Word).IsUnique();
            e.HasOne(b => b.BannedBy).WithMany().HasForeignKey(b => b.BannedById).OnDelete(DeleteBehavior.NoAction);
        });
```

- [ ] **Step 5: Create and apply EF Core migration**

Run from `WordPlay/` directory:

```bash
dotnet ef migrations add AddWordVotesAndBannedWords
dotnet ef database update
```

- [ ] **Step 6: Commit**

```bash
git add WordPlay/Models/WordVote.cs WordPlay/Models/BannedWord.cs WordPlay/Data/WordPlayDb.cs
git add WordPlay/Migrations/
git commit -m "feat: add WordVote and BannedWord database models"
```

---

### Task 2: Player voting API endpoints

**Files:**
- Modify: `WordPlay/Program.cs` (add 3 endpoints after existing /api/ routes)

- [ ] **Step 1: Add POST /api/word-votes endpoint**

Add after the existing `/api/progress` endpoints (around line 916, before the admin section):

```csharp
app.MapPost("/api/word-votes", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("word", out var wordEl)) return Results.BadRequest(new { error = "word required" });

    var word = wordEl.GetString()?.Trim().ToUpperInvariant() ?? "";
    if (word.Length < 2 || word.Length > 20 || !word.All(char.IsLetter))
        return Results.BadRequest(new { error = "Invalid word" });

    var exists = await db.WordVotes.AnyAsync(v => v.Word == word && v.UserId == userId.Value);
    if (exists) return Results.Conflict(new { error = "Already voted" });

    db.WordVotes.Add(new WordVote { Word = word, UserId = userId.Value });
    await db.SaveChangesAsync();
    return Results.Ok(new { word });
}).RequireAuthorization();
```

- [ ] **Step 2: Add DELETE /api/word-votes/{word} endpoint**

```csharp
app.MapDelete("/api/word-votes/{word}", async (string word, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var normalized = word.Trim().ToUpperInvariant();
    var vote = await db.WordVotes.FirstOrDefaultAsync(v => v.Word == normalized && v.UserId == userId.Value);
    if (vote == null) return Results.NotFound();

    db.WordVotes.Remove(vote);
    await db.SaveChangesAsync();
    return Results.Ok();
}).RequireAuthorization();
```

- [ ] **Step 3: Add GET /api/word-votes/mine endpoint**

```csharp
app.MapGet("/api/word-votes/mine", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var words = await db.WordVotes
        .Where(v => v.UserId == userId.Value)
        .Select(v => v.Word)
        .ToListAsync();
    return Results.Ok(words);
}).RequireAuthorization();
```

- [ ] **Step 4: Add required using statement**

At the top of Program.cs, ensure `using Microsoft.EntityFrameworkCore;` is present (likely already there). Also ensure `using WordPlay.Models;` covers the new models.

- [ ] **Step 5: Verify endpoints build**

Run: `cd WordPlay && dotnet build`
Expected: Build succeeded.

- [ ] **Step 6: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: add player word voting API endpoints"
```

---

### Task 3: Banned words API endpoints (public + admin)

**Files:**
- Modify: `WordPlay/Program.cs` (add 5 endpoints)

- [ ] **Step 1: Add GET /api/banned-words (public, no auth)**

Add this BEFORE the `.RequireAuthorization()` section (it needs to be publicly accessible):

```csharp
app.MapGet("/api/banned-words", async (WordPlayDb db) =>
{
    var words = await db.BannedWords.Select(b => b.Word).ToListAsync();
    return Results.Ok(words);
});
```

- [ ] **Step 2: Add GET /api/admin/word-votes**

Add in the admin endpoints section (after existing admin routes):

```csharp
app.MapGet("/api/admin/word-votes", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();

    var votes = await db.WordVotes
        .GroupBy(v => v.Word)
        .Select(g => new { word = g.Key, votes = g.Count() })
        .OrderByDescending(x => x.votes)
        .ToListAsync();
    return Results.Ok(votes);
}).RequireAuthorization();
```

- [ ] **Step 3: Add GET /api/admin/banned-words**

```csharp
app.MapGet("/api/admin/banned-words", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();

    var banned = await db.BannedWords
        .OrderByDescending(b => b.BannedAt)
        .Select(b => new { word = b.Word, bannedAt = b.BannedAt, bannedById = b.BannedById })
        .ToListAsync();
    return Results.Ok(banned);
}).RequireAuthorization();
```

- [ ] **Step 4: Add POST /api/admin/banned-words**

```csharp
app.MapPost("/api/admin/banned-words", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("word", out var wordEl)) return Results.BadRequest(new { error = "word required" });

    var word = wordEl.GetString()?.Trim().ToUpperInvariant() ?? "";
    if (word.Length < 2 || word.Length > 20) return Results.BadRequest(new { error = "Invalid word" });

    var exists = await db.BannedWords.AnyAsync(b => b.Word == word);
    if (!exists)
    {
        db.BannedWords.Add(new BannedWord { Word = word, BannedById = userId.Value });
    }
    // Also clear all votes for this word
    var votes = await db.WordVotes.Where(v => v.Word == word).ToListAsync();
    db.WordVotes.RemoveRange(votes);
    await db.SaveChangesAsync();
    return Results.Ok(new { word, banned = true });
}).RequireAuthorization();
```

- [ ] **Step 5: Add DELETE /api/admin/banned-words/{word} (unban)**

```csharp
app.MapDelete("/api/admin/banned-words/{word}", async (string word, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();

    var normalized = word.Trim().ToUpperInvariant();
    var entry = await db.BannedWords.FirstOrDefaultAsync(b => b.Word == normalized);
    if (entry == null) return Results.NotFound();

    db.BannedWords.Remove(entry);
    await db.SaveChangesAsync();
    return Results.Ok();
}).RequireAuthorization();
```

- [ ] **Step 6: Add DELETE /api/admin/word-votes/{word} (dismiss)**

```csharp
app.MapDelete("/api/admin/word-votes/{word}", async (string word, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();

    var normalized = word.Trim().ToUpperInvariant();
    var votes = await db.WordVotes.Where(v => v.Word == normalized).ToListAsync();
    db.WordVotes.RemoveRange(votes);
    await db.SaveChangesAsync();
    return Results.Ok(new { dismissed = votes.Count });
}).RequireAuthorization();
```

- [ ] **Step 7: Verify build**

Run: `cd WordPlay && dotnet build`
Expected: Build succeeded.

- [ ] **Step 8: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: add banned words and admin vote review API endpoints"
```

---

### Task 4: Client — load banned words and filter levels

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:341` (globals), `app.js:419` (recompute), `app.js:7336` (init)

- [ ] **Step 1: Add globals**

After `let DEFINITIONS = null;` (line 341), add:

```javascript
let _bannedWords = new Set();
let _myWordVotes = new Set();
```

- [ ] **Step 2: Add loadBannedWords function**

After `loadDefinitions()` (around line 7293), add:

```javascript
async function loadBannedWords() {
    try {
        const cached = localStorage.getItem("wordplay-banned");
        if (cached) {
            const { words, ts } = JSON.parse(cached);
            if (Date.now() - ts < 3600000) { // 1 hour TTL
                _bannedWords = new Set(words);
                return;
            }
        }
        const resp = await fetch('/api/banned-words');
        if (resp.ok) {
            const words = await resp.json();
            _bannedWords = new Set(words);
            localStorage.setItem("wordplay-banned", JSON.stringify({ words, ts: Date.now() }));
        }
    } catch (e) { /* offline, no cache — no filtering */ }
}
```

- [ ] **Step 3: Add loadMyVotes function**

After `loadBannedWords`, add:

```javascript
async function loadMyVotes() {
    if (typeof isSignedIn !== "function" || !isSignedIn()) return;
    try {
        const resp = await fetch('/api/word-votes/mine', { headers: getAuthHeaders() });
        if (resp.ok) {
            const words = await resp.json();
            _myWordVotes = new Set(words);
        }
    } catch (e) { /* offline — votes unavailable */ }
}
```

- [ ] **Step 4: Call loadBannedWords in init() — awaited before recompute**

In `init()`, find `await recompute();` (line 7336). Add BEFORE it:

```javascript
    await loadBannedWords();
```

- [ ] **Step 5: Call loadMyVotes in init() — non-blocking, after auth**

In `init()`, after the auth/sync block (around line 7334, after the `syncPull` section closes), add:

```javascript
    loadMyVotes(); // non-blocking — only affects definition modal UI
```

- [ ] **Step 6: Filter level.words in recompute()**

In `recompute()`, find `level = lvData;` (line 415). Add after it:

```javascript
    // Filter banned words from level data
    if (_bannedWords.size > 0) {
        const unfilteredWords = level.words;
        level.words = level.words.filter(w => !_bannedWords.has(w));
        if (level.words.length < 2) level.words = unfilteredWords; // safety fallback
        if (level.bonus) level.bonus = level.bonus.filter(w => !_bannedWords.has(w));
    }
```

- [ ] **Step 7: Filter bonusFound against banned words in restoreLevelState**

In `restoreLevelState()`, after `state.bonusFound = (ip.bf || []).filter(w => !placedWords.includes(w));`, add:

```javascript
        if (_bannedWords.size > 0) state.bonusFound = state.bonusFound.filter(w => !_bannedWords.has(w));
```

This prevents ghost entries in the bonus word count for words that were found before being banned.

- [ ] **Step 8: Verify the filtering works**

Open app, open DevTools console. Set `_bannedWords = new Set(["SOME_WORD"])` where SOME_WORD is a word in the current level. Navigate to that level — the word should not appear in the grid.

- [ ] **Step 9: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: load banned words list and filter from levels at runtime"
```

---

### Task 5: Client — flag button in definition modal

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:2676-2715` (showDefinition function)
- Modify: `WordPlay/wwwroot/css/app.css` (flag button styles)

- [ ] **Step 1: Update showDefinition to include flag button**

Replace the modal innerHTML in `showDefinition()` (the template literal starting around line 2694). The full updated function:

Find the Close button HTML in showDefinition:

```javascript
            <button class="modal-next-btn" id="def-close-btn"
```

Add BEFORE the Close button:

```javascript
            ${typeof isSignedIn === "function" && isSignedIn() ? `
                <button class="def-flag-btn ${_myWordVotes.has(word) ? 'flagged' : ''}" id="def-flag-btn"
                    data-word="${word}">
                    🚩 ${_myWordVotes.has(word) ? 'Flagged' : 'Flag for Review'}
                </button>
            ` : ''}
```

- [ ] **Step 2: Add flag button click handler**

After the existing close handlers in showDefinition (after the `overlay.onclick` line), add:

```javascript
    const flagBtn = document.getElementById("def-flag-btn");
    if (flagBtn) {
        flagBtn.onclick = async () => {
            const w = flagBtn.dataset.word;
            const isFlagged = _myWordVotes.has(w);
            try {
                if (isFlagged) {
                    const resp = await fetch('/api/word-votes/' + encodeURIComponent(w), {
                        method: 'DELETE', headers: getAuthHeaders()
                    });
                    if (resp.ok) {
                        _myWordVotes.delete(w);
                        flagBtn.className = 'def-flag-btn';
                        flagBtn.textContent = '🚩 Flag for Review';
                    }
                } else {
                    const resp = await fetch('/api/word-votes', {
                        method: 'POST',
                        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                        body: JSON.stringify({ word: w })
                    });
                    if (resp.ok || resp.status === 409) {
                        _myWordVotes.add(w);
                        flagBtn.className = 'def-flag-btn flagged';
                        flagBtn.textContent = '🚩 Flagged';
                    }
                }
            } catch (e) {
                showToast("Couldn't save vote", "rgba(255,255,255,0.5)", true);
            }
        };
    }
```

- [ ] **Step 3: Add CSS for flag button**

Add to `app.css` after the existing definition modal styles:

```css
/* Flag button in definition modal */
.def-flag-btn { display: block; width: 100%; margin-top: 12px; padding: 8px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; color: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
.def-flag-btn:hover { border-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.7); }
.def-flag-btn.flagged { background: rgba(255,80,80,0.15); border-color: rgba(255,80,80,0.4); color: #ff6b6b; }
```

- [ ] **Step 4: Test the flag button**

Sign in, open a level, find a word, tap a non-intersection cell. The definition modal should show:
- "🚩 Flag for Review" button below definitions
- Tapping it should change to "🚩 Flagged" with red highlight
- Tapping again should toggle back
- Reloading and opening the same word should show the saved state

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: add flag button to definition modal for word voting"
```

---

### Task 6: Admin panel — flagged words section

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js:5491` (renderAdmin function)
- Modify: `WordPlay/wwwroot/css/app.css` (admin flagged words styles)

- [ ] **Step 1: Add "Flagged Words" view option to admin panel**

In `renderAdmin()` (line 5491), after the `_adminView === "rabbits"` check (line 5511), add:

```javascript
    if (_adminView === "flagged-words") {
        renderAdminFlaggedWords(overlay);
        return;
    }
```

- [ ] **Step 2: Add button to admin toolbar**

In `renderAdmin()`, find the admin toolbar div (around line 5525). Add a new button after the existing ones:

Find:
```javascript
                <button class="menu-setting-btn" id="admin-migrate-v8-btn"
```

Add before it:
```javascript
                <button class="menu-setting-btn" id="admin-flagged-btn" style="background:rgba(255,80,80,0.25);color:#ff6b6b;white-space:nowrap;padding:8px 12px;border:1px solid rgba(255,80,80,0.4);font-size:13px">🚩 Flagged</button>
```

- [ ] **Step 3: Wire up the button click handler**

In `renderAdmin()`, after the existing button handlers (after the rabbits button handler), add:

```javascript
    const flaggedBtn = document.getElementById("admin-flagged-btn");
    if (flaggedBtn) {
        flaggedBtn.onclick = () => {
            _adminView = "flagged-words";
            renderAdmin();
        };
    }
```

- [ ] **Step 4: Create renderAdminFlaggedWords function**

Add after `renderAdminRabbits()` (around line 5989):

```javascript
async function renderAdminFlaggedWords(overlay) {
    const accent = theme.accent;
    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="admin-flagged-back" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${accent}">🚩 Flagged Words</h2>
        </div>
        <div class="menu-scroll" id="flagged-content">
            <div style="text-align:center;padding:30px;opacity:0.5">Loading...</div>
        </div>
    `;

    document.getElementById("admin-flagged-back").onclick = () => {
        _adminView = "users";
        renderAdmin();
    };

    // Fetch both flagged votes and banned words
    try {
        const [votesResp, bannedResp] = await Promise.all([
            fetch('/api/admin/word-votes', { headers: getAuthHeaders() }),
            fetch('/api/admin/banned-words', { headers: getAuthHeaders() })
        ]);
        const votes = votesResp.ok ? await votesResp.json() : [];
        const banned = bannedResp.ok ? await bannedResp.json() : [];

        let html = '';

        // Flagged words section
        if (votes.length > 0) {
            html += `<div class="menu-setting"><label class="menu-setting-label">Words Flagged by Players</label></div>`;
            for (const v of votes) {
                const def = DEFINITIONS && DEFINITIONS[v.word] ? DEFINITIONS[v.word].d[0] : 'No definition';
                const truncDef = def.length > 60 ? def.substring(0, 57) + '...' : def;
                html += `
                    <div class="flagged-word-row">
                        <div class="flagged-word-info">
                            <span class="flagged-word-name">${v.word}</span>
                            <span class="flagged-word-votes">${v.votes} vote${v.votes !== 1 ? 's' : ''}</span>
                            <div class="flagged-word-def">${truncDef}</div>
                        </div>
                        <div class="flagged-word-actions">
                            <button class="flagged-ban-btn" data-word="${v.word}">Ban</button>
                            <button class="flagged-dismiss-btn" data-word="${v.word}">Dismiss</button>
                        </div>
                    </div>
                `;
            }
        } else {
            html += `<div style="text-align:center;padding:30px;opacity:0.5">No flagged words</div>`;
        }

        // Banned words section
        html += `<div class="menu-setting" style="margin-top:20px"><label class="menu-setting-label">Banned Words</label></div>`;
        if (banned.length > 0) {
            for (const b of banned) {
                const date = new Date(b.bannedAt).toLocaleDateString();
                html += `
                    <div class="flagged-word-row">
                        <div class="flagged-word-info">
                            <span class="flagged-word-name">${b.word}</span>
                            <div class="flagged-word-def">Banned ${date}</div>
                        </div>
                        <div class="flagged-word-actions">
                            <button class="flagged-unban-btn" data-word="${b.word}">Unban</button>
                        </div>
                    </div>
                `;
            }
        } else {
            html += `<div style="text-align:center;padding:20px;opacity:0.5">No banned words</div>`;
        }

        document.getElementById("flagged-content").innerHTML = html;

        // Wire up action buttons
        document.querySelectorAll(".flagged-ban-btn").forEach(btn => {
            btn.onclick = async () => {
                const resp = await fetch('/api/admin/banned-words', {
                    method: 'POST',
                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word: btn.dataset.word })
                });
                if (resp.ok) {
                    showToast("Banned: " + btn.dataset.word, "#ff6b6b");
                    _bannedWords.add(btn.dataset.word);
                    _myWordVotes.delete(btn.dataset.word); // vote was deleted server-side
                    localStorage.removeItem("wordplay-banned"); // force refresh
                    renderAdminFlaggedWords(overlay);
                }
            };
        });

        document.querySelectorAll(".flagged-dismiss-btn").forEach(btn => {
            btn.onclick = async () => {
                const resp = await fetch('/api/admin/word-votes/' + encodeURIComponent(btn.dataset.word), {
                    method: 'DELETE', headers: getAuthHeaders()
                });
                if (resp.ok) {
                    showToast("Dismissed votes for: " + btn.dataset.word);
                    renderAdminFlaggedWords(overlay);
                }
            };
        });

        document.querySelectorAll(".flagged-unban-btn").forEach(btn => {
            btn.onclick = async () => {
                const resp = await fetch('/api/admin/banned-words/' + encodeURIComponent(btn.dataset.word), {
                    method: 'DELETE', headers: getAuthHeaders()
                });
                if (resp.ok) {
                    showToast("Unbanned: " + btn.dataset.word, accent);
                    _bannedWords.delete(btn.dataset.word);
                    localStorage.removeItem("wordplay-banned");
                    renderAdminFlaggedWords(overlay);
                }
            };
        });

    } catch (e) {
        document.getElementById("flagged-content").innerHTML =
            '<div style="text-align:center;padding:30px;color:#ff6b6b">Failed to load flagged words</div>';
    }
}
```

- [ ] **Step 5: Add CSS styles for flagged words admin section**

Add to `app.css`:

```css
/* Admin flagged words */
.flagged-word-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.flagged-word-info { flex: 1; min-width: 0; }
.flagged-word-name { font-weight: 700; font-size: 15px; color: #fff; margin-right: 8px; }
.flagged-word-votes { font-size: 13px; color: #ff6b6b; font-weight: 600; }
.flagged-word-def { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.flagged-word-actions { display: flex; gap: 6px; flex-shrink: 0; margin-left: 8px; }
.flagged-ban-btn, .flagged-dismiss-btn, .flagged-unban-btn { padding: 5px 10px; border-radius: 8px; border: none; font-size: 14px; cursor: pointer; font-weight: 600; }
.flagged-ban-btn { background: rgba(255,80,80,0.2); color: #ff6b6b; border: 1px solid rgba(255,80,80,0.4); }
.flagged-dismiss-btn { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.15); }
.flagged-unban-btn { background: rgba(80,200,120,0.2); color: #50c878; border: 1px solid rgba(80,200,120,0.4); }
```

- [ ] **Step 6: Test the admin panel**

Sign in as admin, open Settings → Admin Panel → click "🚩 Flagged" button. Should show:
- Flagged words list (empty initially)
- Banned words list (empty initially)
- Back button returns to user list

To test with data: use another account to flag a word, then check admin panel.

- [ ] **Step 7: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: add flagged words admin panel section"
```

---

### Task 7: Update guide, docs, and version bump

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (GUIDE_SECTIONS, APP_VERSION)
- Modify: `WordPlay/wwwroot/sw.js` (CACHE_NAME, ?v=)
- Modify: `WordPlay/wwwroot/index.html` (?v=)
- Modify: `README.md`

- [ ] **Step 1: Add guide section**

In `GUIDE_SECTIONS`, after the "Word Definitions" entry, add:

```javascript
    { icon: "🚩", title: "Flag a Word", body: "Think a word is too obscure? When viewing a word\u2019s definition, tap <b>Flag for Review</b> to vote for its removal. Flagged words are reviewed by the game\u2019s administrators. You must be signed in to flag words." },
```

- [ ] **Step 2: Update README.md**

Add a brief mention after the Word Definitions section:

```markdown
### Word Flagging

Signed-in players can flag words as too hard from the definition modal. Administrators review flagged words in the admin panel and can ban them — banned words are filtered from all levels at runtime without modifying level data files. Bans are reversible.
```

- [ ] **Step 3: Bump versions**

Check current values and increment:
- `APP_VERSION` in `app.js`: increment (e.g., "1.5.0" → "1.6.0")
- `CACHE_NAME` in `sw.js`: increment (e.g., "wordplay-v106" → "wordplay-v107")
- `?v=` in `sw.js` ASSETS and `index.html`: increment all to match

- [ ] **Step 4: End-to-end verification**

1. Sign in as regular user
2. Find a word, tap non-intersection cell → definition modal appears
3. Tap "🚩 Flag for Review" → changes to "🚩 Flagged"
4. Reload → open same word → still shows "🚩 Flagged"
5. Tap again → toggles back to unflagged
6. Sign in as admin → Settings → Admin Panel → 🚩 Flagged
7. See the flagged word with vote count
8. Tap "Ban" → word disappears from flagged list, appears in banned list
9. Navigate to a level containing the banned word → word is gone from grid
10. Admin taps "Unban" → word reappears in levels after reload
11. Check Player Guide → "Flag a Word" section appears
12. Sign out → definition modal shows NO flag button

- [ ] **Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html README.md
git commit -m "chore: add flag guide section, update docs, bump version for word voting"
```
