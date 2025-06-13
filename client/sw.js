// Service Worker for Cast Aloud Mini App
const CACHE_NAME = 'cast-aloud-v1';

// Only cache essential files that we know exist
const urlsToCache = [
  '/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache the root route initially
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Service worker install failed:', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip caching for API requests and external resources
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('chrome-extension://') ||
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If network fails, return a basic response for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
      .catch(error => {
        console.log('Service worker fetch failed:', error);
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return new Response('Application temporarily unavailable', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })
  );
});

// Handle Mini App messages from Farcaster
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FARCASTER_MINIAPP') {
    console.log('Farcaster Mini App message:', event.data);
  }
});