# User Avatars Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users choose an emoji or upload/capture a custom photo as their avatar, replacing the initials circle on the leaderboard and settings.

**Architecture:** Add an `AvatarData` column to the User table storing either an emoji key (`"emoji:fox"`) or a base64 JPEG data URL (256x256, ~20-35KB). All image cropping happens client-side via Cropper.js (CDN-loaded). A shared `renderAvatar()` helper centralizes the three-way rendering (emoji / custom image / initials fallback).

**Tech Stack:** ASP.NET 8 minimal API, EF Core, Cropper.js 1.6.2 (CDN), Canvas API, getUserMedia

---

### Task 1: Add AvatarData to User Model and Database

**Files:**
- Modify: `WordPlay/Models/User.cs:10` (add property after DisplayName)
- Modify: `WordPlay/Data/WordPlayDb.cs:23` (add column config in User entity)

**Step 1: Add AvatarData property to User model**

In `WordPlay/Models/User.cs`, add after line 9 (`public string? DisplayName { get; set; }`):

```csharp
    public string? AvatarData { get; set; }              // "emoji:fox" or "data:image/jpeg;base64,..."
```

**Step 2: Add column config in WordPlayDb.cs**

In `WordPlay/Data/WordPlayDb.cs`, inside the `modelBuilder.Entity<User>` block (after line 23, the `Role` config), add:

```csharp
            e.Property(u => u.AvatarData).HasColumnType("nvarchar(max)");
```

**Step 3: Generate EF Core migration**

Run from `WordPlay/` directory:
```bash
dotnet ef migrations add AddAvatarData
```
Expected: New migration file created in `Migrations/` folder.

**Step 4: Verify build succeeds**

```bash
dotnet build --no-restore
```
Expected: Build succeeded, 0 errors.

**Step 5: Commit**

```bash
git add WordPlay/Models/User.cs WordPlay/Data/WordPlayDb.cs WordPlay/Migrations/
git commit -m "feat: add AvatarData column to User model"
```

---

### Task 2: Add Avatar API Endpoints

**Files:**
- Modify: `WordPlay/Program.cs` (add two new endpoints after the `set-leaderboard` endpoint at ~line 347)

**Step 1: Add set-avatar endpoint**

After the `set-leaderboard` endpoint (around line 347), add:

```csharp
// Allowed emoji keys for avatar presets
var allowedEmoji = new HashSet<string> {
    "dog","cat","fox","unicorn","bear","panda","owl","frog",
    "lion","monkey","robot","alien","ghost","octopus","butterfly","dragon"
};

app.MapPost("/api/auth/set-avatar", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("avatarData", out var avatarEl))
        return Results.BadRequest(new { error = "avatarData required" });

    var avatarData = avatarEl.GetString()?.Trim() ?? "";

    // Validate emoji preset
    if (avatarData.StartsWith("emoji:"))
    {
        var key = avatarData[6..];
        if (!allowedEmoji.Contains(key))
            return Results.BadRequest(new { error = "Invalid emoji key" });
    }
    // Validate base64 image
    else if (avatarData.StartsWith("data:image"))
    {
        // Must be JPEG or PNG, under 100KB
        var commaIdx = avatarData.IndexOf(',');
        if (commaIdx < 0) return Results.BadRequest(new { error = "Invalid image data" });
        var base64Part = avatarData[(commaIdx + 1)..];
        if (base64Part.Length > 140_000) // ~100KB in base64
            return Results.BadRequest(new { error = "Image too large (max 100KB)" });
    }
    else
    {
        return Results.BadRequest(new { error = "avatarData must start with 'emoji:' or 'data:image'" });
    }

    var user = await db.Users.FindAsync(userId);
    if (user == null) return Results.NotFound();

    user.AvatarData = avatarData;
    await db.SaveChangesAsync();

    return Results.Ok(new { user.AvatarData });
}).RequireAuthorization();
```

**Step 2: Add delete-avatar endpoint**

Immediately after the set-avatar endpoint, add:

```csharp
app.MapDelete("/api/auth/avatar", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var user = await db.Users.FindAsync(userId);
    if (user == null) return Results.NotFound();

    user.AvatarData = null;
    await db.SaveChangesAsync();

    return Results.Ok();
}).RequireAuthorization();
```

**Step 3: Verify build succeeds**

```bash
dotnet build --no-restore
```

**Step 4: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: add set-avatar and delete-avatar API endpoints"
```

---

### Task 3: Add AvatarData to All Auth Responses and Leaderboard

**Files:**
- Modify: `WordPlay/Program.cs` (multiple locations)

**Step 1: Add avatarData to Google sign-in response**

At line 273, change:
```csharp
user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role }
```
to:
```csharp
user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role, user.AvatarData }
```

**Step 2: Add avatarData to Microsoft sign-in response**

At line 298, make the same change:
```csharp
user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role, user.AvatarData }
```

**Step 3: Add avatarData to set-name response**

At line 328, change:
```csharp
return Results.Ok(new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role });
```
to:
```csharp
return Results.Ok(new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role, user.AvatarData });
```

**Step 4: Add avatarData to leaderboard projection**

In the leaderboard query (around line 590-598), add `avatarData` to the anonymous projection. Change:
```csharp
var projected = query.Select(p => new
{
    userId = p.UserId,
    name = p.User.DisplayName,
    highestLevel = p.HighestLevel,
    levelsCompleted = p.LevelsCompleted,
    totalCoinsEarned = p.TotalCoinsEarned,
    monthlyGain = isMonthly ? p.HighestLevel - p.MonthlyStart : 0,
    monthlyCoinsGain = isMonthly ? p.TotalCoinsEarned - p.MonthlyCoinsStart : 0
});
```
to:
```csharp
var projected = query.Select(p => new
{
    userId = p.UserId,
    name = p.User.DisplayName,
    avatarData = p.User.AvatarData,
    highestLevel = p.HighestLevel,
    levelsCompleted = p.LevelsCompleted,
    totalCoinsEarned = p.TotalCoinsEarned,
    monthlyGain = isMonthly ? p.HighestLevel - p.MonthlyStart : 0,
    monthlyCoinsGain = isMonthly ? p.TotalCoinsEarned - p.MonthlyCoinsStart : 0
});
```

**Step 5: Add avatarData to admin users projection**

In the admin users endpoint (around line 741-756), add `avatarData` to the projection. After the `showOnLeaderboard` line, add:
```csharp
        avatarData = x.u.AvatarData,
```

**Step 6: Verify build succeeds**

```bash
dotnet build --no-restore
```

**Step 7: Commit**

```bash
git add WordPlay/Program.cs
git commit -m "feat: include avatarData in auth responses and leaderboard data"
```

---

### Task 4: Update Client Auth State for AvatarData

**Files:**
- Modify: `WordPlay/wwwroot/js/auth.js` (update state shape and add setAvatar function)

**Step 1: Update auth state comment**

At line 7, change:
```javascript
let _authState = null; // { jwt, user: { id, displayName, email } }
```
to:
```javascript
let _authState = null; // { jwt, user: { id, displayName, email, avatarData } }
```

**Step 2: Add avatarData to the user state in setDisplayName**

At line 151 (inside `setDisplayName`), the line that sets `_authState.user`, add `avatarData`. Change:
```javascript
        _authState.user = { id: data.Id || data.id, displayName: data.DisplayName || data.displayName, email: data.Email || data.email, showOnLeaderboard: data.ShowOnLeaderboard ?? data.showOnLeaderboard ?? true, role: data.Role || data.role || "user" };
```
to:
```javascript
        _authState.user = { id: data.Id || data.id, displayName: data.DisplayName || data.displayName, email: data.Email || data.email, showOnLeaderboard: data.ShowOnLeaderboard ?? data.showOnLeaderboard ?? true, role: data.Role || data.role || "user", avatarData: data.AvatarData || data.avatarData || null };
```

**Step 3: Find the Google sign-in callback that sets auth state**

Search for where `_authState` is first set after Google/Microsoft sign-in. There will be a similar user-object construction. Add `avatarData` there too. Look for patterns like `_authState = { jwt:` — add `avatarData: data.user.avatarData || data.user.AvatarData || null` to the user object.

**Step 4: Add setAvatar function**

After the `setLeaderboardVisibility` function (~line 172), add:

```javascript
async function setAvatar(avatarData) {
    const res = await fetch("/api/auth/set-avatar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ avatarData }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to set avatar");
    }
    const data = await res.json();
    if (_authState) {
        _authState.user.avatarData = data.AvatarData || data.avatarData || avatarData;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(_authState));
    }
    return data;
}

async function deleteAvatar() {
    const res = await fetch("/api/auth/avatar", {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete avatar");
    if (_authState) {
        _authState.user.avatarData = null;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(_authState));
    }
}
```

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/auth.js
git commit -m "feat: add avatarData to auth state and setAvatar/deleteAvatar functions"
```

---

### Task 5: Create renderAvatar Helper and Update Leaderboard

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add helper function, update leaderboard rendering)

**Step 1: Define emoji map constant**

Near the top of `app.js` (after the state/constants section, around line 160), add the emoji lookup:

```javascript
const AVATAR_EMOJI = {
    dog:"\uD83D\uDC36", cat:"\uD83D\uDC31", fox:"\uD83E\uDD8A", unicorn:"\uD83E\uDD84",
    bear:"\uD83D\uDC3B", panda:"\uD83D\uDC3C", owl:"\uD83E\uDD89", frog:"\uD83D\uDC38",
    lion:"\uD83E\uDD81", monkey:"\uD83D\uDC35", robot:"\uD83E\uDD16", alien:"\uD83D\uDC7D",
    ghost:"\uD83D\uDC7B", octopus:"\uD83D\uDC19", butterfly:"\uD83E\uDD8B", dragon:"\uD83D\uDC32"
};
```

**Step 2: Add renderAvatar helper function**

After `getInitials` (~line 4680), add:

```javascript
function renderAvatar(avatarData, name, size) {
    size = size || 34;
    var s = 'width:' + size + 'px;height:' + size + 'px;';
    if (avatarData && avatarData.startsWith('emoji:')) {
        var key = avatarData.substring(6);
        var emoji = AVATAR_EMOJI[key] || '\u2753';
        return '<div class="lb-avatar" style="background:' + getAvatarColor(name) + ';' + s + 'font-size:' + Math.round(size * 0.55) + 'px">' + emoji + '</div>';
    }
    if (avatarData && avatarData.startsWith('data:image')) {
        return '<img class="lb-avatar" src="' + avatarData + '" style="' + s + 'object-fit:cover" alt="">';
    }
    var initials = getInitials(name);
    var fontSize = size < 40 ? 13 : Math.round(size * 0.35);
    return '<div class="lb-avatar" style="background:' + getAvatarColor(name) + ';' + s + 'font-size:' + fontSize + 'px">' + initials + '</div>';
}
```

**Step 3: Update leaderboard row rendering**

At line 4822, replace:
```javascript
        <div class="lb-avatar" style="background:${avatarColor}">${initials}</div>
```
with:
```javascript
        ${renderAvatar(entry.avatarData, entry.name, 34)}
```

The `avatarColor` and `initials` variables computed at lines 4801-4802 can remain — they're still used by `renderAvatar` internally via `getAvatarColor`/`getInitials`. But you can remove them if you prefer cleanliness since `renderAvatar` calls those functions itself.

**Step 4: Verify the leaderboard still renders correctly in browser**

Open http://localhost:5199, sign in, check the leaderboard. All users should show initials circles (no one has avatar data yet). No visual change expected.

**Step 5: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: add renderAvatar helper and use it in leaderboard rows"
```

---

### Task 6: Update Settings Menu to Show Avatar with Edit Entry Point

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (settings menu account section, around line 3233-3246)

**Step 1: Update the account section in renderMenu**

Replace the current account section (around lines 3237-3246):

```javascript
            <div id="menu-display-name" style="font-size:15px;margin-bottom:2px;cursor:pointer">${escapeHtml(user.displayName || "Player")} <span style="font-size:11px">✏️</span></div>
```

with an avatar + name layout:

```javascript
            <div id="menu-avatar-edit" style="position:relative;display:inline-block;cursor:pointer;margin-bottom:8px">
                ${renderAvatar(user.avatarData, user.displayName, 60)}
                <div style="position:absolute;bottom:-2px;right:-2px;background:${theme.accent};border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #140f1e">✏️</div>
            </div>
            <div id="menu-display-name" style="font-size:15px;margin-bottom:2px;cursor:pointer">${escapeHtml(user.displayName || "Player")} <span style="font-size:11px">✏️</span></div>
```

**Step 2: Wire the avatar edit tap handler**

After the existing `displayNameEl.onclick` handler (around line 3575), add:

```javascript
        const avatarEditEl = document.getElementById("menu-avatar-edit");
        if (avatarEditEl) {
            avatarEditEl.onclick = () => {
                state.showMenu = false;
                renderMenu();
                renderAvatarEditor();
            };
        }
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js
git commit -m "feat: show avatar in settings menu with edit entry point"
```

---

### Task 7: Build Avatar Editor Modal — Emoji Tab

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (add renderAvatarEditor function)
- Modify: `WordPlay/wwwroot/css/app.css` (add avatar editor styles)

**Step 1: Add avatar editor CSS**

In `app.css`, after the existing `.lb-avatar` styles (around line 1503), add:

```css
.avatar-editor-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 2px;
}

.avatar-editor-tab {
    flex: 1;
    padding: 8px 4px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.4);
    font-size: 12px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
}

.avatar-editor-tab.active {
    background: var(--tab-accent, #f4a535);
    color: #000;
}

.avatar-emoji-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 4px;
}

.avatar-emoji-option {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 3px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;
}

.avatar-emoji-option:active {
    transform: scale(0.92);
}

.avatar-emoji-option.selected {
    border-color: var(--tab-accent, #f4a535);
    box-shadow: 0 0 12px rgba(244,165,53,0.3);
}

.avatar-cropper-container {
    width: 100%;
    max-height: 250px;
    overflow: hidden;
    border-radius: 12px;
    background: #000;
    margin-bottom: 12px;
}

.avatar-cropper-container img {
    display: block;
    max-width: 100%;
}

.avatar-preview-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin: 12px 0;
}

.avatar-zoom-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
    justify-content: center;
}

.avatar-zoom-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.08);
    color: #fff;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.avatar-zoom-slider {
    flex: 1;
    max-width: 140px;
    accent-color: var(--tab-accent, #f4a535);
}
```

**Step 2: Add the renderAvatarEditor function**

In `app.js`, after `renderDisplayNamePrompt` (around line 4959), add the full avatar editor function. This is a large function — build the emoji tab first:

```javascript
function renderAvatarEditor() {
    let overlay = document.getElementById("avatar-editor-overlay");
    if (overlay) overlay.remove();

    const currentUser = typeof getUser === "function" ? getUser() : null;
    const accent = theme.accent;
    let selectedTab = "emoji"; // "emoji", "upload", "camera"
    let selectedEmoji = null;
    let cropper = null;
    let cameraStream = null;

    // If current avatar is emoji, pre-select it
    if (currentUser && currentUser.avatarData && currentUser.avatarData.startsWith("emoji:")) {
        selectedEmoji = currentUser.avatarData.substring(6);
    }

    overlay = document.createElement("div");
    overlay.id = "avatar-editor-overlay";
    overlay.className = "modal-overlay";
    overlay.style.display = "flex";
    document.getElementById("app").appendChild(overlay);

    function render() {
        // Cleanup camera/cropper on tab switch
        if (cropper) { cropper.destroy(); cropper = null; }
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }

        let content = '';

        // Preview of current selection
        let previewHtml;
        if (selectedEmoji) {
            previewHtml = renderAvatar("emoji:" + selectedEmoji, currentUser?.displayName, 60);
        } else if (currentUser && currentUser.avatarData && currentUser.avatarData.startsWith("data:image")) {
            previewHtml = renderAvatar(currentUser.avatarData, currentUser?.displayName, 60);
        } else {
            previewHtml = renderAvatar(null, currentUser?.displayName, 60);
        }

        content += '<div style="text-align:center;margin-bottom:12px">' + previewHtml + '</div>';

        // Tabs
        content += '<div class="avatar-editor-tabs" style="--tab-accent:' + accent + '">';
        content += '<button class="avatar-editor-tab' + (selectedTab === "emoji" ? " active" : "") + '" data-tab="emoji">Presets</button>';
        content += '<button class="avatar-editor-tab' + (selectedTab === "upload" ? " active" : "") + '" data-tab="upload">Upload</button>';
        content += '<button class="avatar-editor-tab' + (selectedTab === "camera" ? " active" : "") + '" data-tab="camera">Camera</button>';
        content += '</div>';

        // Tab content
        if (selectedTab === "emoji") {
            content += '<div class="avatar-emoji-grid">';
            Object.keys(AVATAR_EMOJI).forEach(key => {
                content += '<div class="avatar-emoji-option' + (selectedEmoji === key ? ' selected' : '') + '" data-emoji="' + key + '" style="background:' + getAvatarColor(currentUser?.displayName) + ';--tab-accent:' + accent + '">' + AVATAR_EMOJI[key] + '</div>';
            });
            content += '</div>';
        } else if (selectedTab === "upload") {
            content += '<div id="avatar-upload-area" style="text-align:center;padding:16px 0">';
            content += '<div id="avatar-cropper-wrap" style="display:none"><div class="avatar-cropper-container"><img id="avatar-crop-img"></div>';
            content += '<div class="avatar-zoom-controls"><button class="avatar-zoom-btn" id="avatar-zoom-out">\u2212</button><input type="range" id="avatar-zoom-slider" class="avatar-zoom-slider" min="0.1" max="3" step="0.05" value="1"><button class="avatar-zoom-btn" id="avatar-zoom-in">+</button></div>';
            content += '<div class="avatar-preview-row"><span style="opacity:0.5;font-size:12px">Preview:</span><div id="avatar-crop-preview" style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:2px solid ' + accent + '"></div></div></div>';
            content += '<label style="display:inline-block;padding:10px 20px;background:' + accent + ';color:#000;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px">Choose Photo<input type="file" id="avatar-file-input" accept="image/jpeg,image/png,image/webp" style="display:none"></label>';
            content += '<div style="font-size:11px;opacity:0.4;margin-top:8px">JPEG, PNG or WebP \u00b7 Max 5MB</div>';
            content += '</div>';
        } else if (selectedTab === "camera") {
            content += '<div id="avatar-camera-area" style="text-align:center;padding:8px 0">';
            content += '<div id="avatar-camera-preview" style="width:100%;max-height:250px;border-radius:12px;overflow:hidden;background:#000;margin-bottom:8px"><video id="avatar-camera-video" autoplay playsinline style="width:100%;display:block;transform:scaleX(-1)"></video></div>';
            content += '<div style="display:flex;gap:8px;justify-content:center;margin:8px 0">';
            content += '<button id="avatar-camera-capture" class="menu-setting-btn" style="background:' + accent + ';color:#000;padding:10px 24px;font-size:14px">Capture</button>';
            content += '<button id="avatar-camera-flip" class="menu-setting-btn" style="background:rgba(255,255,255,0.1);color:#fff;padding:10px 16px;font-size:14px">Flip</button>';
            content += '</div>';
            content += '<div id="avatar-camera-cropper-wrap" style="display:none"><div class="avatar-cropper-container"><img id="avatar-camera-crop-img"></div>';
            content += '<div class="avatar-zoom-controls"><button class="avatar-zoom-btn" id="avatar-cam-zoom-out">\u2212</button><input type="range" id="avatar-cam-zoom-slider" class="avatar-zoom-slider" min="0.1" max="3" step="0.05" value="1"><button class="avatar-zoom-btn" id="avatar-cam-zoom-in">+</button></div>';
            content += '<div class="avatar-preview-row"><span style="opacity:0.5;font-size:12px">Preview:</span><div id="avatar-cam-crop-preview" style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:2px solid ' + accent + '"></div></div></div>';
            content += '</div>';
        }

        // Action buttons
        content += '<div style="display:flex;gap:8px;margin-top:12px">';
        if (currentUser && currentUser.avatarData) {
            content += '<button id="avatar-remove-btn" class="menu-setting-btn" style="background:rgba(255,80,80,0.2);color:#ff8888;border:1px solid rgba(255,80,80,0.3);flex:0 0 auto;padding:8px 12px;font-size:13px">Remove</button>';
        }
        content += '<button id="avatar-cancel-btn" class="menu-setting-btn" style="background:rgba(255,255,255,0.08);color:#fff;flex:1;padding:8px 0;font-size:13px">Cancel</button>';
        content += '<button id="avatar-save-btn" class="menu-setting-btn" style="background:' + accent + ';color:#000;flex:1;padding:8px 0;font-size:13px;font-weight:700">Save</button>';
        content += '</div>';

        overlay.innerHTML = '<div class="modal-box" style="max-width:340px;max-height:90vh;overflow-y:auto">' +
            '<h3 style="color:' + accent + ';margin-bottom:12px">Choose Avatar</h3>' + content + '</div>';

        // Wire tab buttons
        overlay.querySelectorAll(".avatar-editor-tab").forEach(btn => {
            btn.onclick = () => { selectedTab = btn.dataset.tab; render(); initTabContent(); };
        });

        // Wire emoji selection
        overlay.querySelectorAll(".avatar-emoji-option").forEach(opt => {
            opt.onclick = () => {
                selectedEmoji = opt.dataset.emoji;
                overlay.querySelectorAll(".avatar-emoji-option").forEach(o => o.classList.remove("selected"));
                opt.classList.add("selected");
                // Update preview
                var previewContainer = overlay.querySelector('.modal-box > div:first-child');
                if (previewContainer) previewContainer.innerHTML = renderAvatar("emoji:" + selectedEmoji, currentUser?.displayName, 60);
            };
        });

        // Wire cancel
        var cancelBtn = document.getElementById("avatar-cancel-btn");
        if (cancelBtn) cancelBtn.onclick = closeEditor;

        // Wire remove
        var removeBtn = document.getElementById("avatar-remove-btn");
        if (removeBtn) {
            removeBtn.onclick = async () => {
                try {
                    await deleteAvatar();
                    showToast("Avatar removed");
                    closeEditor();
                } catch (e) { showToast("Failed to remove", "#ff8888"); }
            };
        }

        // Wire save
        var saveBtn = document.getElementById("avatar-save-btn");
        if (saveBtn) saveBtn.onclick = saveAvatar;
    }

    function closeEditor() {
        if (cropper) { cropper.destroy(); cropper = null; }
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
        overlay.remove();
        state.showMenu = true;
        renderMenu();
    }

    async function saveAvatar() {
        var avatarData = null;

        if (selectedTab === "emoji" && selectedEmoji) {
            avatarData = "emoji:" + selectedEmoji;
        } else if ((selectedTab === "upload" || selectedTab === "camera") && cropper) {
            var canvas = cropper.getCroppedCanvas({ width: 256, height: 256, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
            avatarData = canvas.toDataURL('image/jpeg', 0.85);
        }

        if (!avatarData) { showToast("Select an avatar first", "#ff8888"); return; }

        try {
            await setAvatar(avatarData);
            showToast("Avatar saved!");
            closeEditor();
        } catch (e) {
            showToast(e.message || "Failed to save", "#ff8888");
        }
    }

    function initTabContent() {
        if (selectedTab === "upload") initUploadTab();
        if (selectedTab === "camera") initCameraTab();
    }

    // ---- Upload tab logic ----
    function initUploadTab() {
        var fileInput = document.getElementById("avatar-file-input");
        if (!fileInput) return;
        fileInput.onchange = (e) => {
            var file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) { showToast("Image too large (max 5MB)", "#ff8888"); return; }
            var reader = new FileReader();
            reader.onload = (ev) => loadImageIntoCropper(ev.target.result, "avatar-crop-img", "avatar-cropper-wrap", "avatar-crop-preview", "avatar-zoom-slider", "avatar-zoom-in", "avatar-zoom-out");
            reader.readAsDataURL(file);
        };
    }

    // ---- Camera tab logic ----
    var currentFacingMode = 'user';

    function initCameraTab() {
        startCamera();
        var captureBtn = document.getElementById("avatar-camera-capture");
        var flipBtn = document.getElementById("avatar-camera-flip");
        if (captureBtn) captureBtn.onclick = capturePhoto;
        if (flipBtn) flipBtn.onclick = () => { currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'; startCamera(); };
    }

    function startCamera() {
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); }
        var video = document.getElementById("avatar-camera-video");
        if (!video) return;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } })
            .then(stream => {
                cameraStream = stream;
                video.srcObject = stream;
            })
            .catch(() => showToast("Camera not available", "#ff8888"));
    }

    function capturePhoto() {
        var video = document.getElementById("avatar-camera-video");
        if (!video || !video.videoWidth) return;
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var ctx = canvas.getContext('2d');
        // Mirror correction for front camera
        if (currentFacingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);

        // Stop camera
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
        // Hide video, show cropper
        var videoWrap = document.getElementById("avatar-camera-preview");
        if (videoWrap) videoWrap.style.display = "none";
        var captureBtn = document.getElementById("avatar-camera-capture");
        var flipBtn = document.getElementById("avatar-camera-flip");
        if (captureBtn) captureBtn.style.display = "none";
        if (flipBtn) flipBtn.style.display = "none";

        var dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        loadImageIntoCropper(dataUrl, "avatar-camera-crop-img", "avatar-camera-cropper-wrap", "avatar-cam-crop-preview", "avatar-cam-zoom-slider", "avatar-cam-zoom-in", "avatar-cam-zoom-out");
    }

    // ---- Shared Cropper.js loader ----
    function loadImageIntoCropper(dataUrl, imgId, wrapId, previewId, sliderId, zoomInId, zoomOutId) {
        // Preprocess: resize large images to max 2048px
        var tempImg = new Image();
        tempImg.onload = function() {
            var maxDim = 2048;
            var w = tempImg.width, h = tempImg.height;
            if (w > maxDim || h > maxDim) {
                var scale = maxDim / Math.max(w, h);
                var c = document.createElement('canvas');
                c.width = Math.round(w * scale);
                c.height = Math.round(h * scale);
                c.getContext('2d').drawImage(tempImg, 0, 0, c.width, c.height);
                dataUrl = c.toDataURL('image/jpeg', 0.95);
            }
            initCropper(dataUrl, imgId, wrapId, previewId, sliderId, zoomInId, zoomOutId);
        };
        tempImg.src = dataUrl;
    }

    function initCropper(dataUrl, imgId, wrapId, previewId, sliderId, zoomInId, zoomOutId) {
        // Load Cropper.js CSS + JS from CDN if not already loaded
        if (!document.getElementById("cropperjs-css")) {
            var link = document.createElement("link");
            link.id = "cropperjs-css";
            link.rel = "stylesheet";
            link.href = "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css";
            document.head.appendChild(link);
        }

        function startCropper() {
            var wrap = document.getElementById(wrapId);
            var img = document.getElementById(imgId);
            if (!wrap || !img) return;

            wrap.style.display = "block";
            img.src = dataUrl;

            if (cropper) cropper.destroy();
            cropper = new Cropper(img, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                cropBoxMovable: false,
                cropBoxResizable: false,
                minCropBoxWidth: 100,
                minCropBoxHeight: 100,
                checkOrientation: true,
                zoomOnWheel: true,
                wheelZoomRatio: 0.1,
                zoomOnTouch: true,
                ready: function() {
                    updatePreview(previewId);
                },
                crop: function() {
                    updatePreview(previewId);
                }
            });

            // Zoom controls
            var slider = document.getElementById(sliderId);
            var zoomIn = document.getElementById(zoomInId);
            var zoomOut = document.getElementById(zoomOutId);
            if (slider) slider.oninput = function() { cropper.zoomTo(parseFloat(slider.value)); };
            if (zoomIn) zoomIn.onclick = function() { cropper.zoom(0.1); };
            if (zoomOut) zoomOut.onclick = function() { cropper.zoom(-0.1); };

            // Apply circular crop mask CSS
            var viewBox = wrap.querySelector('.cropper-view-box');
            var face = wrap.querySelector('.cropper-face');
            if (viewBox) viewBox.style.borderRadius = '50%';
            if (face) face.style.borderRadius = '50%';
        }

        if (typeof Cropper === 'undefined') {
            var script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js";
            script.onload = startCropper;
            document.head.appendChild(script);
        } else {
            startCropper();
        }
    }

    function updatePreview(previewId) {
        if (!cropper) return;
        var canvas = cropper.getCroppedCanvas({ width: 60, height: 60, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
        var previewEl = document.getElementById(previewId);
        if (previewEl) {
            previewEl.innerHTML = '';
            previewEl.appendChild(canvas);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.borderRadius = '50%';
        }
    }

    render();
    initTabContent();
}
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: add avatar editor modal with emoji, upload, and camera tabs"
```

---

### Task 8: Update Admin User List to Show Avatars

**Files:**
- Modify: `WordPlay/wwwroot/js/app.js` (admin user list row, around line 4057-4065)

**Step 1: Add avatar to admin user list rows**

In the admin user list rendering (around line 4060), add avatar before the name. Change:

```javascript
            <div class="admin-user-name">${escapeHtml(u.displayName || "\u2014")} ${roleBadge(u.role)}</div>
```

to:

```javascript
            <div class="admin-user-name">${renderAvatar(u.avatarData, u.displayName, 28)} ${escapeHtml(u.displayName || "\u2014")} ${roleBadge(u.role)}</div>
```

**Step 2: Add a small CSS tweak for admin user name to align the avatar**

The `.admin-user-name` likely needs `display:flex;align-items:center;gap:6px;` to align the avatar inline. Check the existing CSS and add if needed:

```css
.admin-user-name {
    display: flex;
    align-items: center;
    gap: 6px;
}
```

**Step 3: Commit**

```bash
git add WordPlay/wwwroot/js/app.js WordPlay/wwwroot/css/app.css
git commit -m "feat: show avatars in admin user list"
```

---

### Task 9: Apply Migration, Bump Versions, Final Build

**Files:**
- Modify: `WordPlay/wwwroot/sw.js` (cache version bump)
- Modify: `WordPlay/wwwroot/index.html` (asset version bump)

**Step 1: Apply the database migration**

From the `WordPlay/` directory:
```bash
dotnet ef database update
```
Expected: `Applying migration 'XXXXXXXX_AddAvatarData'` ... `Done.`

**Step 2: Bump asset versions**

In `sw.js`:
- Change `CACHE_NAME` from `'wordplay-v86'` to `'wordplay-v87'`
- Change all `?v=37` to `?v=38`

In `index.html`:
- Change all `?v=37` to `?v=38`

**Step 3: Final build check**

```bash
dotnet build --no-restore
```
Expected: Build succeeded, 0 errors.

**Step 4: Commit**

```bash
git add WordPlay/wwwroot/sw.js WordPlay/wwwroot/index.html
git commit -m "chore: apply avatar migration, bump SW cache and asset versions"
```

**Step 5: Deploy via Web Deploy from Visual Studio**

---

### Task 10: CSP Header Update (if needed)

**Files:**
- Modify: `WordPlay/Program.cs` (CSP header)

**Step 1: Check if CSP allows Cropper.js CDN**

Look at the Content-Security-Policy header in Program.cs. The `script-src` and `style-src` directives need to allow `https://cdnjs.cloudflare.com`. The `img-src` directive already allows `data:` (needed for base64 avatars).

If `cdnjs.cloudflare.com` is not in `script-src` or `style-src`, add it:

```
script-src 'self' https://cdnjs.cloudflare.com ...
style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com ...
```

Also ensure `img-src` includes `blob:` (used by Cropper.js internally):
```
img-src 'self' data: blob: ...
```

**Step 2: Commit if changes were needed**

```bash
git add WordPlay/Program.cs
git commit -m "chore: update CSP to allow Cropper.js CDN and blob: images"
```
