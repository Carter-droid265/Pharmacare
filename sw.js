// PharmaCare Service Worker — Gerald Mdzalimbo
// v1.0.0 — Network-first for API, Cache-first for shell (Claude-generated icons)

const CACHE  = "pharmacare-v1";
const SHELL  = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-16.png",
  "./icon-32.png",
  "./icon-120.png",
  "./icon-144.png",
  "./icon-152.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (url.pathname.includes("/api/v1/") || url.pathname === "/health") {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(
          JSON.stringify({ detail: "You are offline. API unavailable." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        )
      )
    );
    return;
  }

  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    }).catch(() =>
      e.request.mode === "navigate"
        ? caches.match("./index.html")
        : new Response("Offline", { status: 503 })
    )
  );
});
