using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WordPlay.Data;
using WordPlay.Models;
using WordPlay.Services;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---
builder.Services.AddDbContext<WordPlayDb>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Auth:Jwt:Issuer"],
            ValidAudience = builder.Configuration["Auth:Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Auth:Jwt:Secret"]!))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddHttpClient("scraper", client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    client.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml");
    client.Timeout = TimeSpan.FromSeconds(15);
});

var app = builder.Build();

// --- Middleware ---
app.UseAuthentication();
app.UseAuthorization();

// ============================================================
// Existing endpoints (unchanged)
// ============================================================

// Proxy endpoint for the browser-based scraper (avoids CORS issues)
app.MapGet("/api/proxy", async (string url, IHttpClientFactory factory) =>
{
    if (string.IsNullOrEmpty(url) || !url.StartsWith("https://www.wordscapescheat.com"))
        return Results.BadRequest("Only wordscapescheat.com URLs allowed");

    var client = factory.CreateClient("scraper");
    try
    {
        var html = await client.GetStringAsync(url);
        return Results.Text(html, "text/html");
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// Deploy endpoint: browser scraper sends chunk data, server writes to wwwroot/data/
app.MapPost("/api/deploy-data", async (HttpRequest request) =>
{
    var dataDir = Path.Combine(app.Environment.WebRootPath, "data");
    Directory.CreateDirectory(dataDir);

    using var reader = new StreamReader(request.Body);
    var json = await reader.ReadToEndAsync();
    var bundle = JsonSerializer.Deserialize<JsonElement>(json);

    int fileCount = 0;

    // Write chunk-manifest.json
    if (bundle.TryGetProperty("manifest", out var manifest))
    {
        await File.WriteAllTextAsync(
            Path.Combine(dataDir, "chunk-manifest.json"),
            JsonSerializer.Serialize(manifest, new JsonSerializerOptions { WriteIndented = true }));
        fileCount++;
    }

    // Write level-index.json
    if (bundle.TryGetProperty("levelIndex", out var levelIndex))
    {
        await File.WriteAllTextAsync(
            Path.Combine(dataDir, "level-index.json"),
            JsonSerializer.Serialize(levelIndex, new JsonSerializerOptions { WriteIndented = true }));
        fileCount++;
    }

    // Write individual chunk files
    if (bundle.TryGetProperty("chunks", out var chunks))
    {
        foreach (var chunk in chunks.EnumerateObject())
        {
            await File.WriteAllTextAsync(
                Path.Combine(dataDir, chunk.Name),
                JsonSerializer.Serialize(chunk.Value));
            fileCount++;
        }
    }

    return Results.Ok(new { files = fileCount, message = $"Deployed {fileCount} files to wwwroot/data/" });
});

// ============================================================
// Auth endpoints
// ============================================================

// Shared: find or create user, linking by email across providers
async Task<User> UpsertUser(WordPlayDb db, string provider, string sub, string? email)
{
    // First, look for exact provider+subject match
    var user = await db.Users.FirstOrDefaultAsync(u => u.Provider == provider && u.ProviderSubject == sub);
    if (user != null)
    {
        user.Email = email ?? user.Email;
        user.LastLoginAt = DateTime.UtcNow;
        return user;
    }

    // If email is known, link to existing account from a different provider
    if (!string.IsNullOrEmpty(email))
    {
        user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user != null)
        {
            // Update provider info so future logins match directly
            user.Provider = provider;
            user.ProviderSubject = sub;
            user.LastLoginAt = DateTime.UtcNow;
            return user;
        }
    }

    // Brand new user
    user = new User { Provider = provider, ProviderSubject = sub, Email = email };
    db.Users.Add(user);
    return user;
}

app.MapPost("/api/auth/google", async (HttpRequest request, WordPlayDb db, AuthService auth) =>
{
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("idToken", out var tokenEl))
        return Results.BadRequest(new { error = "idToken required" });

    try
    {
        var (sub, email) = await auth.ValidateGoogleToken(tokenEl.GetString()!);
        var user = await UpsertUser(db, "google", sub, email);
        await db.SaveChangesAsync();

        var jwt = auth.IssueJwt(user.Id);
        return Results.Ok(new
        {
            token = jwt,
            user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard }
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = "Invalid Google token", detail = ex.Message });
    }
});

app.MapPost("/api/auth/microsoft", async (HttpRequest request, WordPlayDb db, AuthService auth) =>
{
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("idToken", out var tokenEl))
        return Results.BadRequest(new { error = "idToken required" });

    try
    {
        var (sub, email) = await auth.ValidateMicrosoftToken(tokenEl.GetString()!);
        var user = await UpsertUser(db, "microsoft", sub, email);
        await db.SaveChangesAsync();

        var jwt = auth.IssueJwt(user.Id);
        return Results.Ok(new
        {
            token = jwt,
            user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard }
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = "Invalid Microsoft token", detail = ex.Message });
    }
});

app.MapPost("/api/auth/set-name", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var uidClaim = principal.FindFirst("uid")?.Value;
    if (uidClaim == null) return Results.Unauthorized();
    var userId = int.Parse(uidClaim);

    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("name", out var nameEl))
        return Results.BadRequest(new { error = "name required" });

    var name = nameEl.GetString()?.Trim() ?? "";
    if (name.Length < 3 || name.Length > 20)
        return Results.BadRequest(new { error = "Name must be 3-20 characters" });
    if (!System.Text.RegularExpressions.Regex.IsMatch(name, @"^[a-zA-Z0-9 ]+$"))
        return Results.BadRequest(new { error = "Name must be alphanumeric (spaces allowed)" });

    var user = await db.Users.FindAsync(userId);
    if (user == null) return Results.NotFound();

    user.DisplayName = name;
    await db.SaveChangesAsync();

    return Results.Ok(new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard });
}).RequireAuthorization();

app.MapPost("/api/auth/set-leaderboard", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var uidClaim = principal.FindFirst("uid")?.Value;
    if (uidClaim == null) return Results.Unauthorized();
    var userId = int.Parse(uidClaim);

    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("show", out var showEl))
        return Results.BadRequest(new { error = "show required" });

    var user = await db.Users.FindAsync(userId);
    if (user == null) return Results.NotFound();

    user.ShowOnLeaderboard = showEl.GetBoolean();
    await db.SaveChangesAsync();

    return Results.Ok(new { user.ShowOnLeaderboard });
}).RequireAuthorization();

// ============================================================
// Progress endpoints
// ============================================================

app.MapGet("/api/progress", async (WordPlayDb db, ClaimsPrincipal principal) =>
{
    var uidClaim = principal.FindFirst("uid")?.Value;
    if (uidClaim == null) return Results.Unauthorized();
    var userId = int.Parse(uidClaim);

    var progress = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == userId);
    if (progress == null)
        return Results.Ok(new { progress = (string?)null, updatedAt = (DateTime?)null });

    return Results.Ok(new { progress = progress.ProgressJson, updatedAt = progress.UpdatedAt });
}).RequireAuthorization();

app.MapPost("/api/progress", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var uidClaim = principal.FindFirst("uid")?.Value;
    if (uidClaim == null) return Results.Unauthorized();
    var userId = int.Parse(uidClaim);

    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("progress", out var progressEl))
        return Results.BadRequest(new { error = "progress required" });

    var progressJson = progressEl.GetRawText();

    // Extract denormalized fields
    int highestLevel = 0, levelsCompleted = 0;
    if (progressEl.TryGetProperty("hl", out var hlEl)) highestLevel = hlEl.GetInt32();
    if (progressEl.TryGetProperty("lc", out var lcEl)) levelsCompleted = lcEl.GetInt32();

    var progress = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == userId);
    if (progress == null)
    {
        progress = new UserProgress { UserId = userId };
        db.UserProgress.Add(progress);
    }

    // Monthly rollover: if the month changed, snapshot current level as the new baseline
    var nowMonth = DateTime.UtcNow.ToString("yyyy-MM");
    if (progress.CurrentMonth != nowMonth)
    {
        progress.MonthlyStart = progress.HighestLevel;
        progress.CurrentMonth = nowMonth;
    }

    // Large level jump (e.g. Set Progress): reset monthly baseline so it doesn't
    // inflate the leaderboard — their monthly count starts fresh from here
    if (highestLevel - progress.HighestLevel > 50)
    {
        progress.MonthlyStart = highestLevel;
    }

    progress.ProgressJson = progressJson;
    progress.HighestLevel = highestLevel;
    progress.LevelsCompleted = levelsCompleted;
    progress.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok(new { updatedAt = progress.UpdatedAt });
}).RequireAuthorization();

// ============================================================
// Leaderboard endpoint
// ============================================================

app.MapGet("/api/leaderboard", async (WordPlayDb db, int? top, string? period) =>
{
    var count = Math.Clamp(top ?? 50, 1, 100);
    var nowMonth = DateTime.UtcNow.ToString("yyyy-MM");

    if (period == "month")
    {
        var leaders = await db.UserProgress
            .Include(p => p.User)
            .Where(p => p.User.DisplayName != null && p.User.ShowOnLeaderboard && p.CurrentMonth == nowMonth)
            .Select(p => new
            {
                userId = p.UserId,
                name = p.User.DisplayName,
                highestLevel = p.HighestLevel,
                levelsCompleted = p.LevelsCompleted,
                monthlyGain = p.HighestLevel - p.MonthlyStart
            })
            .Where(p => p.monthlyGain > 0)
            .OrderByDescending(p => p.monthlyGain)
            .ThenByDescending(p => p.highestLevel)
            .Take(count)
            .ToListAsync();
        return Results.Ok(leaders);
    }
    else
    {
        var leaders = await db.UserProgress
            .Include(p => p.User)
            .Where(p => p.User.DisplayName != null && p.User.ShowOnLeaderboard)
            .OrderByDescending(p => p.HighestLevel)
            .ThenByDescending(p => p.LevelsCompleted)
            .Take(count)
            .Select(p => new
            {
                userId = p.UserId,
                name = p.User.DisplayName,
                highestLevel = p.HighestLevel,
                levelsCompleted = p.LevelsCompleted,
                monthlyGain = 0
            })
            .ToListAsync();
        return Results.Ok(leaders);
    }
});

// ============================================================
// Static files
// ============================================================

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();
