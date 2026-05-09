/* ============================================================
   sw.js — Service Worker | Elemento Sinergia PWA
   ============================================================ */

const CACHE_NAME = 'sinergia-v2';

const ARCHIVOS_CACHE = [
  '/',
  '/index.html',
  '/Willstyle.css',
  '/Will.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

/* Instalación */
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.allSettled(
        ARCHIVOS_CACHE.map(function(url) {
          return cache.add(url).catch(function() {});
        })
      );
    })
  );
});

/* Activación */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch */
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  if (url.includes('firestore') ||
      url.includes('firebase') ||
      url.includes('wa.me') ||
      url.includes('google-analytics') ||
      url.includes('fonts.googleapis') ||
      url.includes('fonts.gstatic') ||
      url.includes('unsplash')) {
    return;
  }

  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var copia = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copia);
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(event.request).then(function(cached) {
          if (cached) return cached;
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});