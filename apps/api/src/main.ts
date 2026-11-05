import "dotenv/config";
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

  // Header bảo mật. Ảnh sản phẩm cho phép nhúng từ domain khác (CDN / web tách domain).
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // bỏ các trường không khai báo trong DTO (vd. "role" khi đăng ký)
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
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
