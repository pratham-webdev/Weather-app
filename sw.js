const CACHE = "weather-v2";
const STATIC = ["/", "/index.html", "/styles.css", "/app.js", "/manifest.json"];

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", e => {
  if (e.request.url.includes("open-meteo.com")) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        fetch(e.request).then(res => {
          cache.put(e.request, res.clone());
          return res;
        }).catch(() => caches.match(e.request))
      )
    );
  }
});
