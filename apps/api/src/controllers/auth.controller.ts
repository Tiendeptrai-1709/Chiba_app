import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { CreateUserDto } from "src/dto/register.dto";
import { ForgotPasswordDto } from "src/dto/forgot-password.dto";
import { LoginDto } from "src/dto/login.dto";
import { ResetPasswordDto } from "src/dto/reset-password.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { JwtRefreshGuard } from "src/guards/jwt-refresh.guard";
import { AuthService } from "src/services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //Để false ở local nhưng khi lên production thì đổi thành true
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }

  @Post("register")
<<<<<<< Updated upstream
  create(@Body() dto: CreateUserDto) {
=======
  create(@Body() dto: RegisterDto) {
>>>>>>> Stashed changes
    return this.authService.register(dto);
  }

  //Gọi middleware Guard JwtRefreshGuard
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log("refesh")
    const { userId, refreshToken } = req.user;
    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: false, //Để false ở local nhưng khi lên production thì đổi thành true
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { userId } = req.user;
    await this.authService.logout(userId);
    res.clearCookie("refreshToken", { path: "/" });
    return { message: "Đăng xuất thành công" };
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } }) //rate limiting
  @Post("forgot-password")
  async forgotPassword(@Body() dto:ForgotPasswordDto) {
    console.log("contorl")
    return this.authService.forgotPassword(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } }) //rate limiting
  @Post("reset-password")
  async resetPassword(@Body() dto:ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
