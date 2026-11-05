import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "../generated/prisma";
import { CreateUserDto } from "../dto/create-user.dto";
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
  create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }
}
