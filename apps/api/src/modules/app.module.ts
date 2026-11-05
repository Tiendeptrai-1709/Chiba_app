import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "../controllers/app.controller";
import { AppService } from "../services/app.service";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "./user.module";
import { AuthModule } from "./auth.module";
import { ProductModule } from "./product.module";
import { OrderModule } from "./order.module";
import { PointsModule } from "./points.module";
import { StoreModule } from "./store.module";
import { AppThrottlerGuard, DEFAULT_RATE_LIMIT } from "./throttle.config";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: "default", ...DEFAULT_RATE_LIMIT }]),
    PrismaModule,
    UserModule,
    AuthModule,
    ProductModule,
    OrderModule,
    PointsModule,
    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
export class AppModule {}
