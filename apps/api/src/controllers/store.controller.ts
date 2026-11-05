import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("stores")
export class StoreController {
  constructor(private readonly prisma: PrismaService) {}

  // Danh sách chi nhánh đang hoạt động (công khai)
  @Get()
  findActive() {
    return this.prisma.store.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, address: true, phone: true, isActive: true },
    });
  }
}
