// ---- Thermo PWA Service Worker (safe with Cloudflare Access) ----
// Notes:
// - Do NOT cache navigations/HTML so Access can redirect to its login.
// - Avoid caching redirected responses.
// - Bump CACHE_VERSION whenever you change the SW.

const CACHE_VERSION = '__VERSION__';
const CACHE_NAME = 'thermo-pwa-' + CACHE_VERSION;

// Precache only static assets (NOT index.html or './')
const PRECACHE = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // add more static files here if you create them later (css/js)
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting(); // take control ASAP
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Let the browser handle navigations (HTML) so Cloudflare Access can redirect
  const isNavigate =
    req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));
  if (isNavigate) return;

  // 2) Never touch Access/CDN endpoints
  const isAccess =
    url.pathname.startsWith('/cdn-cgi/') ||
    url.hostname.endsWith('cloudflareaccess.com');
  if (isAccess) return;

  // 3) Cache-first for static requests; don't cache redirects
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;

      const res = await fetch(req);
      if (res.ok && res.type === 'basic' && !res.redirected) {
        cache.put(req, res.clone());
      }
      return res;
    })
  );
});