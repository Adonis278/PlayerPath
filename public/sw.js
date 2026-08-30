/*
 * PlayerPath service worker.
 *
 * Hand-rolled rather than generated. Next's static export produces content-hashed
 * asset names, so a build-time precache manifest would need regenerating on every
 * build; routing by request type instead is stable and small.
 *
 * Goal: a cold launch on a dead signal at the side of a pitch still works.
 */

const VERSION = "v1";
const SHELL = `playerpath-shell-${VERSION}`;
const ASSETS = `playerpath-assets-${VERSION}`;
const IMAGES = `playerpath-images-${VERSION}`;

/* Routes worth having before the coach ever goes offline. */
const SHELL_ROUTES = ["/", "/browse", "/session", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_ROUTES))
      .catch(() => {
        /* a missing route must not block activation */
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL, ASSETS, IMAGES]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

function isImage(url) {
  return url.pathname.startsWith("/img/") || /\.(png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname);
}

/** Hashed assets are immutable - serve from cache and never revalidate. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

/** Pages: prefer fresh, fall back to the last copy, then to the app shell. */
async function networkFirst(request) {
  const cache = await caches.open(SHELL);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;

    const shell = await cache.match("/");
    if (shell) return shell;

    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Firestore and anything cross-origin goes straight to the network. Caching
  // content responses here would fight the app's own versioned cache.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isAsset(url)) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  if (isImage(url)) {
    event.respondWith(cacheFirst(request, IMAGES));
    return;
  }
});
