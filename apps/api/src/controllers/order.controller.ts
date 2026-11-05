import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
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

  // Lịch sử đơn của khách (khai báo trước ":id")
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

  // Chi tiết đơn: khách xem đơn của mình, nhân viên/admin xem mọi đơn
  @Get(":id")
  findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.orders.findOne(id, user);
  }

  // Khách tự hủy khi đơn còn chờ xác nhận
  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.orders.cancelByCustomer(id, user.id);
  }

  @Patch(":id/status")
  @Roles(Role.STAFF, Role.ADMIN)
  updateStatus(@CurrentUser() staff: AuthUser, @Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status, staff.id);
  }
}
