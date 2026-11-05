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

  return <CartProvider>{children}</CartProvider>;
}
