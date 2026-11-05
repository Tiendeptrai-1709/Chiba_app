'use client';

import React, { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { useAuthStore } from './stores/useAuthStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  // Khôi phục phiên đăng nhập (gọi /auth/me) mỗi khi tải lại trang.
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Đăng ký service worker cho PWA (chỉ chạy trên HTTPS hoặc localhost).
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return <CartProvider>{children}</CartProvider>;
}
