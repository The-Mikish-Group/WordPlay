// ============================================================
// WordPlay — Authentication (Google / Microsoft)
// ============================================================

const AUTH_STORAGE_KEY = "wordplay-auth";

let _authState = null; // { jwt, user: { id, displayName, email } }
let _msalInstance = null;

function initAuth() {
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

function _saveAuth(jwt, user) {
    _authState = { jwt, user };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(_authState));
}

function signOut() {
    _authState = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

// ---- Google Sign-In (GSI) ----

function signInWithGoogle() {
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

        google.accounts.id.initialize({
            client_id: _googleClientId,
            callback: async (response) => {
                try { await handleAuth({ idToken: response.credential }); }
                catch (e) { reject(e); }
            },
        });
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // One Tap unavailable — open account picker popup directly
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
            }
        });
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
        _authState.user = { id: data.Id || data.id, displayName: data.DisplayName || data.displayName, email: data.Email || data.email, showOnLeaderboard: data.ShowOnLeaderboard ?? data.showOnLeaderboard ?? true };
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
