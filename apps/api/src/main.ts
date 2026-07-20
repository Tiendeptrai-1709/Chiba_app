import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "dotenv/config"
console.log("first", process.env.DATABASE_URL)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:3000",
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 NestJS API đang chạy tại http://localhost:${port}`);
}

bootstrap();
