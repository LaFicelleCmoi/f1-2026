const CACHE_NAME = "f1-2026-v1";
const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./data.js",
    "./app.js",
    "./manifest.json",
    "./icons/icon.svg"
];

self.addEventListener("install", e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", e => {
    // Ne pas cacher Firebase ni les APIs externes
    if (e.request.url.includes("firebase") || e.request.url.includes("gstatic") || e.request.url.includes("jolpi.ca")) {
        return;
    }
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
