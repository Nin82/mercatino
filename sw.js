// ======================================================
// 🌐 Service Worker per PWA Gestione Magazzino
// ======================================================

const CACHE_NAME = 'magazzino-v1';
const urlsToCache = [
  '/mercatino/',
  '/mercatino/index.html',
  '/mercatino/manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  '/mercatino/icons/icon-192.png',
  '/mercatino/icons/icon-512.png'
];

// 1️⃣ Installazione — pre-caching della shell
self.addEventListener('install', event => {
  console.log('[SW] Installazione... Pre-caching shell');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('[SW] Errore pre-caching:', err))
  );
  self.skipWaiting();
});

// 2️⃣ Attivazione — pulizia cache obsolete
self.addEventListener('activate', event => {
  console.log('[SW] Attivato. Pulizia cache obsolete...');
  const keep = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(n => {
        if (!keep.includes(n)) {
          console.log('[SW] Eliminata cache:', n);
          return caches.delete(n);
        }
      }))
    )
  );
  self.clients.claim();
});

// 3️⃣ Fetch — cache-first, fallback rete
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(resp => {
      if (resp) return resp;
      return fetch(event.request).then(netResp => {
        // Cache dinamica solo per asset del tuo dominio
        if (event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(c => c.put(event.request, netResp.clone()));
        }
        return netResp;
      }).catch(() => caches.match('/mercatino/index.html'));
    })
  );
});

console.log('[SW] Registrato correttamente 🎯');
