"use strict";
const CACHE_NAME = "aero-s-analyser-v1-3-0";
const CACHE_PREFIX = "aero-s-analyser-";
const APP_SHELL = [
  "/aeros/", "/aeros/index.html", "/aeros/manifest.webmanifest", "/aeros/offline.html", "/aeros/version.json", "/aeros/favicon.png",
  "/aeros/icons/icon-48.png", "/aeros/icons/icon-72.png", "/aeros/icons/icon-96.png",
  "/aeros/icons/icon-128.png", "/aeros/icons/icon-144.png", "/aeros/icons/icon-152.png",
  "/aeros/icons/icon-180.png", "/aeros/icons/icon-192.png", "/aeros/icons/icon-384.png",
  "/aeros/icons/icon-512.png", "/aeros/icons/icon-maskable-192.png", "/aeros/icons/icon-maskable-512.png"
];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n.startsWith(CACHE_PREFIX) && n !== CACHE_NAME).map(n => caches.delete(n))))); self.clients.claim(); });
self.addEventListener("message", event => { if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", event => {
  const request=event.request;if(request.method!=="GET")return;const u=new URL(request.url);if(u.origin!==self.location.origin||!u.pathname.startsWith("/aeros/"))return;
  if(request.mode==="navigate"){event.respondWith(fetch(request).then(response=>{if(response&&response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put("/aeros/index.html",copy)))}return response}).catch(async()=>await caches.match("/aeros/index.html")||await caches.match("/aeros/offline.html")||caches.match("/aeros/")));return;}
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(!response||!response.ok)return response;const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));return response})));
});
