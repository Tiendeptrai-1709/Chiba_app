import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./modules/app.module";
import { UPLOAD_ROOT } from "./services/product.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
