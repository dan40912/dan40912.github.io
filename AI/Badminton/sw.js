const CACHE_NAME = "badminton-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/tokens.css",
  "./assets/css/style.css",
  "./assets/icons/icon-192.svg",
  "./assets/icons/icon-512.svg",
  "./src/app.js",
  "./src/state.js",
  "./src/domain/id.js",
  "./src/domain/parser.js",
  "./src/domain/scheduler.js",
  "./src/domain/transitions.js",
  "./src/domain/validators.js",
  "./src/services/storage.js",
  "./src/services/speech.js",
  "./src/services/export.js",
  "./src/components/dom.js",
  "./src/components/location.js",
  "./src/components/playerChip.js",
  "./src/components/setupScreen.js",
  "./src/components/courtCard.js",
  "./src/components/queuePanel.js",
  "./src/components/pausedPanel.js",
  "./src/components/dragManager.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    }),
  );
});
