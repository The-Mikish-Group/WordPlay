using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Google.Apis.Auth;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace WordPlay.Services;

public class AuthService
{
    private readonly IConfiguration _config;
    private readonly ConfigurationManager<OpenIdConnectConfiguration>? _msOidc;

    public AuthService(IConfiguration config)
    {
        _config = config;

        var tenant = config["Auth:Microsoft:TenantId"] ?? "common";
        _msOidc = new ConfigurationManager<OpenIdConnectConfiguration>(
            $"https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration",
            new OpenIdConnectConfigurationRetriever(),
            new HttpDocumentRetriever());
    }

    public async Task<(string Sub, string? Email)> ValidateGoogleToken(string idToken)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _config["Auth:Google:ClientId"]! }
        };
        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
        return (payload.Subject, payload.Email);
    }

    public async Task<(string Sub, string? Email)> ValidateMicrosoftToken(string idToken)
    {
        var oidcConfig = await _msOidc!.GetConfigurationAsync(CancellationToken.None);
        var validationParams = new TokenValidationParameters
        {
            ValidIssuer = oidcConfig.Issuer,
            ValidAudience = _config["Auth:Microsoft:ClientId"],
            IssuerSigningKeys = oidcConfig.SigningKeys,
            ValidateLifetime = true,
        };
        // Microsoft common tenant issues tokens with tenant-specific issuers;
        // validate using a pattern to accept any Azure AD v2 tenant issuer
        validationParams.ValidateIssuer = true;
        validationParams.IssuerValidator = (issuer, token, parameters) =>
        {
            if (Regex.IsMatch(issuer, @"^https://login\.microsoftonline\.com/[0-9a-f\-]+/v2\.0$"))
                return issuer;
            throw new SecurityTokenInvalidIssuerException($"Invalid issuer: {issuer}");
        };

        var handler = new JwtSecurityTokenHandler();
        handler.ValidateToken(idToken, validationParams, out var validated);
        var jwt = (JwtSecurityToken)validated;
        var sub = jwt.Subject ?? jwt.Claims.FirstOrDefault(c => c.Type == "oid")?.Value
            ?? throw new SecurityTokenException("No subject in token");
        var email = jwt.Claims.FirstOrDefault(c => c.Type == "email" || c.Type == "preferred_username")?.Value;
        return (sub, email);
    }

    public string IssueJwt(int userId)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Auth:Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Auth:Jwt:Issuer"],
            audience: _config["Auth:Jwt:Audience"],
            claims: new[] { new Claim("uid", userId.ToString()) },
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
