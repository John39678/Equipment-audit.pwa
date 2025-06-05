const CACHE_NAME = 'equipment-audit-cache-v1';
const urlsToCache = [
  '.',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'fedex-logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js'
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
