// sw.js

const CACHE_NAME = 'contabilita-v1';

// File essenziali per il funzionamento offline (la "Shell" dell'app)
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', // CDN Supabase
    // Aggiungi qui gli altri asset statici, se presenti (es. immagini/icona.png)
    // Ho corretto il percorso delle icone in base a quello che mi hai mostrato nei tuoi file (assumendo siano nella root)
    '/images/icon1.jpg', 
    '/images/icon2.jpg' 
];

// 1. Installazione: Caching degli asset
self.addEventListener('install', event => {
    console.log('[SW] Installazione. Caching shell app...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching completato.');
                // Aggiungiamo i file alla cache. Se un file fallisce, l'intero step fallisce.
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('[SW] Errore caching in installazione:', err))
    );
    self.skipWaiting();
});

// 2. Attivazione: Pulizia vecchie cache
self.addEventListener('activate', event => {
    console.log('[SW] Attivato. Pulizia vecchie cache...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => cacheWhitelist.indexOf(name) === -1)
                          .map(name => {
                              console.log(`[SW] Eliminata cache obsoleta: ${name}`);
                              return caches.delete(name);
                          })
            );
        })
    );
    // Assicura che il Service Worker controlli la pagina immediatamente
    return self.clients.claim(); 
});

// 3. Fetch: Strategia (Cache First per Shell, Network Only per API)
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    const isSupabaseApi = requestUrl.host.includes('supabase.co') && requestUrl.pathname.includes('/rest/v1/');

    // A. Gestione Chiamate API (Supabase o altre)
    if (event.request.method !== 'GET' || isSupabaseApi) {
        // Per tutte le richieste di scrittura (POST/PATCH/DELETE) o tutte le API Supabase (incluse le GET)
        // Usiamo la strategia Network Only (le lasciamo passare).
        // Se la rete è assente, l'errore 'Failed to fetch' verrà gestito lato client (index.html).
        return; 
    }

    // B. Gestione Asset Statici (Strategia Cache First)
    // Risponde con l'asset dalla cache, se presente.
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Se l'elemento è nella cache (es. index.html, CSS, JS)
                if (cachedResponse) {
                    // Puoi anche implementare una strategia "Stale-While-Revalidate" qui
                    return cachedResponse;
                }
                
                // Se non è in cache, prova a recuperarlo dalla rete.
                return fetch(event.request)
                    .catch(() => {
                        // Questo catch è importante: se la fetch fallisce (perché offline) 
                        // e l'elemento NON era in cache, l'utente vedrà un errore/pagina vuota.
                        // Per una PWA di base, se la fetch fallisce, semplicemente non c'è nulla da mostrare.
                        console.log(`[SW] Impossibile recuperare ${requestUrl.pathname} dalla rete o cache.`);
                    });
            })
    );
});
