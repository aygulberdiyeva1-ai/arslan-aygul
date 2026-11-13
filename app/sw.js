// my heart — offline shell. Page and config: network first; media: cache first.
const CACHE = 'my-heart-v1';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'photo.jpg', 'apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (/\.(mp3|mp4)$/.test(u.pathname)) return; // let the browser stream audio/video with range requests
  const net = () => fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); } return r; });
  if (e.request.mode === 'navigate' || /\.(html|js|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/')) {
    e.respondWith(net().catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(e.request).then((r) => r || net()));
  }
});
