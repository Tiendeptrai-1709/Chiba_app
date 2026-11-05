import type { MetadataRoute } from 'next';

// Web App Manifest: cho phép "Thêm vào màn hình chính" và mở toàn màn hình như app (PWA).
// Next.js phục vụ file này tại /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Chiba - Tea, Coffee & Foods',
    short_name: 'Chiba',
    description: 'Đặt trà, cà phê và đồ ăn tại Chiba, tích điểm thành viên.',
    lang: 'vi',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF7F5',
    theme_color: '#1E4620',
    categories: ['food', 'shopping'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Đặt món', url: '/order', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Mã QR tích điểm', url: '/qr', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Đơn của tôi', url: '/orders', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
