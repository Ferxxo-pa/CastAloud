// Service Worker for Cast Aloud Mini App
const CACHE_NAME = 'cast-aloud-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(
    clients.claim()
  );
});

self.addEventListener('fetch', (event) => {
  // Skip service worker for navigation requests to prevent white page issues
  if (event.request.mode === 'navigate') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache only if network fails
        return caches.match(event.request);
      })
  );
});

// Handle Mini App messages from Farcaster
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FARCASTER_MINIAPP') {
    console.log('Farcaster Mini App message:', event.data);
  }
});