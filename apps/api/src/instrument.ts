// Khởi tạo Sentry (theo dõi lỗi). PHẢI được import đầu tiên trong main.ts.
// Chỉ bật khi có SENTRY_DSN trong .env — không có thì không gửi gì đi.
import "dotenv/config";
import * as Sentry from "@sentry/nestjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    // Chỉ cần báo lỗi, chưa cần đo hiệu năng
    tracesSampleRate: 0,
    // Không gửi IP, cookie… của người dùng
    sendDefaultPii: false,
    beforeSend(event) {
      // Không bao giờ gửi token đăng nhập / mật khẩu lên Sentry
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.Authorization;
        delete event.request.headers.cookie;
      }
      if (event.request?.data && typeof event.request.data === "object") {
        const data = event.request.data as Record<string, unknown>;
        for (const key of ["password", "newPassword", "token", "refreshToken"]) {
          if (key in data) data[key] = "[đã ẩn]";
        }
      }
      return event;
    },
  });
}

export const sentryEnabled = !!dsn;
