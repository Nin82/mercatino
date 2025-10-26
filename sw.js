// sw.js - Service Worker PWA Contabilità
const CACHE_NAME = 'contabilita-v3';

// Tutti i file statici necessari per l'app
const urlsToCache = [
  '/', // root
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/main.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
  '/icons/icona-192x192.png',
  '/icons/icona-512x512.png',
];

// 1️⃣ Installazione: pre-caching
self.addEventListener('install', event => {
  console.log('[SW] Installazione — pre-caching della shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('[SW] Errore nel pre-caching:', err))
  );
  self.skipWaiting();
});

// 2️⃣ Attivazione: pulizia vecchie cache
self.addEventListener('activate', event => {
  console.log('[SW] Attivato — pulizia cache obsolete...');
  const keep = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !keep.includes(k))
            .map(k => {
              console.log('[SW] Eliminata cache vecchia:', k);
              return caches.delete(k);
            })
      )
    )
  );
  self.clients.claim();
});

// 3️⃣ Fetch: Cache First / Network Fallback
self.addEventListener('fetch', event => {
  // Ignora tutto ciò che non è GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            // Salva una copia nella cache per la prossima volta
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return response;
          })
          .catch(() => {
            // (Opzionale) Potresti restituire una pagina offline di fallback
            console.warn('[SW] Offline e non in cache:', event.request.url);
          });
      })
  );
});
