const CACHE_NAME = 'wordplay-v85';
const ASSETS = [
    '/',
    '/index.html',
    '/css/app.css?v=36',
    '/js/auth.js?v=36',
    '/js/sync.js?v=36',
    '/js/app.js?v=36',
    '/js/levels.js?v=36',
    '/js/level-loader.js?v=36',
    '/js/crossword.js?v=36',
    '/manifest.json',
    '/fonts/nunito-latin.woff2',
    '/fonts/nunito-latin-italic.woff2',
];

const DATA_CACHE = 'wordplay-data-v2';

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(c => c.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Only handle same-origin requests — let cross-origin scripts
    // (Google, MSAL) go straight to the network without interception
    if (url.origin !== self.location.origin) return;

    // API calls: network-only, never cache. Return 503 JSON if offline.
    if (url.pathname.startsWith('/api/')) {
        e.respondWith(
            fetch(e.request).catch(() =>
                new Response(JSON.stringify({ error: "offline" }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                })
            )
        );
        return;
    }

    // Data files (level chunks): cache after first fetch, then serve from cache
    if (url.pathname.startsWith('/data/')) {
        e.respondWith(
            caches.open(DATA_CACHE).then(cache =>
                cache.match(e.request).then(cached => {
                    if (cached) return cached;
                    return fetch(e.request).then(response => {
                        if (response.ok) {
                            cache.put(e.request, response.clone());
                        }
                        return response;
                    }).catch(() =>
                        new Response(JSON.stringify({ error: "offline" }), {
                            status: 503,
                            headers: { 'Content-Type': 'application/json' }
                        })
                    );
                })
            )
        );
        return;
    }

    // App shell: network-first, bypass HTTP cache so updates always propagate
    e.respondWith(
        fetch(e.request, { cache: 'no-store' })
            .then(response => {
                // Update cache with fresh response
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME && k !== DATA_CACHE)
                    .map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});
