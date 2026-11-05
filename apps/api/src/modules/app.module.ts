import { Module } from "@nestjs/common";
import { AppController } from "../controllers/app.controller";
import { AppService } from "../services/app.service";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "./user.module";
import { AuthModule } from "./auth.module";
import { ProductModule } from "./product.module";
import { OrderModule } from "./order.module";
import { PointsModule } from "./points.module";

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ProductModule, OrderModule, PointsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
