var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient("scraper", client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    client.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml");
    client.Timeout = TimeSpan.FromSeconds(15);
});
var app = builder.Build();

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
    var bundle = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(json);

    int fileCount = 0;

    // Write chunk-manifest.json
    if (bundle.TryGetProperty("manifest", out var manifest))
    {
        await File.WriteAllTextAsync(
            Path.Combine(dataDir, "chunk-manifest.json"),
            System.Text.Json.JsonSerializer.Serialize(manifest, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
        fileCount++;
    }

    // Write level-index.json
    if (bundle.TryGetProperty("levelIndex", out var levelIndex))
    {
        await File.WriteAllTextAsync(
            Path.Combine(dataDir, "level-index.json"),
            System.Text.Json.JsonSerializer.Serialize(levelIndex, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
        fileCount++;
    }

    // Write individual chunk files
    if (bundle.TryGetProperty("chunks", out var chunks))
    {
        foreach (var chunk in chunks.EnumerateObject())
        {
            await File.WriteAllTextAsync(
                Path.Combine(dataDir, chunk.Name),
                System.Text.Json.JsonSerializer.Serialize(chunk.Value));
            fileCount++;
        }
    }

    return Results.Ok(new { files = fileCount, message = $"Deployed {fileCount} files to wwwroot/data/" });
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();
