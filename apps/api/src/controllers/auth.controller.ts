import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "../decorators/current-user.decorator";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { JwtRefreshGuard } from "../guards/jwt-refresh.guard";
import { AuthService } from "../services/auth.service";
import type { AuthUser, RefreshUser } from "../types/jwt-payload";
import { AUTH_RATE_LIMIT } from "../modules/throttle.config";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Giới hạn chặt hơn để chống dò mật khẩu / spam tạo tài khoản
  @Post("register")
  @Throttle({ default: AUTH_RATE_LIMIT })
  register(@Body() dto: RegisterDto, @Headers("user-agent") userAgent?: string) {
    return this.authService.register(dto, userAgent);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: AUTH_RATE_LIMIT })
  login(@Body() dto: LoginDto, @Headers("user-agent") userAgent?: string) {
    return this.authService.login(dto, userAgent);
  }

  // Gửi refresh token qua header: Authorization: Bearer <refreshToken>
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  refresh(@CurrentUser() user: RefreshUser) {
    return this.authService.refresh(user.id, user.sessionId, user.refreshToken);
  }

  // Chỉ đăng xuất thiết bị hiện tại
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: AuthUser) {
    await this.authService.logout(user.sessionId);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
