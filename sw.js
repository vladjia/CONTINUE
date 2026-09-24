const CACHE = 'continue-shell-v1.2';
const CORE = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

async function cacheCoreBestEffort() {
  const cache = await caches.open(CACHE);

  // Do NOT use cache.addAll().
  // One temporarily missing GitHub Pages asset must not abort the whole SW install.
  await Promise.allSettled(
    CORE.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response && response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (_) {
        // Best effort only. Install must still succeed.
      }
    })
  );
}

self.addEventListener('install', event => {
  event.waitUntil(cacheCoreBestEffort());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => key.startsWith('continue-shell-') && key !== CACHE)
          .map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function navigationNetworkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      const cache = await caches.open(CACHE);
      // Cache canonical index as offline fallback.
      const indexResponse = await fetch('./index.html', { cache: 'no-store' }).catch(() => null);
      if (indexResponse && indexResponse.ok) {
        await cache.put('./index.html', indexResponse.clone());
      }
    }
    return response;
  } catch (_) {
    return (
      await caches.match('./index.html')
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
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Never intercept the cross-origin GAS iframe.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
