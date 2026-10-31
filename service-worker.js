"use strict";

const CACHE_NAME = "aero-s-analyser-v1-4-pwa-3";
const CACHE_PREFIX = "aero-s-analyser-";

const APP_SHELL = [
  "/aeros/",
  "/aeros/index.html",
  "/aeros/manifest.webmanifest",
  "/aeros/favicon.png",
  "/aeros/icons/icon-48.png",
  "/aeros/icons/icon-72.png",
  "/aeros/icons/icon-96.png",
  "/aeros/icons/icon-128.png",
  "/aeros/icons/icon-144.png",
  "/aeros/icons/icon-152.png",
  "/aeros/icons/icon-180.png",
  "/aeros/icons/icon-192.png",
  "/aeros/icons/icon-384.png",
  "/aeros/icons/icon-512.png",
  "/aeros/icons/icon-maskable-192.png",
  "/aeros/icons/icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      const obsoleteAeroCaches = cacheNames.filter(cacheName =>
        cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME
      );
      return Promise.all(obsoleteAeroCaches.map(cacheName => caches.delete(cacheName)));
    })
  );
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (!requestUrl.pathname.startsWith("/aeros/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const responseCopy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then(cache => cache.put("/aeros/index.html", responseCopy))
            );
          }
          return response;
        })
        .catch(async () => {
          const cachedIndex = await caches.match("/aeros/index.html");
          if (cachedIndex) return cachedIndex;
          return caches.match("/aeros/");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then(response => {
        if (!response || !response.ok) return response;
        const responseCopy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, responseCopy)));
        return response;
      });
    })
  );
});
