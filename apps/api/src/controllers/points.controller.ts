import { Body, Controller, ForbiddenException, Get, NotFoundException, Post, UseGuards } from "@nestjs/common";
import { Role } from "../generated/prisma";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Roles } from "../decorators/roles.decorator";
import { AdjustPointsDto, StoreEarnDto } from "../dto/points.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { PrismaService } from "../prisma/prisma.service";
import { PointsService, pointsForAmount } from "../services/points.service";
import type { AuthUser } from "../types/jwt-payload";

@Controller("points")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointsController {
  constructor(
    private readonly points: PointsService,
    private readonly prisma: PrismaService,
  ) {}

  // Lịch sử điểm của chính mình
  @Get("me")
  myHistory(@CurrentUser() user: AuthUser) {
    return this.points.listForUser(user.id);
  }

  // Nhật ký điểm toàn hệ thống
  @Get()
  @Roles(Role.ADMIN)
  all() {
    return this.points.listAll();
  }

  // Tích điểm khi khách order tại quầy (nhân viên quét QR)
  @Post("store-earn")
  @Roles(Role.STAFF, Role.ADMIN)
  async storeEarn(@CurrentUser() staff: AuthUser, @Body() dto: StoreEarnDto) {
    const customer = await this.prisma.user.findUnique({
      where: { customerCode: dto.customerCode },
      select: { id: true, isSuspended: true },
    });
    if (!customer) throw new NotFoundException("Không tìm thấy khách hàng với mã này");
    if (customer.isSuspended) throw new ForbiddenException("Tài khoản khách đang tạm ngưng");

    const earned = pointsForAmount(dto.billAmount);
    return this.points.apply({
      userId: customer.id,
      points: earned,
      type: "EARNED_STORE",
      description: `Tích điểm hóa đơn tại quầy ${dto.billAmount.toLocaleString("vi-VN")}đ`,
      createdById: staff.id,
    });
  }

  // Đổi quà tại quầy (trừ điểm) — STAFF/ADMIN; điều chỉnh tự do — chỉ ADMIN
  @Post("adjust")
  @Roles(Role.STAFF, Role.ADMIN)
  adjust(@CurrentUser() staff: AuthUser, @Body() dto: AdjustPointsDto) {
    if (dto.type === "ADMIN_ADJUST" && staff.role !== Role.ADMIN) {
      throw new ForbiddenException("Chỉ Admin được điều chỉnh điểm tự do");
    }
    if (dto.type === "REDEEMED_STORE" && dto.points > 0) {
      throw new ForbiddenException("Đổi quà chỉ được trừ điểm");
    }
    return this.points.apply({
      userId: dto.userId,
      points: dto.points,
      type: dto.type,
      description: dto.description,
      createdById: staff.id,
    });
  }
}
