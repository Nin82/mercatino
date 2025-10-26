// sw.js - Service Worker Essenziale per PWA Contabilità

const CACHE_NAME = 'contabilita-v3'; // Versione Cache aggiornata

// Array con i percorsi di tutti i file statici necessari per avviare l'interfaccia (la "Shell" dell'app)
const urlsToCache = [
    '/', // L'indice principale del sito
    '/index.html',
    '/manifest.json',
    // Includiamo la CDN di Supabase, essenziale per il client JS
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 
    // Assicurati che i percorsi delle tue icone siano corretti (ad esempio, se sono in /incons)
    '/incons/icona-192x192.png', 
    '/incons/icona-512x512.png',
    // Aggiungi qui qualsiasi altro file CSS o JS critico
];

// 1. Installazione: Caching degli asset
self.addEventListener('install', event => {
    console.log('[SW] Installazione. Inizio pre-caching della shell...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Aggiungiamo tutti i file essenziali alla cache.
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('[SW] Errore critico nel pre-caching:', err))
    );
    // Forza l'attivazione immediata del nuovo SW
    self.skipWaiting();
});

// 2. Attivazione: Pulizia vecchie cache
self.addEventListener('activate', event => {
    console.log('[SW] Attivato. Pulizia cache obsolete...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => cacheWhitelist.indexOf(name) === -1)
                          .map(name => {
                              console.log(`[SW] Eliminata cache: ${name}`);
                              return caches.delete(name);
                          })
            );
        })
    );
    // Assicura che il Service Worker controlli la pagina immediatamente
    return self.clients.claim(); 
});


// 3. Fetch: Strategia Cache First / Network Fallback
self.addEventListener('fetch', event => {
    
    // Per tutte le richieste che non sono GET (POST, PUT, DELETE),
    // non intercettiamo. La logica di sincronizzazione offline è nel codice JS del client (index.html).
    if (event.request.method !== 'GET') {
        return; 
    }

    // Per tutte le richieste GET (asset statici o richieste di dati):
    // 1. Cerca nella cache.
    // 2. Se non trovato, vai in rete.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Trovato in cache
                }
                return fetch(event.request); // Non trovato, vai in rete
            })
    );
});
