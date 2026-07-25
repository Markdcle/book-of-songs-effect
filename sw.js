/* sw.js — cache-first PWA worker: after one online visit the whole app
 * (code + all 72 paintings) works fully offline. */
const CACHE = "book-of-songs-v6";
const CORE = [
  "./",
  "index.html",
  "css/fonts.css",
  "css/style.css",
  "js/i18n.js",
  "js/config.js",
  "js/segments.js",
  "js/store.js",
  "js/app.js",
  "manifest.webmanifest",
  "assets/fonts/PoemKai-subset.woff2",
  "assets/icon-192.png",
  "assets/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;                 // never intercept submissions
  if (!e.request.url.startsWith(self.location.origin)) return; // leave Apps Script alone
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(resp => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      });
    })
  );
});
