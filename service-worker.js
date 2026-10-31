'use strict';

const APP_VERSION = '1.9.2';
const CACHE_NAME = `pccc-v${APP_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './favicon.png?v=1.9.2',
  './icons/icon-180.png?v=1.9.2'
];
const NEVER_CACHE = new Set(['service-worker.js', 'manifest.webmanifest', 'version.json']);

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const asset of APP_SHELL) {
        try { await cache.add(new Request(asset, { cache: 'reload' })); }
        catch (error) { console.warn('[SW] Optional precache failed:', asset, error); }
      }
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const file = url.pathname.split('/').pop();
  if (NEVER_CACHE.has(file)) {
    event.respondWith(fetch(new Request(request, { cache: 'no-store' })));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(new Request(request, { cache: 'no-store' }));
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', response.clone());
        return response;
      } catch {
        return (await caches.match('./index.html')) || (await caches.match('./offline.html'));
      }
    })());
    return;
  }

  const destination = request.destination;
  if (['script', 'style', 'image', 'font'].includes(destination)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const network = fetch(request).then(response => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    }).catch(() => null);
    return cached || (await network) || new Response('', { status: 504, statusText: 'Offline' });
  })());
});
