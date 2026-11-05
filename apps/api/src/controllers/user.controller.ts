import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "../generated/prisma";
import { ChangeRoleDto, CreateUserDto } from "../dto/create-user.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Roles } from "../decorators/roles.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { UserService } from "../services/user.service";
import type { AuthUser } from "../types/jwt-payload";

// Mọi route đều cần đăng nhập. Route không gắn @Roles thì role nào cũng dùng được.
// Khách hàng tự đăng ký qua POST /auth/register.
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ----- Hồ sơ của chính mình -----
  @Patch("me")
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Post("me/suspend")
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendMe(@CurrentUser() user: AuthUser) {
    await this.userService.suspend(user.id);
  }

  @Delete("me")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() user: AuthUser) {
    await this.userService.deleteUser(user.id);
  }

  // ----- Quản lý -----
  // STAFF được xem danh sách để tra cứu khách hàng tại quầy.
  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  findAll() {
    return this.userService.findAllUsers();
  }

  // Nhân viên quét QR khách → tra cứu theo mã khách hàng
  @Get("by-code/:code")
  @Roles(Role.ADMIN, Role.STAFF)
  async findByCode(@Param("code") code: string) {
    const user = await this.userService.findPublicByCode(code);
    if (!user) throw new NotFoundException("Không tìm thấy khách hàng với mã này");
    return user;
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser() actor: AuthUser, @Body() dto: CreateUserDto) {
    if (dto.role === Role.ADMIN && actor.role !== Role.OWNER) {
      throw new ForbiddenException("Chỉ OWNER được tạo tài khoản Admin");
    }
    return this.userService.createUser(dto);
  }

  // Chỉ OWNER: thăng cấp / hạ cấp Khách hàng ↔ Nhân viên ↔ Admin
  @Patch(":id/role")
  @Roles(Role.OWNER)
  changeRole(@CurrentUser() owner: AuthUser, @Param("id") id: string, @Body() dto: ChangeRoleDto) {
    return this.userService.changeRole(owner.id, id, dto.role);
  }
}
