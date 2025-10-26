const CACHE_NAME = 'contabilita-v3';
const urlsToCache = [
  '/',
  '/mercatino/index.html',
  '/mercatino/manifest.json',
  '/mercatino/icons/icon1.jpg',
  '/mercatino/icons/icon2.jpg',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installazione. Pre-caching della shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('[SW] Errore pre-caching:', err))
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Attivato. Pulizia cache obsolete...');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Eliminata cache:', key);
          return caches.delete(key);
        }
      })
    ))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => resp || fetch(event.request))
  );
});
