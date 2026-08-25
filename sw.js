// Service Worker สำหรับ POS ร้านค้า
// แคชไฟล์แอปไว้ในเครื่อง ให้เปิดใช้งานได้แม้ไม่มีเน็ต (ยกเว้นตอนแรกที่ต้องโหลดครั้งแรกผ่านเน็ต)

const CACHE_NAME = 'pos-app-cache-v1'; // เปลี่ยนเลขนี้ทุกครั้งที่อัปเดตแอป เพื่อบังคับให้โหลดไฟล์ใหม่
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

// ตอนติดตั้ง service worker: ดาวน์โหลดไฟล์หลักของแอปเก็บไว้ในแคช
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ตอนเปิดใช้งาน: ลบแคชเวอร์ชันเก่าทิ้ง
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// กลยุทธ์: ลองโหลดจากเน็ตก่อน (เพื่อให้ได้ข้อมูล/ไลบรารีล่าสุดถ้ามีเน็ต)
// ถ้าโหลดจากเน็ตไม่ได้ (ไม่มีเน็ต) ค่อยใช้ไฟล์จากแคชแทน
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // อัปเดตแคชด้วยไฟล์ล่าสุดที่โหลดได้ (เฉพาะ same-origin ของแอปเอง)
        if (event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
