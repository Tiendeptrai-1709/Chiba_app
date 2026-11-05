// Sentry phía trình duyệt: báo lỗi JavaScript xảy ra trên máy khách / nhân viên.
// Chỉ bật khi có NEXT_PUBLIC_SENTRY_DSN (đặt trong .env.local hoặc biến môi trường khi deploy).
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: 0, // chỉ cần báo lỗi
  sendDefaultPii: false, // không gửi IP / cookie
  // Bỏ qua lỗi do mạng chập chờn hoặc tiện ích trình duyệt, không phải lỗi của app
  ignoreErrors: ['Failed to fetch', 'NetworkError', 'Load failed', 'AbortError', 'ResizeObserver loop'],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
