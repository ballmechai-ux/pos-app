// Service Worker สำหรับระบบร้านค้า POS
// เวอร์ชันนี้ "ไม่แคช" หน้าเว็บหลักแล้ว เพื่อป้องกันปัญหาโหลดเจอเวอร์ชันเก่าค้าง
// (เช่นแก้กล้อง/สแกนแล้วแต่ผู้ใช้ยังเห็นโค้ดเก่าเพราะแคชค้าง)
// หน้าที่หลักตอนนี้คือทำให้เบราว์เซอร์ยอมให้ "ติดตั้งเป็นแอป" ได้เท่านั้น

const OLD_CACHE_PREFIX = 'pos-app-cache';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // ล้างแคชเก่าทุกเวอร์ชันที่เคยสร้างไว้ (จาก Service Worker รุ่นก่อนหน้า) ทิ้งให้หมด
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k.startsWith(OLD_CACHE_PREFIX)).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// ไม่ดักจับ fetch เลย ปล่อยให้ทุกคำขอโหลดจากเน็ตตรงๆ เสมอ
// (ไม่มี event listener สำหรับ 'fetch' ตรงนี้โดยตั้งใจ)
