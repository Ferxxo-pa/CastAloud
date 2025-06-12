// Service Worker for Cast Aloud Mini App
const CACHE_NAME = 'cast-aloud-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Handle Mini App messages from Farcaster
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FARCASTER_MINIAPP') {
    console.log('Farcaster Mini App message:', event.data);
  }
});