const CACHE_NAME = 'contabilita-v4';
const urlsToCache = [
    '/mercatino/index.html',
    '/mercatino/manifest.json',
    '/mercatino/icons/icon1.jpg',
    '/mercatino/icons/icon2.jpg',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Installazione
self.addEventListener('install', event => {
    console.log('[SW] Installazione. Pre-caching...');
    event.waitUntil(
        caches.open(CACHE_NAME)
              .then(cache => cache.addAll(urlsToCache))
              .catch(err => console.error('[SW] Errore pre-caching:', err))
    );
    self.skipWaiting();
});

// Attivazione
self.addEventListener('activate', event => {
    console.log('[SW] Attivato. Pulizia cache obsolete...');
    const whitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => !whitelist.includes(key) ? caches.delete(key) : null))
        )
    );
    self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(resp => resp || fetch(event.request))
    );
});
