import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Role } from "../generated/prisma";
import { MenuStatsQueryDto } from "../dto/product.dto";
import { Roles } from "../decorators/roles.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { StatsService } from "../services/stats.service";

@Controller("stats")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  // GET /stats/menu?from=2026-11-01&to=2026-11-07[&storeId=s1] — ngày theo giờ Việt Nam
  @Get("menu")
  menu(@Query() q: MenuStatsQueryDto) {
    return this.stats.menu(q.from, q.to, q.storeId);
  }
}
