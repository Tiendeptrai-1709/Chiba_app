import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";
import { Role } from "../generated/prisma";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Roles } from "../decorators/roles.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../types/jwt-payload";

class InviteDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;
}

// Admin mời nhân viên: email được mời khi đăng ký sẽ nhận vai trò STAFF.
@Controller("staff-invites")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class StaffInviteController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.staffInvite.findMany({ orderBy: { createdAt: "desc" } });
  }

  @Post()
  async create(@CurrentUser() admin: AuthUser, @Body() dto: InviteDto) {
    const [existingUser, existingInvite] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } }),
      this.prisma.staffInvite.findUnique({ where: { email: dto.email } }),
    ]);
    if (existingUser) throw new ConflictException("Email này đã được đăng ký tài khoản trên hệ thống");
    if (existingInvite) throw new ConflictException("Email này đã nằm trong danh sách được mời");
    return this.prisma.staffInvite.create({ data: { email: dto.email, invitedById: admin.id } });
  }

  @Delete(":email")
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param("email") email: string) {
    await this.prisma.staffInvite.deleteMany({ where: { email: email.trim().toLowerCase() } });
  }
}
