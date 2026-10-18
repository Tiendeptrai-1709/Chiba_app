import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { CreateOrderDto, UpdateStatusOrderDto } from "src/dto/order.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { OrderService } from "src/services/order.service";

@Controller("order")
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("checkout")
  checkout(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    // console.log("controller: ", createOrderDto)
    const userId = req.user.userId;
    return this.orderService.checkout(userId, createOrderDto);
  }

  @Get()
  getOrders(@Req() req: Request) {
    const userId = req.user.userId;
    return this.orderService.getOrders(userId);
  }

  @Patch(":id")
  updateStatusOrder(
    @Param("id") orderId: string,
    @Body() dto: UpdateStatusOrderDto,
    @Req() req: Request,
  ) {
    const userId = req.user.userId;
    return this.orderService.updateStatusOrder(orderId, dto.newStatus, userId);
  }

  @Get(":id")
  getOrderById(@Param("id") orderId:string, @Req() req:Request){
    const userId = req.user.userId;
    return this.orderService.getOrderById(orderId, userId);
  }

  @Patch(":id/cancel")
  cancelOrder(@Param("id") orderId:string, @Req() req:Request ){
    const userId = req.user.userId;
    return this.orderService.cancelOrder(userId, orderId)
  }
}
