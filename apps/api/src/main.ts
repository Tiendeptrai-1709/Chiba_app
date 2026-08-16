import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";

// console.log("first", process.env.DATABASE_URL)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:8081"],
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 NestJS API đang chạy tại http://localhost:${port}`);
}

bootstrap();
