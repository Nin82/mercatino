const CACHE_NAME = 'contabilita-v3';
const urlsToCache = [
    '/',
    '/mercatino/index.html',
    '/mercatino/manifest.json',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    '/mercatino/icons/icon1.jpg',
    '/mercatino/icons/icon2.jpg'
];

// 1️⃣ Installazione
self.addEventListener('install', event => {
    console.log('[SW] Installazione...');
    event.waitUntil(
        caches.open(CACHE_NAME)
              .then(cache => cache.addAll(urlsToCache))
              .catch(err => console.error('[SW] Errore pre-caching:', err))
    );
    self.skipWaiting();
});

// 2️⃣ Attivazione
self.addEventListener('activate', event => {
    console.log('[SW] Attivato. Pulizia cache obsolete...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => 
            Promise.all(
                cacheNames.filter(name => !cacheWhitelist.includes(name))
                          .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

// 3️⃣ Fetch: Cache First
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
              .then(response => response || fetch(event.request))
    );
});
