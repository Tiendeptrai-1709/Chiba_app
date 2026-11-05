import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { OrderStatus, Role } from "../generated/prisma";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Roles } from "../decorators/roles.decorator";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dto/create-order.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { OrderService } from "../services/order.service";
import type { AuthUser } from "../types/jwt-payload";

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, dto);
  }

  @Get("me")
  mine(@CurrentUser() user: AuthUser) {
    return this.orders.listMine(user.id);
  }

  @Get()
  @Roles(Role.STAFF, Role.ADMIN)
  all(@Query("status") status?: string) {
    const valid = Object.values(OrderStatus).includes(status as OrderStatus);
    return this.orders.listAll(valid ? (status as OrderStatus) : undefined);
  }

  @Patch(":id/status")
  @Roles(Role.STAFF, Role.ADMIN)
  updateStatus(@CurrentUser() staff: AuthUser, @Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status, staff.id);
  }
}
