// Service Worker สำหรับระบบร้านค้า POS
// ทำหน้าที่ขั้นต่ำสุดเพื่อให้เบราว์เซอร์อนุญาตให้ "ติดตั้งเป็นแอป" ได้
// (Android: Add to Home screen / Windows: Install app)

const CACHE_NAME = 'pos-app-cache-v1';
const APP_SHELL = [
  './pos_stock.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {
        // ถ้าแคชไม่สำเร็จ (เช่น path ไม่ตรง) ไม่เป็นไร ให้ install ผ่านต่อไป
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// กลยุทธ์: พยายามโหลดจากเน็ตก่อน ถ้าออฟไลน์/โหลดไม่ได้ค่อยใช้แคชสำรอง
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
