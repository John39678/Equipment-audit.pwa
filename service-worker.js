self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("audit-pwa").then((cache) =>
      cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/manifest.json",
        "/fedex-logo.png"
      ])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
