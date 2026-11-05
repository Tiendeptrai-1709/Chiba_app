import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Sse,
  UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { IsBoolean } from "class-validator";
import { Observable } from "rxjs";
import { OrderStatus, Role } from "../generated/prisma";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Roles } from "../decorators/roles.decorator";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dto/create-order.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { OrderEventsService, SseMessage } from "../services/order-events.service";
import { OrderService } from "../services/order.service";
import type { AuthUser } from "../types/jwt-payload";

class SetPaidDto {
  @IsBoolean()
  paid: boolean;
}

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(
    private readonly orders: OrderService,
    private readonly events: OrderEventsService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, dto);
  }

  // ----- Báo đơn tức thì (Server-Sent Events) — khai báo trước ":id" -----

  // Nhân viên / admin: mọi đơn mới & thay đổi trạng thái
  @Sse("stream")
  @SkipThrottle()
  @Roles(Role.STAFF, Role.ADMIN)
  @Header("Cache-Control", "no-cache, no-transform")
  @Header("X-Accel-Buffering", "no")
  staffStream(): Observable<SseMessage> {
    return this.events.stream();
  }

  // Khách: chỉ đơn của mình
  @Sse("me/stream")
  @SkipThrottle()
  @Header("Cache-Control", "no-cache, no-transform")
  @Header("X-Accel-Buffering", "no")
  myStream(@CurrentUser() user: AuthUser): Observable<SseMessage> {
    return this.events.stream(user.id);
  }

  // Lịch sử đơn của khách
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

  // Xác nhận đã nhận tiền (đơn chuyển khoản) — hoặc bỏ xác nhận nếu bấm nhầm
  @Patch(":id/payment")
  @Roles(Role.STAFF, Role.ADMIN)
  setPaid(@CurrentUser() staff: AuthUser, @Param("id") id: string, @Body() dto: SetPaidDto) {
    return this.orders.setPaid(id, dto.paid, staff.id);
  }
}
