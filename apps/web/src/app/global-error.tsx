'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// Màn hình khi cả trang bị lỗi không mong muốn: báo lỗi lên Sentry và cho người dùng thử lại.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#FAF7F5', color: '#1F1914' }}>
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Có lỗi xảy ra</h1>
            <p style={{ color: '#6B5E53', fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
              Chiba đã ghi nhận lỗi này để sửa. Bạn thử tải lại trang nhé.
            </p>
            <button
              onClick={reset}
              style={{ background: '#1E4620', color: '#fff', border: 0, borderRadius: 999, padding: '12px 24px', fontWeight: 700 }}
            >
              Thử lại
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
