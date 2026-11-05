import { Module } from "@nestjs/common";
import { MenuGroupController } from "../controllers/menu-group.controller";
import { ProductController } from "../controllers/product.controller";
import { StatsController } from "../controllers/stats.controller";
import { MenuGroupService } from "../services/menu-group.service";
import { ProductService } from "../services/product.service";
import { StatsService } from "../services/stats.service";

@Module({
  controllers: [ProductController, MenuGroupController, StatsController],
  providers: [ProductService, MenuGroupService, StatsService],
})
export class ProductModule {}
