import { Module } from "@nestjs/common";
import { OrderController } from "src/controllers/order.controller";
import { OrderService } from "src/services/order.service";

@Module({
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}