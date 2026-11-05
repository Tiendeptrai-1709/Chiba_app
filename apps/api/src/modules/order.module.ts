import { Module } from "@nestjs/common";
import { OrderController } from "../controllers/order.controller";
import { OrderService } from "../services/order.service";
import { OrderEventsService } from "../services/order-events.service";
import { PointsModule } from "./points.module";

@Module({
  imports: [PointsModule],
  controllers: [OrderController],
  providers: [OrderService, OrderEventsService],
})
export class OrderModule {}
