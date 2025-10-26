// ✅ sw.js - Service Worker PWA Mercatino
const CACHE_NAME = 'mercatino-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    '/icons/icon1.jpg',
    '/icons/icon2.jpg',
];

// 1️⃣ Installazione - Cache iniziale
self.addEventListener('install', event => {
  console.log('[SW] Installazione...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 2️⃣ Attivazione - Pulizia vecchie cache
self.addEventListener('activate', event => {
  console.log('[SW] Attivazione...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 3️⃣ Gestione fetch - Cache First con fallback online
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(res => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return res;
          })
          .catch(() => response) // Offline fallback
      );
    })
  );
});
