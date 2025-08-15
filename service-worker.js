const CACHE_NAME = "divine-cycle-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(k => k === CACHE_NAME ? null : caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r =>
      r || fetch(e.request).then(net => {
        if (e.request.method === "GET" &&
            new URL(e.request.url).origin === location.origin) {
          const copy = net.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        }
        return net;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
