// PharmaCare Service Worker — Gerald Mdzalimbo
// Caches the app shell for offline use; API calls pass through to the network.

const CACHE_NAME = "pharmacare-v1";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
];

// ── Install: cache shell files ──────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ─────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch strategy ───────────────────────────────────────────────────────────
// API calls (/api/v1/*) → Network first, no caching
// Everything else      → Cache first, fallback to network
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // API requests: always go to the network
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(e.request).catch(() => new Response(
      JSON.stringify({ detail: "You are offline. API unavailable." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )));
    return;
  }

  // App shell: cache first
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached || fetch(e.request).then((res) => {
        // Cache successful GET responses for shell resources
        if (e.request.method === "GET" && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
    ).catch(() => caches.match("/index.html"))
  );
});
