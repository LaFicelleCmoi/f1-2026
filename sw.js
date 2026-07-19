// ============================================================
// 🔁 Service Worker — F1 2026 Race Hub
// Stratégies :
//   - HTML : network-first (toujours frais, fallback cache offline)
//   - Static (JS/CSS/icons) : stale-while-revalidate
//   - APIs externes (Firebase, Jolpica, OpenF1, TheSportsDB) : passthrough
// ============================================================
const VERSION = "f1-2026-v20";
const STATIC_CACHE  = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const HTML_CACHE    = `${VERSION}-html`;

// Précache : uniquement le shell. Les JS/CSS sont désormais référencés avec
// ?v=N dans le HTML (cache-busting) — le cache runtime (stale-while-revalidate)
// les stocke sous leur URL versionnée au premier chargement, et un changement
// de version force automatiquement un fetch réseau. Fini les vieux JS servis.
const ASSET_V = "20"; // garder aligné avec ?v= dans index.html / legal.html
const PRECACHE = [
    "./",
    "./index.html",
    "./legal.html",
    `./style.css?v=${ASSET_V}`,
    `./data.js?v=${ASSET_V}`,
    `./i18n.js?v=${ASSET_V}`,
    `./app.js?v=${ASSET_V}`,
    `./anti-inspect.js?v=${ASSET_V}`,
    "./manifest.json",
    "./icons/icon.svg"
];

// ── Install ──
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(PRECACHE).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

// ── Activate : nettoyer les vieux caches ──
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// ── Fetch ──
self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);

    // Pass-through : APIs externes & Firebase
    if (
        url.host.includes("firebase") ||
        url.host.includes("gstatic") ||
        url.host.includes("googleapis") ||
        url.host.includes("jolpi.ca") ||
        url.host.includes("openf1.org") ||
        url.host.includes("thesportsdb.com") ||
        url.host.includes("formula1.com") ||
        url.host.includes("espn.com") ||
        url.host.includes("espncdn.com") ||
        url.host.includes("jsdelivr.net")
    ) {
        return; // laisser le navigateur gérer
    }

    // HTML : network-first
    if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(HTML_CACHE).then(c => c.put(req, copy)).catch(() => {});
                    return res;
                })
                .catch(() => caches.match(req).then(m => m || caches.match("./index.html")))
        );
        return;
    }

    // Static (CSS/JS/img) : stale-while-revalidate
    event.respondWith(
        caches.match(req).then(cached => {
            const fetched = fetch(req).then(res => {
                if (res && res.status === 200 && res.type !== "opaque") {
                    const copy = res.clone();
                    caches.open(RUNTIME_CACHE).then(c => c.put(req, copy)).catch(() => {});
                }
                return res;
            }).catch(() => cached);
            return cached || fetched;
        })
    );
});

// ── Skip waiting depuis le client ──
self.addEventListener("message", (e) => {
    if (e.data === "SKIP_WAITING") self.skipWaiting();
});
