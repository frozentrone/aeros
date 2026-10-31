"use strict";

/*
 * Increment this value whenever the application shell changes.
 *
 * Examples:
 * aero-s-analyser-v1-4-pwa-2
 * aero-s-analyser-v1-4-pwa-3
 */
const CACHE_NAME = "aero-s-analyser-v1-4-pwa-2";

/*
 * Prefix used to identify caches that belong specifically to Aero S.
 *
 * This prevents the Aero S service worker from deleting caches belonging
 * to the Particle Charge Calculator, even though both applications share
 * the https://frozentrone.github.io origin.
 */
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

/*
 * Install:
 * Pre-cache the application shell required to open Aero S offline.
 */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );

  /*
   * Activate this worker without waiting for all existing Aero S windows
   * to close.
   */
  self.skipWaiting();
});

/*
 * Activate:
 * Delete only obsolete Aero S caches.
 *
 * Do not delete Particle Charge caches or unrelated GitHub Pages caches.
 */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      const obsoleteAeroCaches = cacheNames.filter(cacheName => {
        return (
          cacheName.startsWith(CACHE_PREFIX) &&
          cacheName !== CACHE_NAME
        );
      });

      return Promise.all(
        obsoleteAeroCaches.map(cacheName => caches.delete(cacheName))
      );
    })
  );

  /*
   * Start controlling open Aero S pages immediately.
   */
  self.clients.claim();
});

/*
 * Support the Update button already present in the Aero S HTML.
 */
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/*
 * Process only GET requests belonging to /aeros/.
 *
 * Requests for /pccc/ and other repositories are deliberately ignored.
 */
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  /*
   * Ignore requests to external origins.
   */
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  /*
   * Restrict this worker to the Aero S repository path.
   */
  if (!requestUrl.pathname.startsWith("/aeros/")) {
    return;
  }

  /*
   * Navigation requests:
   *
   * Try the network first so the latest HTML is used when online.
   * If the network is unavailable, return the cached Aero S page.
   */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const responseCopy = response.clone();

            event.waitUntil(
              caches.open(CACHE_NAME).then(cache => {
                return cache.put("/aeros/index.html", responseCopy);
              })
            );
          }

          return response;
        })
        .catch(async () => {
          const cachedIndex = await caches.match(
            "/aeros/index.html"
          );

          if (cachedIndex) {
            return cachedIndex;
          }

          return caches.match("/aeros/");
        })
    );

    return;
  }

  /*
   * Static resources:
   *
   * Return the cached response first. If it is not cached, retrieve it
   * from the network and add a successful response to the Aero S cache.
   */
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(response => {
        if (!response || !response.ok) {
          return response;
        }

        const responseCopy = response.clone();

        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => {
            return cache.put(request, responseCopy);
          })
        );

        return response;
      });
    })
  );
});
