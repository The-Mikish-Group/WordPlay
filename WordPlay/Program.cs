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
    if (string.IsNullOrEmpty(url) || !url.StartsWith("https://www.wordscapescheat.com/"))
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

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();
