// ============================================================
// WordPlay — Authentication (Google / Microsoft)
// ============================================================

const AUTH_STORAGE_KEY = "wordplay-auth";

let _authState = null; // { jwt, user: { id, displayName, email, avatarData } }
let _msalInstance = null;

// Set to true by initAuth() if a stored JWT was found but had already expired.
// app.js reads this AFTER first render and surfaces a toast so the player
// actually knows their sync is broken.  Without this, expired tokens were
// being purged silently and players saw no signal at all — they kept playing
// while their progress vanished into the void.
window._authExpiredAtStartup = false;

// iOS PWAs in standalone mode (added to home screen) cannot reliably use
// popup-based OAuth: window.open() spawns a separate Safari process and the
// postMessage callback never reaches the PWA WebView.  Sign-ins "succeed" in
// Safari but the JWT never lands in the PWA's localStorage — the user thinks
// they're signed in, but the PWA still has no auth.
function _isIosStandalone() {
    const ua = navigator.userAgent || "";
    const isIos = /iPad|iPhone|iPod/.test(ua);
    if (!isIos) return false;
    const standalone = window.navigator.standalone === true
        || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    return !!standalone;
}

function _randomState() {
    // 128 bits of entropy as base64url
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode.apply(null, bytes))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function initAuth() {
    // First: if we just came back from an OAuth full-page redirect, the URL
    // fragment carries the access token (Google) or id token (Microsoft).
    // Complete that exchange before we look at localStorage so the user lands
    // signed in.
    try {
        await _completeOAuthRedirectIfNeeded();
    } catch (e) { /* fall through to existing-auth load */ }

    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) {
            _authState = JSON.parse(raw);
            // Check JWT expiry (JWT payload is base64url in part[1])
            if (_authState && _authState.jwt) {
                const payload = JSON.parse(atob(_authState.jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    _authState = null;
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                    window._authExpiredAtStartup = true;
                }
            }
        }
    } catch (e) {
        _authState = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
}

function isSignedIn() {
    return !!(_authState && _authState.jwt);
}

function getUser() {
    return _authState ? _authState.user : null;
}

function getAuthHeaders() {
    if (!_authState || !_authState.jwt) return {};
    return { Authorization: "Bearer " + _authState.jwt };
}

function isAdmin() {
    return _authState && _authState.user && _authState.user.role === "admin";
}

function _saveAuth(jwt, user) {
    _authState = { jwt, user };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(_authState));
}

function signOut() {
    _authState = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

// ---- OAuth Redirect Flow (iOS standalone PWA) ----
//
// The popup-based SDKs (google.accounts.oauth2.initTokenClient and MSAL
// loginPopup) silently fail in iOS standalone PWAs.  As a fallback we run a
// raw OAuth 2.0 implicit-style redirect: navigate the whole tab to the
// provider, the provider redirects back to our origin with the token in the
// URL fragment, and initAuth() picks it up on the next app load.
//
// NOTE: this requires the OAuth client configurations to authorize
// `window.location.origin + "/"` as a redirect URI.  If iOS users still
// silently fail after this ships, that's the first thing to check.

const _OAUTH_STATE_KEY = "wordplay-oauth-state";
const _OAUTH_NONCE_KEY = "wordplay-oauth-nonce";
const _OAUTH_PROVIDER_KEY = "wordplay-oauth-provider";

function _redirectToGoogleOAuth() {
    const state = _randomState();
    sessionStorage.setItem(_OAUTH_STATE_KEY, state);
    sessionStorage.setItem(_OAUTH_PROVIDER_KEY, "google");
    const params = new URLSearchParams({
        client_id: _googleClientId,
        redirect_uri: window.location.origin + "/",
        response_type: "token",
        scope: "openid email profile",
        state,
        prompt: "select_account",
        include_granted_scopes: "true",
    });
    window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}

function _redirectToMicrosoftOAuth() {
    const state = _randomState();
    const nonce = _randomState();
    sessionStorage.setItem(_OAUTH_STATE_KEY, state);
    sessionStorage.setItem(_OAUTH_NONCE_KEY, nonce);
    sessionStorage.setItem(_OAUTH_PROVIDER_KEY, "microsoft");
    const params = new URLSearchParams({
        client_id: _microsoftClientId,
        redirect_uri: window.location.origin + "/",
        response_type: "id_token",
        scope: "openid email profile",
        state,
        nonce,
        response_mode: "fragment",
        prompt: "select_account",
    });
    window.location.href = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" + params.toString();
}

async function _completeOAuthRedirectIfNeeded() {
    if (!window.location.hash || window.location.hash.length < 2) return false;
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get("access_token");
    const idToken = params.get("id_token");
    const state = params.get("state");
    const error = params.get("error");

    // Not an OAuth callback at all — leave the hash alone (might be app routing)
    if (!accessToken && !idToken && !error) return false;

    const expectedState = sessionStorage.getItem(_OAUTH_STATE_KEY);
    const expectedNonce = sessionStorage.getItem(_OAUTH_NONCE_KEY);
    const provider = sessionStorage.getItem(_OAUTH_PROVIDER_KEY);
    sessionStorage.removeItem(_OAUTH_STATE_KEY);
    sessionStorage.removeItem(_OAUTH_NONCE_KEY);
    sessionStorage.removeItem(_OAUTH_PROVIDER_KEY);

    // Always strip the fragment so a refresh doesn't re-trigger this path
    history.replaceState(null, "", window.location.pathname + window.location.search);

    if (error) {
        window._signInError = "Sign-in cancelled or failed";
        return false;
    }
    if (!provider || !expectedState || state !== expectedState) {
        window._signInError = "Sign-in failed — please try again";
        return false;
    }

    try {
        if (provider === "google" && accessToken) {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken }),
            });
            if (!res.ok) throw new Error("Auth failed");
            const data = await res.json();
            _saveAuth(data.token, data.user);
            window._signInJustCompleted = true;
            return true;
        }
        if (provider === "microsoft" && idToken) {
            // Verify nonce in the id_token before trusting it.  ASP.NET will
            // re-validate signature + claims, but we double-check the nonce
            // here so a stale/replayed token can't sneak through.
            try {
                const payload = JSON.parse(atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
                if (!expectedNonce || payload.nonce !== expectedNonce) throw new Error("nonce mismatch");
            } catch (e) {
                window._signInError = "Sign-in failed — please try again";
                return false;
            }
            const res = await fetch("/api/auth/microsoft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });
            if (!res.ok) throw new Error("Auth failed");
            const data = await res.json();
            _saveAuth(data.token, data.user);
            window._signInJustCompleted = true;
            return true;
        }
    } catch (e) {
        window._signInError = "Sign-in failed — please try again";
    }
    return false;
}

// ---- Google Sign-In (GSI) ----

function signInWithGoogle() {
    // iOS standalone PWA: popup OAuth silently fails (popup opens in a
    // separate Safari process, postMessage never delivers).  Use a full-page
    // redirect instead.  The redirect handler in initAuth() picks up the
    // token on next app load.
    if (_isIosStandalone()) {
        _redirectToGoogleOAuth();
        // Returns a never-resolving promise: the page is navigating away.
        // The .catch in the click handler shouldn't fire spurious errors
        // during the brief moment before the navigation commits.
        return new Promise(() => {});
    }

    return new Promise((resolve, reject) => {
        if (typeof google === "undefined" || !google.accounts) {
            reject(new Error("Google Identity Services not loaded"));
            return;
        }

        async function handleAuth(body) {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error("Auth failed");
            const data = await res.json();
            _saveAuth(data.token, data.user);
            resolve(data.user);
        }

        // Go straight to OAuth popup — don't use One Tap (google.accounts.id.prompt)
        // because One Tap has rate-limiting/cooldown that causes silent failures on mobile
        var tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: _googleClientId,
            scope: "openid email profile",
            callback: async (tokenResponse) => {
                if (tokenResponse.error) { reject(new Error(tokenResponse.error)); return; }
                try { await handleAuth({ accessToken: tokenResponse.access_token }); }
                catch (e) { reject(e); }
            },
            error_callback: (err) => { reject(new Error(err.message || "Google sign-in cancelled")); },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
    });
}

// ---- Microsoft Sign-In (MSAL) ----

function _getMsalInstance() {
    if (_msalInstance) return _msalInstance;
    if (typeof msal === "undefined") return null;
    _msalInstance = new msal.PublicClientApplication({
        auth: {
            clientId: _microsoftClientId,
            authority: "https://login.microsoftonline.com/common",
            redirectUri: window.location.origin,
        },
        cache: {
            cacheLocation: "sessionStorage",
            storeAuthStateInCookie: false,
        },
    });
    return _msalInstance;
}

async function signInWithMicrosoft() {
    // iOS standalone PWA: same popup problem as Google.  Use a full-page
    // OAuth redirect (raw OIDC, not MSAL) and let initAuth() complete the
    // exchange when the user returns.
    if (_isIosStandalone()) {
        _redirectToMicrosoftOAuth();
        return new Promise(() => {});
    }

    const msalApp = _getMsalInstance();
    if (!msalApp) throw new Error("MSAL not loaded");

    await msalApp.initialize();
    const loginResponse = await msalApp.loginPopup({
        scopes: ["openid", "email", "profile"],
    });

    const res = await fetch("/api/auth/microsoft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: loginResponse.idToken }),
    });
    if (!res.ok) throw new Error("Auth failed");
    const data = await res.json();
    _saveAuth(data.token, data.user);
    return data.user;
}

// Verify a freshly-issued JWT actually works against the API.  If it doesn't,
// we sign the user back out and surface a clear toast — which is better than
// the previous silent state where iOS PWA users would "sign in" without
// actually getting a working session.
async function verifySignInWorks() {
    if (!isSignedIn()) return false;
    try {
        const res = await fetch("/api/progress", { headers: getAuthHeaders() });
        if (res.status === 401) {
            signOut();
            return false;
        }
        return true;
    } catch (e) {
        // Network failure — give the user the benefit of the doubt; they'll
        // find out at first sync attempt.  Don't fail the sign-in for a
        // transient network issue.
        return true;
    }
}

// ---- Display Name ----

async function setDisplayName(name) {
    const res = await fetch("/api/auth/set-name", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to set name");
    }
    const data = await res.json();
    if (_authState) {
        _authState.user = { id: data.Id || data.id, displayName: data.DisplayName || data.displayName, email: data.Email || data.email, showOnLeaderboard: data.ShowOnLeaderboard ?? data.showOnLeaderboard ?? true, role: data.Role || data.role || "user", avatarData: data.AvatarData || data.avatarData || null };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(_authState));
    }
    return data;
}

// ---- Leaderboard Visibility ----

async function setLeaderboardVisibility(show) {
    const res = await fetch("/api/auth/set-leaderboard", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ show }),
    });
    if (!res.ok) throw new Error("Failed to update");
    if (_authState) {
        _authState.user.showOnLeaderboard = show;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(_authState));
    }
}

// ---- Avatar ----

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

// Client IDs — set from appsettings via inline script or hardcoded
var _googleClientId = "";
var _microsoftClientId = "";

// Auto-fetch client IDs from a meta tag or config endpoint
(function() {
    var metaG = document.querySelector('meta[name="google-client-id"]');
    var metaM = document.querySelector('meta[name="microsoft-client-id"]');
    if (metaG) _googleClientId = metaG.content;
    if (metaM) _microsoftClientId = metaM.content;
})();
