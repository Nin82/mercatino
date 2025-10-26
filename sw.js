// sw.js - Service Worker Essenziale per PWA Mercatino

const CACHE_NAME = 'mercatino-v1';
const urlsToCache = [
    '/mercatino/',
    '/mercatino/index.html',
    '/mercatino/manifest.json',
    '/mercatino/icons/icon1.jpg',
    '/mercatino/icons/icon2.jpg'
];

// 1️⃣ Installazione - Pre-caching
self.addEventListener('install', event => {
    console.log('[SW] Installazione. Pre-caching della shell...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => Promise.allSettled(urlsToCache.map(url => cache.add(url))))
            .then(results => {
                results.forEach((res, i) => {
                    if (res.status === 'rejected') {
                        console.warn('[SW] Non ho potuto cachare:', urlsToCache[i], res.reason);
                    }
                });
            })
            .catch(err => console.error('[SW] Errore critico nel pre-caching:', err))
    );
    self.skipWaiting(); // Attiva subito il nuovo SW
});

// 2️⃣ Attivazione - Pulizia vecchie cache
self.addEventListener('activate', event => {
    console.log('[SW] Attivato. Pulizia cache obsolete...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(name => !cacheWhitelist.includes(name))
                    .map(name => {
                        console.log('[SW] Eliminata cache:', name);
                        return caches.delete(name);
                    })
            ))
    );
    self.clients.claim(); // Controlla subito le pagine
});

// 3️⃣ Fetch - Strategia Cache First / Network fallback
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request).catch(() => {
                // fallback offline generico se vuoi
                return new Response('Offline', { status: 503, statusText: 'Service Worker Offline' });
            }))
    );
});
