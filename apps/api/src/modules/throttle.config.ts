import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

const MINUTE = 60_000;
const envInt = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

// Mặc định cho mọi API: số request / phút / địa chỉ IP
export const DEFAULT_RATE_LIMIT = { limit: envInt("API_RATE_LIMIT", 300), ttl: MINUTE };
// Đăng nhập & đăng ký: số lần / phút / (IP + email)
export const AUTH_RATE_LIMIT = { limit: envInt("AUTH_RATE_LIMIT", 10), ttl: MINUTE };

// Với đăng nhập/đăng ký, đếm theo IP + email: nhiều khách dùng chung Wi-Fi quán
// (cùng IP) không chặn lẫn nhau, nhưng dò mật khẩu một tài khoản vẫn bị chặn.
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip: string = req.ip ?? req.socket?.remoteAddress ?? "unknown";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    return email ? `${ip}|${email}` : ip;
  }

  protected getRequestResponse(context: ExecutionContext) {
    const http = context.switchToHttp();
    return { req: http.getRequest(), res: http.getResponse() };
  }
}
