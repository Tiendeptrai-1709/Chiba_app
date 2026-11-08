// Sentry phải được khởi tạo trước mọi import khác (đã gồm nạp .env)
import "./instrument";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./modules/app.module";
import { UPLOAD_ROOT } from "./services/product.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Request đi qua proxy trên cùng máy (Next.js rewrite /api, Cloudflare Tunnel):
  // lấy IP thật của khách từ X-Forwarded-For để giới hạn tần suất đúng người.
  app.set("trust proxy", process.env.TRUST_PROXY ?? "loopback");

  // Đường dẫn chứa ký tự rỗng (%00) không bao giờ hợp lệ, và làm PostgreSQL báo lỗi → trả 400 ngay
  app.use((req: { originalUrl: string }, res: { status: (c: number) => { json: (b: object) => void } }, next: () => void) => {
    if (req.originalUrl.toLowerCase().includes("%00")) {
      return res.status(400).json({ statusCode: 400, message: "Đường dẫn không hợp lệ" });
    }
    next();
  });

  // Header bảo mật. Ảnh sản phẩm cho phép nhúng từ domain khác (CDN / web tách domain).
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // bỏ các trường không khai báo trong DTO (vd. "role" khi đăng ký)
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Mặc định (máy dev): web Next.js (3000) + bản web của app Expo (8081). App trên điện thoại không cần CORS.
  // Khi deploy luôn đặt CORS_ORIGIN = địa chỉ web thật (xem docs/DEPLOY.md).
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000,http://localhost:8081").split(","),
  });

  // Ảnh sản phẩm đã upload: GET /uploads/products/<file>
  app.useStaticAssets(UPLOAD_ROOT, {
    prefix: "/uploads",
    index: false,
    dotfiles: "deny",
    maxAge: "7d",
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 NestJS API đang chạy tại http://localhost:${port}`);
}

bootstrap();
