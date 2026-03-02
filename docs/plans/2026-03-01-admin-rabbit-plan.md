# Admin Panel & Rabbit System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add role-based admin capabilities and a generalized "rabbit" pacing system that replaces the hardcoded Fast Eddie logic.

**Architecture:** Server-side role column on Users table with JWT role claims. New RabbitAssignments table for dynamic pacing. Admin-only API endpoints gated by role claim. In-app admin UI accessible from Settings menu for admin users only.

**Tech Stack:** ASP.NET 8 minimal API, EF Core + SQL Server, vanilla JS frontend, JWT auth

---

### Task 1: Add Role column to User model

**Files:**
- Modify: `WordPlay/Models/User.cs`

**Step 1: Add Role property**

Add after `ShowOnLeaderboard` (line 10):

```csharp
public string Role { get; set; } = "user";             // "user", "admin", or "bot"
```

**Step 2: Commit**

```bash
git add WordPlay/Models/User.cs
git commit -m "feat: add Role column to User model"
```

---

### Task 2: Add RabbitAssignment model

**Files:**
- Create: `WordPlay/Models/RabbitAssignment.cs`

**Step 1: Create model file**

```csharp
namespace WordPlay.Models;

public class RabbitAssignment
{
    public int Id { get; set; }
    public int BotUserId { get; set; }
    public User BotUser { get; set; } = null!;
    public int TargetUserId { get; set; }
    public User TargetUser { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

**Step 2: Commit**

```bash
git add WordPlay/Models/RabbitAssignment.cs
git commit -m "feat: add RabbitAssignment model"
```

---

### Task 3: Update DbContext with Role config and RabbitAssignments

**Files:**
- Modify: `WordPlay/Data/WordPlayDb.cs`

**Step 1: Add DbSet and configuration**

Add DbSet after `UserProgress` (line 11):

```csharp
public DbSet<RabbitAssignment> RabbitAssignments => Set<RabbitAssignment>();
```

Add inside `OnModelCreating`, in the User entity config (after line 22):

```csharp
e.Property(u => u.Role).HasMaxLength(10).HasDefaultValue("user");
```

Add after the `UserProgress` entity config block (after line 31):

```csharp
modelBuilder.Entity<RabbitAssignment>(e =>
{
    e.HasOne(r => r.BotUser).WithMany().HasForeignKey(r => r.BotUserId).OnDelete(DeleteBehavior.NoAction);
    e.HasOne(r => r.TargetUser).WithMany().HasForeignKey(r => r.TargetUserId).OnDelete(DeleteBehavior.NoAction);
    e.HasIndex(r => new { r.TargetUserId, r.IsActive });
});
```

**Step 2: Commit**

```bash
git add WordPlay/Data/WordPlayDb.cs
git commit -m "feat: add RabbitAssignments DbSet and Role column config"
```

---

### Task 4: Create EF Core migration

**Step 1: Generate migration**

Run from `WordPlay/` directory:

```bash
dotnet ef migrations add AddRolesAndRabbits
```

Expected: New migration files in `WordPlay/Migrations/` with `AddColumn` for `Role` and `CreateTable` for `RabbitAssignments`.

**Step 2: Add seed data SQL to the migration**

Open the generated migration's `Up` method and append after the auto-generated code:

```csharp
// Seed: Word Dog (ID 1) → admin
migrationBuilder.Sql("UPDATE Users SET Role = 'admin' WHERE Id = 1");

// Seed: Fast Eddie (ID 9) → bot
migrationBuilder.Sql("UPDATE Users SET Role = 'bot', Provider = 'bot', ProviderSubject = 'eddie-bot', Email = NULL WHERE Id = 9");

// Seed: Assign Eddie as rabbit for Bridget (user 7)
migrationBuilder.Sql("INSERT INTO RabbitAssignments (BotUserId, TargetUserId, IsActive, CreatedAt) VALUES (9, 7, 1, GETUTCDATE())");
```

**Step 3: Verify migration compiles**

```bash
dotnet build
```

Expected: Build succeeded.

**Step 4: Commit**

```bash
git add WordPlay/Migrations/
git commit -m "feat: add migration for roles and rabbit assignments with seed data"
```

---

### Task 5: Add Role claim to JWT

**Files:**
- Modify: `WordPlay/Services/AuthService.cs:67-78`
- Modify: `WordPlay/Program.cs:25-29` (GetUserId helper area)

**Step 1: Update IssueJwt to accept role**

Change `IssueJwt` in `AuthService.cs` (line 67) from:

```csharp
public string IssueJwt(int userId)
```

to:

```csharp
public string IssueJwt(int userId, string role = "user")
```

Change the claims array (line 74) from:

```csharp
claims: new[] { new Claim("uid", userId.ToString()) },
```

to:

```csharp
claims: new[] { new Claim("uid", userId.ToString()), new Claim("role", role) },
```

**Step 2: Pass role from auth endpoints**

In `Program.cs`, update the Google auth endpoint (line 265):

```csharp
var jwt = auth.IssueJwt(user.Id, user.Role);
```

Update the Microsoft auth endpoint (line 290):

```csharp
var jwt = auth.IssueJwt(user.Id, user.Role);
```

**Step 3: Add GetUserRole helper**

In `Program.cs`, after `GetUserId` (line 29), add:

```csharp
string? GetUserRole(ClaimsPrincipal principal)
{
    return principal.FindFirst("role")?.Value;
}
```

**Step 4: Reject bot sign-in**

In `Program.cs`, in `UpsertUser` (after line 205, after the existing user is found):

```csharp
if (user.Role == "bot")
    throw new InvalidOperationException("Bot accounts cannot sign in");
```

**Step 5: Verify build**

```bash
dotnet build
```

**Step 6: Commit**

```bash
git add WordPlay/Services/AuthService.cs WordPlay/Program.cs
git commit -m "feat: add role claim to JWT, reject bot sign-in"
```

---

### Task 6: Add admin role to auth response

**Files:**
- Modify: `WordPlay/Program.cs` (Google and Microsoft auth response objects)

**Step 1: Include role in auth response**

Update Google auth response (line 267-270) from:

```csharp
return Results.Ok(new
{
    token = jwt,
    user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard }
});
```

to:

```csharp
return Results.Ok(new
{
    token = jwt,
    user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role }
});
```

Do the same for the Microsoft auth response (~line 291).

**Step 2: Update set-name response to include Role**

Update `set-name` endpoint response (line 324):

```csharp
return Results.Ok(new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role });
```

**Step 3: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: include role in auth API responses"
```

---

### Task 7: Store role in client auth state

**Files:**
- Modify: `WordPlay/wwwroot/js/auth.js`

**Step 1: Update _saveAuth and setDisplayName to store role**

In `auth.js`, the `_authState` already stores the full user object. The `setDisplayName` function (line 146) needs role added:

```javascript
_authState.user = { id: data.Id || data.id, displayName: data.DisplayName || data.displayName, email: data.Email || data.email, showOnLeaderboard: data.ShowOnLeaderboard ?? data.showOnLeaderboard ?? true, role: data.Role || data.role || "user" };
```

**Step 2: Add isAdmin helper**

After `getAuthHeaders` (line 41), add:

```javascript
function isAdmin() {
    return _authState && _authState.user && _authState.user.role === "admin";
}
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/auth.js
git commit -m "feat: store role in client auth state, add isAdmin helper"
```

---

### Task 8: Replace hardcoded Eddie pacing with dynamic rabbit lookup

**Files:**
- Modify: `WordPlay/Program.cs:72-74` (pacing config)
- Modify: `WordPlay/Program.cs:444-518` (Eddie pacing block)

**Step 1: Remove hardcoded pacing config**

Delete lines 72-74:

```csharp
// --- Pacing config ---
var pacingBridgetId = builder.Configuration.GetValue<int>("Pacing:BridgetUserId");
var pacingEddieId = builder.Configuration.GetValue<int>("Pacing:EddieUserId");
```

**Step 2: Replace the entire Eddie pacing block**

Replace the block at lines 444-518 (`// --- Auto-pace Fast Eddie ---` through the closing `}`) with dynamic rabbit pacing:

```csharp
// --- Auto-pace rabbits ---
var rabbitAssignments = await db.RabbitAssignments
    .Where(r => r.TargetUserId == userId && r.IsActive)
    .ToListAsync();

foreach (var assignment in rabbitAssignments)
{
    var rabbit = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == assignment.BotUserId);
    if (rabbit == null) continue;

    // Monthly rollover for rabbit
    var rabbitMonth = CentralMonth();
    if (rabbit.CurrentMonth != rabbitMonth)
    {
        rabbit.MonthlyStart = rabbit.HighestLevel;
        rabbit.MonthlyCoinsStart = rabbit.TotalCoinsEarned;
        rabbit.CurrentMonth = rabbitMonth;
    }

    // Deterministic random: stable for a given day+level+bot, shifts as target advances
    var seed = DateTime.UtcNow.DayOfYear * 1000 + highestLevel + assignment.BotUserId;
    var rng = new Random(seed);

    // Level gap distribution
    var roll = rng.NextDouble();
    int gap;
    if (roll < 0.08)         // 8%: target ties or briefly leads
        gap = rng.Next(-1, 1);
    else if (roll < 0.25)    // 17%: close race
        gap = rng.Next(1, 3);
    else                     // 75%: rabbit's comfortable lead
        gap = rng.Next(3, 9);

    var targetLevel = highestLevel + gap;

    // Ensure rabbit stays ahead on the monthly leaderboard
    var userMonthlyGain = highestLevel - progress.MonthlyStart;
    var rabbitMonthlyGain = rabbit.HighestLevel - rabbit.MonthlyStart;
    if (rabbitMonthlyGain <= userMonthlyGain)
    {
        var monthlyTarget = rabbit.MonthlyStart + userMonthlyGain + Math.Max(gap, 1);
        targetLevel = Math.Max(targetLevel, monthlyTarget);
    }

    // Only bump UP — never decrease rabbit's level
    if (targetLevel > rabbit.HighestLevel)
    {
        var levelIncrease = targetLevel - rabbit.HighestLevel;
        var coinsPerLevel = rng.Next(6, 17);
        var coinBonus = rng.Next(50, 301);
        var targetCoins = Math.Max(
            rabbit.TotalCoinsEarned + levelIncrease * coinsPerLevel + coinBonus,
            totalCoinsEarned + rng.Next(50, 301));

        // Ensure rabbit stays ahead on monthly coins leaderboard
        var userMonthlyCoins = totalCoinsEarned - progress.MonthlyCoinsStart;
        var rabbitMonthlyCoins = targetCoins - rabbit.MonthlyCoinsStart;
        if (rabbitMonthlyCoins <= userMonthlyCoins)
            targetCoins = rabbit.MonthlyCoinsStart + userMonthlyCoins + rng.Next(50, 301);

        // Update ProgressJson fields
        var rabbitNode = JsonNode.Parse(rabbit.ProgressJson ?? "{}")?.AsObject()
            ?? new JsonObject();
        rabbitNode["hl"] = targetLevel;
        rabbitNode["lc"] = targetLevel;
        rabbitNode["tce"] = targetCoins;
        rabbitNode["cl"] = targetLevel;

        rabbit.ProgressJson = rabbitNode.ToJsonString();
        rabbit.HighestLevel = targetLevel;
        rabbit.LevelsCompleted = targetLevel;
        rabbit.TotalCoinsEarned = targetCoins;
        rabbit.UpdatedAt = DateTime.UtcNow;
    }
}

if (rabbitAssignments.Count > 0)
    await db.SaveChangesAsync();
```

**Step 3: Remove Pacing config from appsettings.json**

In `WordPlay/appsettings.json`, delete:

```json
"Pacing": {
    "BridgetUserId": 7,
    "EddieUserId": 9
},
```

**Step 4: Verify build**

```bash
dotnet build
```

**Step 5: Commit**

```bash
git add WordPlay/Program.cs WordPlay/appsettings.json
git commit -m "feat: replace hardcoded Eddie pacing with dynamic rabbit assignments"
```

---

### Task 9: Add admin API endpoints — user management

**Files:**
- Modify: `WordPlay/Program.cs` (add endpoints before static files section)

**Step 1: Add admin user list endpoint**

Insert before the `// Static files` section (before line 677):

```csharp
// ============================================================
// Admin endpoints (require admin role)
// ============================================================

app.MapGet("/api/admin/users", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();

    var users = await db.Users
        .GroupJoin(db.UserProgress, u => u.Id, p => p.UserId, (u, ps) => new { u, p = ps.FirstOrDefault() })
        .Select(x => new
        {
            id = x.u.Id,
            displayName = x.u.DisplayName,
            email = x.u.Email,
            role = x.u.Role,
            showOnLeaderboard = x.u.ShowOnLeaderboard,
            provider = x.u.Provider,
            lastLoginAt = x.u.LastLoginAt,
            highestLevel = x.p != null ? x.p.HighestLevel : 0,
            totalCoinsEarned = x.p != null ? x.p.TotalCoinsEarned : 0,
            monthlyGain = x.p != null ? x.p.HighestLevel - x.p.MonthlyStart : 0,
        })
        .OrderByDescending(x => x.highestLevel)
        .ToListAsync();

    return Results.Ok(users);
}).RequireAuthorization();
```

**Step 2: Add update user role endpoint**

```csharp
app.MapPut("/api/admin/users/{id}/role", async (int id, HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("role", out var roleEl)) return Results.BadRequest(new { error = "role required" });
    var role = roleEl.GetString();
    if (role != "user" && role != "admin" && role != "bot") return Results.BadRequest(new { error = "Invalid role" });

    var user = await db.Users.FindAsync(id);
    if (user == null) return Results.NotFound();
    user.Role = role;
    await db.SaveChangesAsync();
    return Results.Ok(new { user.Id, user.Role });
}).RequireAuthorization();
```

**Step 3: Add update user progress endpoint**

```csharp
app.MapPut("/api/admin/users/{id}/progress", async (int id, HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);

    var user = await db.Users.FindAsync(id);
    if (user == null) return Results.NotFound();

    var progress = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == id);
    if (progress == null)
    {
        progress = new UserProgress { UserId = id };
        db.UserProgress.Add(progress);
    }

    if (body.TryGetProperty("highestLevel", out var hlEl)) progress.HighestLevel = hlEl.GetInt32();
    if (body.TryGetProperty("totalCoinsEarned", out var tceEl)) progress.TotalCoinsEarned = tceEl.GetInt32();
    if (body.TryGetProperty("coins", out var coEl))
    {
        var node = JsonNode.Parse(progress.ProgressJson ?? "{}")?.AsObject() ?? new JsonObject();
        node["co"] = coEl.GetInt32();
        progress.ProgressJson = node.ToJsonString();
    }
    if (body.TryGetProperty("freeHints", out var fhEl))
    {
        var node = JsonNode.Parse(progress.ProgressJson ?? "{}")?.AsObject() ?? new JsonObject();
        node["fh"] = fhEl.GetInt32();
        progress.ProgressJson = node.ToJsonString();
    }
    if (body.TryGetProperty("freeTargets", out var ftEl))
    {
        var node = JsonNode.Parse(progress.ProgressJson ?? "{}")?.AsObject() ?? new JsonObject();
        node["ft"] = ftEl.GetInt32();
        progress.ProgressJson = node.ToJsonString();
    }
    if (body.TryGetProperty("freeRockets", out var frEl))
    {
        var node = JsonNode.Parse(progress.ProgressJson ?? "{}")?.AsObject() ?? new JsonObject();
        node["fr"] = frEl.GetInt32();
        progress.ProgressJson = node.ToJsonString();
    }

    // Sync denormalized JSON fields
    var pNode = JsonNode.Parse(progress.ProgressJson ?? "{}")?.AsObject() ?? new JsonObject();
    pNode["hl"] = progress.HighestLevel;
    pNode["lc"] = progress.HighestLevel;
    pNode["tce"] = progress.TotalCoinsEarned;
    pNode["cl"] = progress.HighestLevel;
    progress.ProgressJson = pNode.ToJsonString();
    progress.LevelsCompleted = progress.HighestLevel;
    progress.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok(new { progress.HighestLevel, progress.TotalCoinsEarned });
}).RequireAuthorization();
```

**Step 4: Add user visibility and delete endpoints**

```csharp
app.MapPut("/api/admin/users/{id}/visibility", async (int id, HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("show", out var showEl)) return Results.BadRequest(new { error = "show required" });

    var user = await db.Users.FindAsync(id);
    if (user == null) return Results.NotFound();
    user.ShowOnLeaderboard = showEl.GetBoolean();
    await db.SaveChangesAsync();
    return Results.Ok(new { user.ShowOnLeaderboard });
}).RequireAuthorization();

app.MapDelete("/api/admin/users/{id}", async (int id, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var adminId = GetUserId(principal);
    if (id == adminId) return Results.BadRequest(new { error = "Cannot delete yourself" });

    var user = await db.Users.FindAsync(id);
    if (user == null) return Results.NotFound();

    // Delete progress and rabbit assignments first
    var progress = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == id);
    if (progress != null) db.UserProgress.Remove(progress);
    var assignments = await db.RabbitAssignments.Where(r => r.BotUserId == id || r.TargetUserId == id).ToListAsync();
    db.RabbitAssignments.RemoveRange(assignments);
    db.Users.Remove(user);
    await db.SaveChangesAsync();
    return Results.Ok(new { deleted = true });
}).RequireAuthorization();
```

**Step 5: Verify build**

```bash
dotnet build
```

**Step 6: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: add admin user management API endpoints"
```

---

### Task 10: Add admin API endpoints — bot creation and rabbit management

**Files:**
- Modify: `WordPlay/Program.cs` (append after user management endpoints)

**Step 1: Add bot creation endpoint**

```csharp
app.MapPost("/api/admin/bots", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("displayName", out var nameEl))
        return Results.BadRequest(new { error = "displayName required" });

    var name = nameEl.GetString()?.Trim() ?? "";
    if (name.Length < 3 || name.Length > 20)
        return Results.BadRequest(new { error = "Name must be 3-20 characters" });

    var bot = new User
    {
        Provider = "bot",
        ProviderSubject = $"bot-{Guid.NewGuid():N}",
        DisplayName = name,
        Role = "bot",
        ShowOnLeaderboard = true,
    };
    db.Users.Add(bot);
    await db.SaveChangesAsync();

    // Create empty progress record
    db.UserProgress.Add(new UserProgress { UserId = bot.Id });
    await db.SaveChangesAsync();

    return Results.Ok(new { bot.Id, bot.DisplayName, bot.Role });
}).RequireAuthorization();
```

**Step 2: Add rabbit assignment endpoints**

```csharp
app.MapGet("/api/admin/rabbits", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();

    var assignments = await db.RabbitAssignments
        .Include(r => r.BotUser)
        .Include(r => r.TargetUser)
        .Select(r => new
        {
            id = r.Id,
            botUserId = r.BotUserId,
            botName = r.BotUser.DisplayName,
            targetUserId = r.TargetUserId,
            targetName = r.TargetUser.DisplayName,
            isActive = r.IsActive,
            createdAt = r.CreatedAt,
        })
        .ToListAsync();

    return Results.Ok(assignments);
}).RequireAuthorization();

app.MapPost("/api/admin/rabbits", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("botUserId", out var botEl) || !body.TryGetProperty("targetUserId", out var targetEl))
        return Results.BadRequest(new { error = "botUserId and targetUserId required" });

    var botId = botEl.GetInt32();
    var targetId = targetEl.GetInt32();

    // Validate bot exists and has bot role
    var bot = await db.Users.FindAsync(botId);
    if (bot == null || bot.Role != "bot") return Results.BadRequest(new { error = "Invalid bot user" });

    // Validate target exists
    var target = await db.Users.FindAsync(targetId);
    if (target == null) return Results.BadRequest(new { error = "Target user not found" });

    // Check for existing active assignment for this target
    var existing = await db.RabbitAssignments.FirstOrDefaultAsync(
        r => r.TargetUserId == targetId && r.IsActive);
    if (existing != null)
        return Results.BadRequest(new { error = "Target already has an active rabbit. Remove it first." });

    var assignment = new RabbitAssignment { BotUserId = botId, TargetUserId = targetId };
    db.RabbitAssignments.Add(assignment);
    await db.SaveChangesAsync();

    return Results.Ok(new { assignment.Id, assignment.BotUserId, assignment.TargetUserId });
}).RequireAuthorization();

app.MapDelete("/api/admin/rabbits/{id}", async (int id, WordPlayDb db, ClaimsPrincipal principal) =>
{
    if (GetUserRole(principal) != "admin") return Results.Forbid();
    var assignment = await db.RabbitAssignments.FindAsync(id);
    if (assignment == null) return Results.NotFound();
    db.RabbitAssignments.Remove(assignment);
    await db.SaveChangesAsync();
    return Results.Ok(new { deleted = true });
}).RequireAuthorization();
```

**Step 3: Verify build**

```bash
dotnet build
```

**Step 4: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: add bot creation and rabbit management API endpoints"
```

---

### Task 11: Add Admin button to Settings menu

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (renderMenu function)

**Step 1: Add Admin button in renderMenu**

In `renderMenu()`, after the "Contact Support" button section (after line 3412 `</div>`), before the closing `</div>` of `menu-scroll`, add:

```javascript
// Admin panel (visible only to admins)
if (typeof isAdmin === "function" && isAdmin()) {
    html += `
        <div class="menu-setting">
            <label class="menu-setting-label">Administration</label>
            <button class="menu-setting-btn" id="admin-panel-btn" style="background:linear-gradient(135deg,#ff6b35,#d63384);color:#fff;width:100%;padding:10px 0;font-size:14px;border:none">Admin Panel</button>
        </div>
    `;
}
```

**Step 2: Wire up Admin button handler**

In the event handlers section of renderMenu, after the contact-support-btn handler (after line 3697), add:

```javascript
const adminPanelBtn = document.getElementById("admin-panel-btn");
if (adminPanelBtn) {
    adminPanelBtn.onclick = () => {
        state.showMenu = false;
        state.showAdmin = true;
        renderMenu();
        renderAdmin();
    };
}
```

**Step 3: Add showAdmin state**

Find `resetStateToDefaults` function and add `state.showAdmin = false;` alongside the other show flags.

**Step 4: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add Admin button to Settings menu for admin users"
```

---

### Task 12: Build Admin Panel — User List screen

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add renderAdmin function)
- Modify: `WordPlay/wwwroot/css/app.css` (add admin styles)

**Step 1: Add renderAdmin function**

Add after `renderContact` function (after the closing `}` of renderContact):

```javascript
// ---- ADMIN PANEL ----
let _adminUsers = [];
let _adminSearch = "";
let _adminSelectedUser = null;
let _adminRabbits = [];
let _adminView = "users"; // "users" | "user-detail" | "rabbits"

function renderAdmin() {
    let overlay = document.getElementById("admin-overlay");
    if (!state.showAdmin) {
        if (overlay) overlay.style.display = "none";
        return;
    }
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "admin-overlay";
        document.getElementById("app").appendChild(overlay);
    }
    overlay.className = "menu-overlay";
    overlay.style.display = "flex";

    if (_adminView === "user-detail" && _adminSelectedUser) {
        renderAdminUserDetail(overlay);
        return;
    }
    if (_adminView === "rabbits") {
        renderAdminRabbits(overlay);
        return;
    }

    const accent = theme.accent;
    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="admin-close-btn" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${accent}">Admin Panel</h2>
        </div>
        <div class="menu-scroll">
            <div class="admin-toolbar">
                <input type="text" id="admin-search" class="menu-setting-input" placeholder="Search users..." value="${escapeHtml(_adminSearch)}" style="flex:1">
                <button class="menu-setting-btn" id="admin-create-bot-btn" style="background:${accent};color:#000;white-space:nowrap;padding:8px 12px">+ Bot</button>
                <button class="menu-setting-btn" id="admin-rabbits-btn" style="background:rgba(255,255,255,0.1);white-space:nowrap;padding:8px 12px">Rabbits</button>
            </div>
            <div id="admin-user-list" style="padding:0 4px">
                <div style="text-align:center;padding:30px;opacity:0.5">Loading...</div>
            </div>
        </div>
    `;

    document.getElementById("admin-close-btn").onclick = () => {
        state.showAdmin = false;
        _adminView = "users";
        renderAdmin();
        state.showMenu = true;
        renderMenu();
    };

    document.getElementById("admin-search").oninput = (e) => {
        _adminSearch = e.target.value;
        renderAdminUserList();
    };

    document.getElementById("admin-create-bot-btn").onclick = () => {
        const name = prompt("Bot display name (3-20 chars):");
        if (!name || name.trim().length < 3) return;
        fetch("/api/admin/bots", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ displayName: name.trim() }),
        }).then(r => r.json()).then(() => {
            showToast("Bot created");
            loadAdminUsers();
        }).catch(() => showToast("Failed to create bot", "#ff8888"));
    };

    document.getElementById("admin-rabbits-btn").onclick = () => {
        _adminView = "rabbits";
        renderAdmin();
    };

    loadAdminUsers();
}

function loadAdminUsers() {
    fetch("/api/admin/users", { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(users => {
            _adminUsers = users;
            renderAdminUserList();
        })
        .catch(() => {
            const list = document.getElementById("admin-user-list");
            if (list) list.innerHTML = '<div style="text-align:center;padding:30px;opacity:0.5">Failed to load users</div>';
        });
}

function renderAdminUserList() {
    const list = document.getElementById("admin-user-list");
    if (!list) return;

    const search = _adminSearch.toLowerCase();
    const filtered = _adminUsers.filter(u =>
        !search || (u.displayName || "").toLowerCase().includes(search) || (u.email || "").toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:30px;opacity:0.5">No users found</div>';
        return;
    }

    const roleBadge = (role) => {
        if (role === "admin") return '<span class="admin-badge admin-badge-admin">admin</span>';
        if (role === "bot") return '<span class="admin-badge admin-badge-bot">bot</span>';
        return '';
    };

    list.innerHTML = filtered.map(u => `
        <div class="admin-user-row" data-uid="${u.id}">
            <div class="admin-user-info">
                <div class="admin-user-name">${escapeHtml(u.displayName || "—")} ${roleBadge(u.role)}</div>
                <div class="admin-user-meta">Lv ${u.highestLevel.toLocaleString()} · ${u.totalCoinsEarned.toLocaleString()} pts · +${u.monthlyGain} this mo</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.4;flex-shrink:0"><path d="M9 18l6-6-6-6"/></svg>
        </div>
    `).join("");

    list.querySelectorAll(".admin-user-row").forEach(row => {
        row.onclick = () => {
            const uid = parseInt(row.dataset.uid);
            _adminSelectedUser = _adminUsers.find(u => u.id === uid);
            _adminView = "user-detail";
            renderAdmin();
        };
    });
}
```

**Step 2: Add admin CSS styles**

Append to `WordPlay/wwwroot/css/app.css`:

```css
/* ---- Admin Panel ---- */
.admin-toolbar {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    align-items: center;
}
.admin-user-row {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    cursor: pointer;
    transition: background 0.15s;
}
.admin-user-row:hover { background: rgba(255,255,255,0.05); }
.admin-user-info { flex: 1; min-width: 0; }
.admin-user-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.admin-user-meta { font-size: 12px; opacity: 0.5; margin-top: 2px; }
.admin-badge { font-size: 10px; padding: 1px 6px; border-radius: 8px; margin-left: 6px; font-weight: 700; text-transform: uppercase; vertical-align: middle; }
.admin-badge-admin { background: rgba(255,107,53,0.25); color: #ff6b35; }
.admin-badge-bot { background: rgba(128,128,255,0.2); color: #aaaaff; }
.admin-detail-field { padding: 10px 12px; }
.admin-detail-field label { display: block; font-size: 12px; opacity: 0.5; margin-bottom: 4px; }
.admin-detail-field input, .admin-detail-field select {
    width: 100%;
    padding: 8px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    color: inherit;
    font-size: 14px;
}
.admin-rabbit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 14px;
}
.admin-rabbit-row .admin-rabbit-info { flex: 1; }
.admin-rabbit-row button { background: rgba(255,80,80,0.2); color: #ff8888; border: 1px solid rgba(255,80,80,0.3); padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: add Admin Panel user list screen"
```

---

### Task 13: Build Admin Panel — User Detail screen

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add renderAdminUserDetail function)

**Step 1: Add renderAdminUserDetail function**

Add after `renderAdminUserList`:

```javascript
function renderAdminUserDetail(overlay) {
    const u = _adminSelectedUser;
    const accent = theme.accent;

    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="admin-detail-back" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${accent}">${escapeHtml(u.displayName || "User #" + u.id)}</h2>
        </div>
        <div class="menu-scroll">
            <div class="menu-setting">
                <div class="admin-detail-field">
                    <label>Role</label>
                    <select id="admin-role-select">
                        <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
                        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
                        <option value="bot" ${u.role === "bot" ? "selected" : ""}>Bot</option>
                    </select>
                </div>
                <div class="admin-detail-field">
                    <label>Leaderboard Visibility</label>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">
                        <input type="checkbox" id="admin-vis-cb" ${u.showOnLeaderboard ? "checked" : ""} style="width:18px;height:18px;accent-color:${accent}">
                        Show on leaderboard
                    </label>
                </div>
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Progress</label>
                <div class="admin-detail-field">
                    <label>Highest Level</label>
                    <input type="number" id="admin-hl" value="${u.highestLevel}" min="0">
                </div>
                <div class="admin-detail-field">
                    <label>Total Coins Earned</label>
                    <input type="number" id="admin-tce" value="${u.totalCoinsEarned}" min="0">
                </div>
                <button class="menu-setting-btn" id="admin-save-progress" style="background:${accent};color:#000;width:100%;padding:10px 0;margin:8px 12px">Save Progress</button>
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Rabbit Assignment</label>
                <div id="admin-rabbit-section" style="padding:4px 12px;font-size:13px;opacity:0.5">Loading...</div>
            </div>
            <div class="menu-setting">
                <label class="menu-setting-label">Danger Zone</label>
                <button class="menu-setting-btn" id="admin-delete-user" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3);width:100%;padding:10px 0;margin:0 12px">Delete User</button>
            </div>
        </div>
    `;

    document.getElementById("admin-detail-back").onclick = () => {
        _adminView = "users";
        _adminSelectedUser = null;
        renderAdmin();
    };

    document.getElementById("admin-role-select").onchange = async (e) => {
        try {
            await fetch(`/api/admin/users/${u.id}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ role: e.target.value }),
            });
            u.role = e.target.value;
            showToast("Role updated");
        } catch { showToast("Failed", "#ff8888"); }
    };

    document.getElementById("admin-vis-cb").onchange = async (e) => {
        try {
            await fetch(`/api/admin/users/${u.id}/visibility`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ show: e.target.checked }),
            });
            u.showOnLeaderboard = e.target.checked;
            showToast("Visibility updated");
        } catch { showToast("Failed", "#ff8888"); }
    };

    document.getElementById("admin-save-progress").onclick = async () => {
        const hl = parseInt(document.getElementById("admin-hl").value);
        const tce = parseInt(document.getElementById("admin-tce").value);
        try {
            await fetch(`/api/admin/users/${u.id}/progress`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ highestLevel: hl, totalCoinsEarned: tce }),
            });
            u.highestLevel = hl;
            u.totalCoinsEarned = tce;
            showToast("Progress saved");
        } catch { showToast("Failed", "#ff8888"); }
    };

    document.getElementById("admin-delete-user").onclick = async () => {
        if (!confirm(`Delete ${u.displayName || "User #" + u.id}? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/users/${u.id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                showToast("User deleted");
                _adminView = "users";
                _adminSelectedUser = null;
                loadAdminUsers();
                renderAdmin();
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.error || "Failed", "#ff8888");
            }
        } catch { showToast("Failed", "#ff8888"); }
    };

    // Load rabbit assignment for this user
    fetch("/api/admin/rabbits", { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(rabbits => {
            const section = document.getElementById("admin-rabbit-section");
            if (!section) return;
            const assignment = rabbits.find(r => r.targetUserId === u.id && r.isActive);
            const bots = _adminUsers.filter(x => x.role === "bot");

            if (assignment) {
                section.innerHTML = `
                    <div style="opacity:1;font-size:14px">Paced by: <strong>${escapeHtml(assignment.botName || "Bot #" + assignment.botUserId)}</strong></div>
                    <button class="menu-setting-btn" id="admin-remove-rabbit" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3);margin-top:8px;padding:6px 12px;font-size:12px">Remove Rabbit</button>
                `;
                document.getElementById("admin-remove-rabbit").onclick = async () => {
                    await fetch(`/api/admin/rabbits/${assignment.id}`, { method: "DELETE", headers: getAuthHeaders() });
                    showToast("Rabbit removed");
                    renderAdmin();
                };
            } else if (bots.length > 0) {
                section.innerHTML = `
                    <select id="admin-rabbit-select" style="width:100%;padding:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:inherit;font-size:14px">
                        <option value="">No rabbit assigned</option>
                        ${bots.map(b => `<option value="${b.id}">${escapeHtml(b.displayName || "Bot #" + b.id)}</option>`).join("")}
                    </select>
                    <button class="menu-setting-btn" id="admin-assign-rabbit" style="background:${accent};color:#000;margin-top:8px;padding:6px 12px;font-size:12px">Assign Rabbit</button>
                `;
                document.getElementById("admin-assign-rabbit").onclick = async () => {
                    const botId = parseInt(document.getElementById("admin-rabbit-select").value);
                    if (!botId) return;
                    try {
                        const res = await fetch("/api/admin/rabbits", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                            body: JSON.stringify({ botUserId: botId, targetUserId: u.id }),
                        });
                        if (res.ok) { showToast("Rabbit assigned"); renderAdmin(); }
                        else { const d = await res.json().catch(() => ({})); showToast(d.error || "Failed", "#ff8888"); }
                    } catch { showToast("Failed", "#ff8888"); }
                };
            } else {
                section.innerHTML = '<div>No bots available. Create a bot first.</div>';
            }
        });
}
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add Admin Panel user detail screen with progress editing and rabbit assignment"
```

---

### Task 14: Build Admin Panel — Rabbit Management screen

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add renderAdminRabbits function)

**Step 1: Add renderAdminRabbits function**

Add after `renderAdminUserDetail`:

```javascript
function renderAdminRabbits(overlay) {
    const accent = theme.accent;

    overlay.innerHTML = `
        <div class="menu-header" style="justify-content:center;position:relative;cursor:default">
            <button class="back-arrow-btn" id="admin-rabbits-back" title="Back" style="position:absolute;left:12px">
                <svg viewBox="0 0 24 24" fill="none" stroke="${theme.text}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <h2 class="menu-title" style="color:${accent}">Rabbit Assignments</h2>
        </div>
        <div class="menu-scroll">
            <div id="admin-rabbit-list" style="padding:0 4px">
                <div style="text-align:center;padding:30px;opacity:0.5">Loading...</div>
            </div>
            <div class="menu-setting" style="border-top:1px solid rgba(255,255,255,0.08)">
                <label class="menu-setting-label">New Assignment</label>
                <div class="admin-detail-field">
                    <label>Bot</label>
                    <select id="admin-new-rabbit-bot" style="width:100%;padding:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:inherit;font-size:14px">
                        <option value="">Select bot...</option>
                    </select>
                </div>
                <div class="admin-detail-field">
                    <label>Target Player</label>
                    <select id="admin-new-rabbit-target" style="width:100%;padding:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:inherit;font-size:14px">
                        <option value="">Select player...</option>
                    </select>
                </div>
                <button class="menu-setting-btn" id="admin-new-rabbit-btn" style="background:${accent};color:#000;width:100%;padding:10px 0;margin:8px 12px">Assign Rabbit</button>
            </div>
        </div>
    `;

    document.getElementById("admin-rabbits-back").onclick = () => {
        _adminView = "users";
        renderAdmin();
    };

    // Load rabbits and populate
    Promise.all([
        fetch("/api/admin/rabbits", { headers: getAuthHeaders() }).then(r => r.json()),
        _adminUsers.length ? Promise.resolve(_adminUsers) : fetch("/api/admin/users", { headers: getAuthHeaders() }).then(r => r.json()),
    ]).then(([rabbits, users]) => {
        _adminUsers = users;
        _adminRabbits = rabbits;

        // Render assignment list
        const list = document.getElementById("admin-rabbit-list");
        if (!list) return;
        if (rabbits.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5">No rabbit assignments</div>';
        } else {
            list.innerHTML = rabbits.map(r => `
                <div class="admin-rabbit-row">
                    <div class="admin-rabbit-info">
                        <strong>${escapeHtml(r.botName || "Bot #" + r.botUserId)}</strong>
                        <span style="opacity:0.5;margin:0 6px">\u2192</span>
                        ${escapeHtml(r.targetName || "User #" + r.targetUserId)}
                        ${r.isActive ? '' : '<span style="opacity:0.4;margin-left:6px">(paused)</span>'}
                    </div>
                    <button data-rid="${r.id}">Remove</button>
                </div>
            `).join("");

            list.querySelectorAll("button[data-rid]").forEach(btn => {
                btn.onclick = async () => {
                    if (!confirm("Remove this rabbit assignment?")) return;
                    await fetch(`/api/admin/rabbits/${btn.dataset.rid}`, { method: "DELETE", headers: getAuthHeaders() });
                    showToast("Removed");
                    _adminView = "rabbits";
                    renderAdmin();
                };
            });
        }

        // Populate dropdowns
        const botSelect = document.getElementById("admin-new-rabbit-bot");
        const targetSelect = document.getElementById("admin-new-rabbit-target");
        users.filter(u => u.role === "bot").forEach(b => {
            botSelect.innerHTML += `<option value="${b.id}">${escapeHtml(b.displayName || "Bot #" + b.id)}</option>`;
        });
        users.filter(u => u.role !== "bot").forEach(u => {
            targetSelect.innerHTML += `<option value="${u.id}">${escapeHtml(u.displayName || "User #" + u.id)}</option>`;
        });
    });

    document.getElementById("admin-new-rabbit-btn").onclick = async () => {
        const botId = parseInt(document.getElementById("admin-new-rabbit-bot").value);
        const targetId = parseInt(document.getElementById("admin-new-rabbit-target").value);
        if (!botId || !targetId) { showToast("Select both bot and target", "#ff8888"); return; }
        try {
            const res = await fetch("/api/admin/rabbits", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ botUserId: botId, targetUserId: targetId }),
            });
            if (res.ok) { showToast("Rabbit assigned"); _adminView = "rabbits"; renderAdmin(); }
            else { const d = await res.json().catch(() => ({})); showToast(d.error || "Failed", "#ff8888"); }
        } catch { showToast("Failed", "#ff8888"); }
    };
}
```

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add Admin Panel rabbit management screen"
```

---

### Task 15: Update service worker and asset versions

**Files:**
- Modify: `WordPlay/wwwroot/sw.js` (bump CACHE_NAME)
- Modify: `WordPlay/wwwroot/index.html` (bump asset versions)

**Step 1: Bump versions**

In `sw.js`, change `CACHE_NAME` from `'wordplay-v78'` to `'wordplay-v79'` and update all `?v=29` to `?v=30` in ASSETS array.

In `index.html`, change all `?v=29` to `?v=30`.

**Step 2: Commit**

```bash
git add WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html
git commit -m "chore: bump SW cache and asset versions for admin panel release"
```

---

### Task 16: Apply database migration

**Step 1: Apply migration to production database**

This step must be done from Visual Studio or a machine with database access. The migration will:
1. Add `Role` column to `Users` (default `"user"`)
2. Create `RabbitAssignments` table
3. Set Word Dog (ID 1) to `Role = "admin"`
4. Set Fast Eddie (ID 9) to `Role = "bot"`, `Provider = "bot"`
5. Create rabbit assignment: Eddie (9) → Bridget (7)

```bash
dotnet ef database update
```

**Step 2: Deploy via Visual Studio Web Deploy**

Publish the updated application.

**Step 3: Test admin panel**

Sign in as Word Dog (admin). Go to Settings → Admin Panel. Verify:
- User list loads with all users
- Can view user detail
- Can see Eddie assigned as rabbit to Bridget
- Rabbit management screen shows the assignment

---

### Task 17: Verify end-to-end

**Step 1: Verify pacing still works**

Play a level as Bridget. Check that Eddie's level and coins update on the leaderboard.

**Step 2: Verify admin progress editing**

Open admin panel, edit a test user's level/coins. Check leaderboard reflects changes.

**Step 3: Verify bot creation**

Create a new bot from admin panel. Assign it as rabbit to a test user. Verify pacing runs for the new assignment.

**Step 4: Verify bot sign-in rejection**

Try to sign in with Eddie's old Microsoft credentials. Verify it's rejected.

**Step 5: Final commit**

If any fixes were needed, commit them:

```bash
git add -A
git commit -m "fix: address issues found during admin panel testing"
```
