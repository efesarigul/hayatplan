// HayatPlan çevrimdışı önbellek. Uygulamayı güncellediğinde VERSION'u artır.
const VERSION = 'hayatplan-v4';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon2-180.png', './icon2-192.png', './icon2-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    const isApp = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
    if (!isApp) return; // takvim.html gibi diğer sayfalar: doğrudan internetten
    // Ana sayfa: önce internet (güncelleme gelsin), yoksa önbellek
    e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); } return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
