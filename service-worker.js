// Minimal service worker: installs and claims clients.
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  self.clients.claim();
});
// Simple fetch handler - network-first for HTML, cache-first for other static
const CACHE_NAME = 'mytube-v1';
const TO_CACHE = ['/','/index.html','/styles.css','/app.js','/manifest.json'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(TO_CACHE)).catch(()=>{}));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.mode === 'navigate'){
    event.respondWith(fetch(req).catch(()=>caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(r=>r || fetch(req)));
});
