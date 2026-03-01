using System.Collections.Concurrent;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MimeKit;
using WordPlay.Data;
using WordPlay.Models;
using WordPlay.Services;

// Helper: Central Time for monthly rollovers
var _centralTz = TimeZoneInfo.FindSystemTimeZoneById(
    OperatingSystem.IsWindows() ? "Central Standard Time" : "America/Chicago");
string CentralMonth() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _centralTz).ToString("yyyy-MM");

var _jsonIndented = new JsonSerializerOptions { WriteIndented = true };
var _alphanumericRegex = new Regex(@"^[a-zA-Z0-9 ]+$", RegexOptions.Compiled);
var _contactRateLimit = new ConcurrentDictionary<string, List<DateTime>>();

int? GetUserId(ClaimsPrincipal principal)
{
    var claim = principal.FindFirst("uid")?.Value;
    return claim != null && int.TryParse(claim, out var id) ? id : null;
}

string? GetUserRole(ClaimsPrincipal principal)
{
    return principal.FindFirst("role")?.Value;
}

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

// Limit request body size globally (50 MB to accommodate deploy endpoint;
// individual endpoints enforce their own limits via application-level validation)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 52_428_800; // 50 MB
});

var app = builder.Build();

// --- Pacing config ---
var pacingBridgetId = builder.Configuration.GetValue<int>("Pacing:BridgetUserId");
var pacingEddieId = builder.Configuration.GetValue<int>("Pacing:EddieUserId");

// --- Middleware ---

// Security headers
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    headers["Content-Security-Policy"] =
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://accounts.google.com https://alcdn.msauth.net; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "connect-src 'self' https://accounts.google.com https://www.googleapis.com https://login.microsoftonline.com; " +
        "frame-src https://accounts.google.com https://login.microsoftonline.com; " +
        "font-src 'self'";
    await next();
});

if (!app.Environment.IsDevelopment())
    app.UseHsts();

// Block access to scraper.html in production
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/scraper.html"))
    {
        context.Response.StatusCode = 404;
        return;
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

// ============================================================
// Existing endpoints (unchanged)
// ============================================================

// Proxy endpoint for the browser-based scraper (avoids CORS issues)
app.MapGet("/api/proxy", async (string url, IHttpClientFactory factory) =>
{
    if (string.IsNullOrEmpty(url) ||
        !Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
        uri.Scheme != "https" ||
        uri.Host != "www.wordscapescheat.com")
        return Results.BadRequest("Only wordscapescheat.com URLs allowed");

    var client = factory.CreateClient("scraper");
    try
    {
        var html = await client.GetStringAsync(uri);
        return Results.Text(html, "text/html");
    }
    catch
    {
        return Results.Problem("Failed to fetch URL");
    }
});

// Deploy endpoint: browser scraper sends chunk data, server writes to wwwroot/data/
var _chunkFilenameRegex = new Regex(@"^levels-\d{6}-\d{6}\.json$", RegexOptions.Compiled);

app.MapPost("/api/deploy-data", async (HttpRequest request, IConfiguration config) =>
{
    // Require deploy key for authentication
    var expectedKey = config["DeployKey"];
    var providedKey = request.Headers["X-Deploy-Key"].FirstOrDefault();
    if (string.IsNullOrEmpty(expectedKey) || providedKey != expectedKey)
        return Results.Unauthorized();

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
            JsonSerializer.Serialize(manifest, _jsonIndented));
        fileCount++;
    }

    // Write level-index.json
    if (bundle.TryGetProperty("levelIndex", out var levelIndex))
    {
        await File.WriteAllTextAsync(
            Path.Combine(dataDir, "level-index.json"),
            JsonSerializer.Serialize(levelIndex, _jsonIndented));
        fileCount++;
    }

    // Write individual chunk files — validate filenames to prevent path traversal
    if (bundle.TryGetProperty("chunks", out var chunks))
    {
        foreach (var chunk in chunks.EnumerateObject())
        {
            if (!_chunkFilenameRegex.IsMatch(chunk.Name))
                continue; // skip invalid filenames

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
        if (user.Role == "bot")
            throw new InvalidOperationException("Bot accounts cannot sign in");
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

app.MapPost("/api/auth/google", async (HttpRequest request, WordPlayDb db, AuthService auth, IHttpClientFactory factory) =>
{
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);

    try
    {
        string sub;
        string? email;

        if (body.TryGetProperty("idToken", out var tokenEl))
        {
            (sub, email) = await auth.ValidateGoogleToken(tokenEl.GetString()!);
        }
        else if (body.TryGetProperty("accessToken", out var atEl))
        {
            // Verify access token via Google's userinfo endpoint
            var client = factory.CreateClient();
            var req = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
            req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", atEl.GetString()!);
            var res = await client.SendAsync(req);
            if (!res.IsSuccessStatusCode)
                return Results.BadRequest(new { error = "Invalid Google access token" });
            var info = await JsonSerializer.DeserializeAsync<JsonElement>(await res.Content.ReadAsStreamAsync());
            sub = info.GetProperty("sub").GetString()!;
            email = info.TryGetProperty("email", out var emailEl) ? emailEl.GetString() : null;
        }
        else
        {
            return Results.BadRequest(new { error = "idToken or accessToken required" });
        }

        var user = await UpsertUser(db, "google", sub, email);
        await db.SaveChangesAsync();

        var jwt = auth.IssueJwt(user.Id, user.Role);
        return Results.Ok(new
        {
            token = jwt,
            user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role }
        });
    }
    catch
    {
        return Results.BadRequest(new { error = "Invalid Google token" });
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

        var jwt = auth.IssueJwt(user.Id, user.Role);
        return Results.Ok(new
        {
            token = jwt,
            user = new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role }
        });
    }
    catch
    {
        return Results.BadRequest(new { error = "Invalid Microsoft token" });
    }
});

app.MapPost("/api/auth/set-name", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("name", out var nameEl))
        return Results.BadRequest(new { error = "name required" });

    var name = nameEl.GetString()?.Trim() ?? "";
    if (name.Length < 3 || name.Length > 20)
        return Results.BadRequest(new { error = "Name must be 3-20 characters" });
    if (!_alphanumericRegex.IsMatch(name))
        return Results.BadRequest(new { error = "Name must be alphanumeric (spaces allowed)" });

    var user = await db.Users.FindAsync(userId);
    if (user == null) return Results.NotFound();

    user.DisplayName = name;
    await db.SaveChangesAsync();

    return Results.Ok(new { user.Id, user.DisplayName, user.Email, user.ShowOnLeaderboard, user.Role });
}).RequireAuthorization();

app.MapPost("/api/auth/set-leaderboard", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

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
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var progress = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == userId);
    if (progress == null)
        return Results.Ok(new { progress = (string?)null, updatedAt = (DateTime?)null,
            monthlyStart = 0, monthlyCoinsStart = 0 });

    return Results.Ok(new { progress = progress.ProgressJson, updatedAt = progress.UpdatedAt,
        monthlyStart = progress.MonthlyStart, monthlyCoinsStart = progress.MonthlyCoinsStart });
}).RequireAuthorization();

app.MapPost("/api/progress", async (HttpRequest request, WordPlayDb db, ClaimsPrincipal principal) =>
{
    var userId = GetUserId(principal);
    if (userId == null) return Results.Unauthorized();

    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    if (!body.TryGetProperty("progress", out var progressEl))
        return Results.BadRequest(new { error = "progress required" });

    var progressJson = progressEl.GetRawText();
    if (progressJson.Length > 65_536)
        return Results.BadRequest(new { error = "Progress data too large" });

    // Extract denormalized fields
    int highestLevel = 0, levelsCompleted = 0, totalCoinsEarned = 0;
    if (progressEl.TryGetProperty("hl", out var hlEl)) highestLevel = hlEl.GetInt32();
    if (progressEl.TryGetProperty("lc", out var lcEl)) levelsCompleted = lcEl.GetInt32();
    if (progressEl.TryGetProperty("tce", out var tceEl)) totalCoinsEarned = tceEl.GetInt32();

    var progress = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == userId);
    if (progress == null)
    {
        progress = new UserProgress { UserId = userId.Value };
        db.UserProgress.Add(progress);
    }

    // Guard: reject stale client data that would lower progress.
    // Level can only go up through the API. Corrections go through direct DB updates.
    if (highestLevel < progress.HighestLevel)
        return Results.Ok(new { updatedAt = progress.UpdatedAt });

    // Monthly rollover: if the month changed, snapshot current level and coins as the new baseline
    var nowMonth = CentralMonth();
    if (progress.CurrentMonth != nowMonth)
    {
        progress.MonthlyStart = progress.HighestLevel;
        progress.MonthlyCoinsStart = progress.TotalCoinsEarned;
        progress.CurrentMonth = nowMonth;
    }

    // Allow explicit monthlyStart / monthlyCoinsStart override (e.g. admin fix)
    var hasExplicitOverride = false;
    if (body.TryGetProperty("monthlyStart", out var msEl))
    {
        progress.MonthlyStart = msEl.GetInt32();
        hasExplicitOverride = true;
    }
    if (body.TryGetProperty("monthlyCoinsStart", out var mcsEl))
    {
        progress.MonthlyCoinsStart = mcsEl.GetInt32();
        hasExplicitOverride = true;
    }
    if (!hasExplicitOverride)
    {
        // Large level change (e.g. Set Progress): reset monthly baseline so it doesn't
        // inflate the leaderboard — their monthly count starts fresh from here
        var levelDelta = highestLevel - progress.HighestLevel;
        if (levelDelta > 50 || levelDelta < -10)
        {
            progress.MonthlyStart = highestLevel;
            progress.MonthlyCoinsStart = totalCoinsEarned;
        }
    }

    // Sanity guard: reject grossly inflated coins (e.g. cross-user contamination).
    // Normal play averages ~100 coins/level; 250× is extremely generous headroom.
    if (highestLevel > 0 && totalCoinsEarned > highestLevel * 250)
    {
        totalCoinsEarned = highestLevel * 100;
        progressJson = System.Text.RegularExpressions.Regex.Replace(
            progressJson, @"""tce"":\d+", $"\"tce\":{totalCoinsEarned}");
    }

    progress.ProgressJson = progressJson;
    progress.HighestLevel = highestLevel;
    progress.LevelsCompleted = levelsCompleted;
    progress.TotalCoinsEarned = totalCoinsEarned;
    progress.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    // --- Auto-pace Fast Eddie ---
    if (pacingBridgetId > 0 && pacingEddieId > 0 && userId == pacingBridgetId)
    {
        var eddie = await db.UserProgress.FirstOrDefaultAsync(p => p.UserId == pacingEddieId);
        if (eddie != null)
        {
            // Monthly rollover for Eddie
            var eddieMonth = CentralMonth();
            if (eddie.CurrentMonth != eddieMonth)
            {
                eddie.MonthlyStart = eddie.HighestLevel;
                eddie.MonthlyCoinsStart = eddie.TotalCoinsEarned;
                eddie.CurrentMonth = eddieMonth;
            }

            // Deterministic random: stable for a given day+level, shifts as Bridget advances
            var seed = DateTime.UtcNow.DayOfYear * 1000 + highestLevel;
            var rng = new Random(seed);

            // Level gap distribution
            var roll = rng.NextDouble();
            int gap;
            if (roll < 0.08)         // 8%: Bridget ties or briefly leads
                gap = rng.Next(-1, 1);
            else if (roll < 0.25)    // 17%: close race
                gap = rng.Next(1, 3);
            else                     // 75%: Eddie's comfortable lead
                gap = rng.Next(3, 9);

            var targetLevel = highestLevel + gap;

            // Also ensure Eddie stays ahead on the monthly leaderboard
            var bridgetMonthlyGain = highestLevel - progress.MonthlyStart;
            var eddieMonthlyGain = eddie.HighestLevel - eddie.MonthlyStart;
            if (eddieMonthlyGain <= bridgetMonthlyGain)
            {
                // Eddie needs at least as many monthly levels as Bridget, plus the gap
                var monthlyTarget = eddie.MonthlyStart + bridgetMonthlyGain + Math.Max(gap, 1);
                targetLevel = Math.Max(targetLevel, monthlyTarget);
            }

            // Only bump UP — never decrease Eddie's level
            if (targetLevel > eddie.HighestLevel)
            {
                var levelIncrease = targetLevel - eddie.HighestLevel;
                var coinsPerLevel = rng.Next(6, 17);
                var coinBonus = rng.Next(50, 301);
                var targetCoins = Math.Max(
                    eddie.TotalCoinsEarned + levelIncrease * coinsPerLevel + coinBonus,
                    totalCoinsEarned + rng.Next(50, 301));

                // Also ensure Eddie stays ahead on monthly coins leaderboard
                var bridgetMonthlyCoins = totalCoinsEarned - progress.MonthlyCoinsStart;
                var eddieMonthlyCoins = targetCoins - eddie.MonthlyCoinsStart;
                if (eddieMonthlyCoins <= bridgetMonthlyCoins)
                    targetCoins = eddie.MonthlyCoinsStart + bridgetMonthlyCoins + rng.Next(50, 301);

                // Update ProgressJson fields
                var eddieNode = JsonNode.Parse(eddie.ProgressJson ?? "{}")?.AsObject()
                    ?? new JsonObject();
                eddieNode["hl"] = targetLevel;
                eddieNode["lc"] = targetLevel;
                eddieNode["tce"] = targetCoins;
                eddieNode["cl"] = targetLevel;

                eddie.ProgressJson = eddieNode.ToJsonString();
                eddie.HighestLevel = targetLevel;
                eddie.LevelsCompleted = targetLevel;
                eddie.TotalCoinsEarned = targetCoins;
                eddie.UpdatedAt = DateTime.UtcNow;

                await db.SaveChangesAsync();
            }
        }
    }

    return Results.Ok(new { updatedAt = progress.UpdatedAt });
}).RequireAuthorization();

// ============================================================
// Leaderboard endpoint
// ============================================================

app.MapGet("/api/leaderboard", async (WordPlayDb db, int? top, string? period, string? rankType) =>
{
    var count = Math.Clamp(top ?? 50, 1, 100);
    var nowMonth = CentralMonth();
    var isMonthly = period == "month";
    var byPoints = rankType == "points";

    var query = db.UserProgress
        .Include(p => p.User)
        .Where(p => p.User.DisplayName != null && p.User.ShowOnLeaderboard);

    if (isMonthly)
        query = query.Where(p => p.CurrentMonth == nowMonth);

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

    if (isMonthly)
        projected = byPoints
            ? projected.Where(p => p.monthlyCoinsGain > 0)
            : projected.Where(p => p.monthlyGain > 0);

    projected = (isMonthly, byPoints) switch
    {
        (true, true) => projected.OrderByDescending(p => p.monthlyCoinsGain)
                                  .ThenByDescending(p => p.totalCoinsEarned),
        (true, false) => projected.OrderByDescending(p => p.monthlyGain)
                                   .ThenByDescending(p => p.highestLevel),
        (false, true) => projected.OrderByDescending(p => p.totalCoinsEarned)
                                   .ThenByDescending(p => p.highestLevel),
        _ => projected.OrderByDescending(p => p.highestLevel)
                       .ThenByDescending(p => p.levelsCompleted),
    };

    var leaders = await projected.Take(count).ToListAsync();
    return Results.Ok(leaders);
});

// ============================================================
// Contact endpoint
// ============================================================

app.MapPost("/api/contact", async (HttpRequest request, IConfiguration config) =>
{
    var body = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);

    string? name = body.TryGetProperty("name", out var n) ? n.GetString()?.Trim() : null;
    string? email = body.TryGetProperty("email", out var e) ? e.GetString()?.Trim() : null;
    string? subject = body.TryGetProperty("subject", out var s) ? s.GetString()?.Trim() : null;
    string? message = body.TryGetProperty("message", out var m) ? m.GetString()?.Trim() : null;

    // Anti-spam layer 1: Honeypot — reject if hidden field was filled
    string? honeypot = body.TryGetProperty("website", out var hp) ? hp.GetString() : null;
    if (!string.IsNullOrEmpty(honeypot))
        return Results.Ok(new { success = true }); // Silent success to not tip off bots

    // Anti-spam layer 2: JS token — must be present and match expected format
    string? token = body.TryGetProperty("token", out var tk) ? tk.GetString() : null;
    if (string.IsNullOrEmpty(token) || !token.StartsWith("wp-") || token.Split('-').Length != 3)
        return Results.BadRequest(new { error = "Invalid request. Please reload the page and try again." });

    // Anti-spam layer 3: Timing — reject submissions faster than 3 seconds
    string? tsStr = body.TryGetProperty("ts", out var ts) ? ts.GetString() : null;
    if (!string.IsNullOrEmpty(tsStr) && long.TryParse(tsStr, out var tsMs))
    {
        var formOpenedAt = DateTimeOffset.FromUnixTimeMilliseconds(tsMs).UtcDateTime;
        if ((DateTime.UtcNow - formOpenedAt).TotalSeconds < 3)
            return Results.BadRequest(new { error = "Please take a moment before submitting." });
    }
    else
    {
        return Results.BadRequest(new { error = "Invalid request. Please reload the page and try again." });
    }

    if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(email) ||
        string.IsNullOrEmpty(subject) || string.IsNullOrEmpty(message))
        return Results.BadRequest(new { error = "All fields are required" });

    // Length limits to prevent abuse
    if (name.Length > 100)
        return Results.BadRequest(new { error = "Name is too long" });
    if (email.Length > 254)
        return Results.BadRequest(new { error = "Email is too long" });
    if (subject.Length > 200)
        return Results.BadRequest(new { error = "Subject is too long" });
    if (message.Length > 5000)
        return Results.BadRequest(new { error = "Message is too long (max 5000 characters)" });

    // Reject newlines in single-line fields (header injection prevention)
    if (name.Contains('\n') || name.Contains('\r') ||
        subject.Contains('\n') || subject.Contains('\r'))
        return Results.BadRequest(new { error = "Invalid characters in name or subject" });

    // Strict email validation
    try { var _ = new System.Net.Mail.MailAddress(email); }
    catch { return Results.BadRequest(new { error = "Invalid email address" }); }

    // Rate limit: 3 per 10 minutes per IP
    var ip = request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var now = DateTime.UtcNow;
    var timestamps = _contactRateLimit.GetOrAdd(ip, _ => new List<DateTime>());
    lock (timestamps)
    {
        timestamps.RemoveAll(t => now - t > TimeSpan.FromMinutes(10));
        if (timestamps.Count >= 3)
            return Results.Json(new { error = "Too many requests. Please try again later." }, statusCode: 429);
        timestamps.Add(now);
    }

    try
    {
        var smtpHost = config["Smtp:Host"]!;
        var smtpPort = int.Parse(config["Smtp:Port"]!);
        var smtpUser = config["Smtp:Username"]!;
        var smtpPass = config["Smtp:Password"]!;
        var fromAddr = config["Smtp:FromAddress"]!;
        var toAddr = config["Smtp:ToAddress"]!;

        var msg = new MimeMessage();
        msg.From.Add(MailboxAddress.Parse(fromAddr));
        msg.To.Add(MailboxAddress.Parse(toAddr));
        msg.ReplyTo.Add(MailboxAddress.Parse(email));
        msg.Subject = $"[WordPlay Contact] {subject}";
        msg.Body = new TextPart("plain")
        {
            Text = $"From: {name} <{email}>\n\n{message}"
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(smtpUser, smtpPass);
        await client.SendAsync(msg);
        await client.DisconnectAsync(true);

        return Results.Ok(new { success = true });
    }
    catch
    {
        return Results.Problem("Failed to send message. Please try again later.");
    }
});

// ============================================================
// Static files
// ============================================================

app.UseDefaultFiles();
// Serve sw.js and index.html with no-cache so browsers always check for updates
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var name = ctx.File.Name;
        if (name == "sw.js" || name == "index.html")
        {
            ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store";
        }
    }
});

app.Run();
