const CACHE = 'continue-shell-v1.4-splash';
const APP_PATH = '/CONTINUE/';
const CORE = [
  APP_PATH,
  APP_PATH + 'index.html',
  APP_PATH + 'manifest.webmanifest',
  APP_PATH + 'icons/icon-192.png',
  APP_PATH + 'icons/icon-512.png',
  APP_PATH + 'icons/icon-maskable-512.png'
];

async function cacheCoreBestEffort() {
  const cache = await caches.open(CACHE);
  await Promise.allSettled(
    CORE.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response && response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (_) {}
    })
  );
}

self.addEventListener('install', event => {
  event.waitUntil(cacheCoreBestEffort());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('continue-shell-') && key !== CACHE)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

async function navigationNetworkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(APP_PATH, response.clone());
    }
    return response;
  } catch (_) {
    return (
      await caches.match(APP_PATH)
    ) || (
      await caches.match(APP_PATH + 'index.html')
    ) || new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#09090b;color:white;font-family:sans-serif;padding:24px">CONTINUE ROOM 目前離線。連上網路後再開一次。</body>',
      {headers:{'Content-Type':'text/html; charset=utf-8'}}
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request, { cache: 'no-cache' })
    .then(async response => {
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Only own GitHub Pages shell. GAS iframe remains untouched.
  if (url.origin !== self.location.origin) return;

  // Preserve native media/range handling for the launch movie.
  if (url.pathname.endsWith('.mp4')) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});
