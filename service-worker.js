// Stabli service worker — offline caching
// Bump CACHE_VERSION whenever you upload a new index.html so phones fetch the update.
const CACHE_VERSION = "stabli-v7";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for the app HTML (so updates arrive), cache-first for icons.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode === "navigate" || req.url.endsWith("index.html")) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
  } else {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
  }
});
