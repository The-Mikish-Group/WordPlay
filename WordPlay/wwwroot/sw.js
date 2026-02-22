const CACHE_NAME = 'wordplay-v45';
const ASSETS = [
    '/',
    '/index.html',
    '/css/app.css?v=5',
    '/js/app.js?v=5',
    '/js/levels.js?v=5',
    '/js/level-loader.js?v=5',
    '/js/crossword.js?v=5',
    '/manifest.json',
];

const DATA_CACHE = 'wordplay-data-v2';

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

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
                    });
                })
            )
        );
        return;
    }

    // App shell: network-first (always get latest, fall back to cache offline)
    e.respondWith(
        fetch(e.request)
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
