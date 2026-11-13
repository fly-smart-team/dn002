// 앱 화면만 저장(오프라인에서도 열림). ITS 데이터·영상은 저장하지 않음.
const CACHE = 'airport-cctv-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
               'https://cdn.jsdelivr.net/npm/hls.js@1'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const shell = (u.origin === location.origin) || u.href.startsWith('https://cdn.jsdelivr.net/npm/hls.js');
  if (!shell) return; // ITS API·영상은 그대로 네트워크
  // 최신 버전 우선, 실패하면 저장본
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
