// Service Worker for Cast Aloud Mini App
const CACHE_NAME = 'cast-aloud-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/cast-aloud-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Failed to cache some resources:', error);
          // Continue installation even if some resources fail to cache
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch((error) => {
          console.warn('Fetch failed for:', event.request.url, error);
          // Return a basic fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          throw error;
        });
      })
  );
});

// Handle Mini App messages from Farcaster
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FARCASTER_MINIAPP') {
    console.log('Farcaster Mini App message:', event.data);
  }
});