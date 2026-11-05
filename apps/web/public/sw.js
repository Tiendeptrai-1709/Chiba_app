// Service worker tối giản cho PWA Chiba.
// - Không lưu cache dữ liệu API (menu, đơn, điểm luôn lấy mới từ server).
// - Khi mất mạng, mở trang sẽ hiện màn hình "Không có kết nối" thay cho lỗi trình duyệt.
const CACHE = 'chiba-shell-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Chỉ xử lý việc mở trang; mọi request khác (API, ảnh, JS) đi thẳng ra mạng như bình thường.
  if (request.mode !== 'navigate') return;
  event.respondWith(
    fetch(request).catch(() => caches.match(OFFLINE_URL).then((res) => res || Response.error())),
  );
});
