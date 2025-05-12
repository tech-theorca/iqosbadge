const CACHE_NAME = 'terea-game-cache-v1';
const urlsToCache = [
  '/',
  '/game.html',
  '/scores.html',
  '/iqos-logo-1.png',
  '/manifestg.json',
  '/manifests.json',
  // Add other assets like CSS, JS files here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
