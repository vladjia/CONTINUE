const CACHE = 'continue-shell-v1.1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-32.png',
  './icons/icon-64.png',
  './icons/icon-128.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('continue-shell-') && key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    // Avoid stale HTTP-cache copies when checking app-shell files.
    const fresh = await fetch(request, { cache: 'no-store' });
    if (fresh && fresh.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // For navigation, fall back to cached root/index.
    if (request.mode === 'navigate') {
      return (await caches.match('./index.html')) || (await caches.match('./'));
    }
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await networkPromise);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // GAS iframe is cross-origin; do not intercept/cache it here.
  if (url.origin !== self.location.origin) return;

  const pathname = url.pathname;

  // HTML / navigation / manifest: always prefer the newest network copy.
  if (
    request.mode === 'navigate' ||
    pathname.endsWith('/index.html') ||
    pathname.endsWith('/manifest.webmanifest') ||
    pathname.endsWith('/')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Icons/static shell: render immediately from cache, refresh quietly behind it.
  event.respondWith(staleWhileRevalidate(request));
});
