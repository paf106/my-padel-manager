const CACHE_NAME = "padel-ledger-static-v2";
const MAX_ENTRIES = 80;
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin)
    return;
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith("/_next/static/")) return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ??
        fetch(event.request).then((response) => {
          if (!response.ok) return response;
          const write = caches.open(CACHE_NAME).then(async (cache) => {
            await cache.put(event.request, response.clone());
            const keys = await cache.keys();
            await Promise.all(
              keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES)).map((key) => cache.delete(key)),
            );
          });
          event.waitUntil(write.catch(() => undefined));
          return response;
        }),
    ),
  );
});
