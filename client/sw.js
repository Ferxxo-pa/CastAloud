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
  // Skip chrome-extension and invalid URLs
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('invalid/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.warn('Fetch failed:', error);
        return new Response('Service worker fetch failed', { status: 503 });
      })
  );
});

// Handle Mini App messages from Farcaster
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FARCASTER_MINIAPP') {
    console.log('Farcaster Mini App message:', event.data);
  }
});