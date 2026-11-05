import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { AppService } from "../services/app.service";

@Controller()
@SkipThrottle()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Dùng cho máy chủ / dịch vụ giám sát: 200 khi API và database đều chạy.
  @Get("health")
  async getHealth() {
    const db = await this.appService.isDatabaseUp();
    if (!db) throw new ServiceUnavailableException({ status: "error", database: "down" });
    return { status: "ok", database: "up", timestamp: new Date().toISOString() };
  }

  // Giữ đường dẫn cũ cho tương thích
  @Get("health1")
  getHealthLegacy() {
    return this.getHealth();
  }
}
