'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';

// Chặn trang khi chưa đăng nhập: chờ khôi phục phiên xong rồi mới chuyển về trang login.
export function useRequireAuth() {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated, router]);

  return { user, ready: !loading && isAuthenticated && !!user };
}
