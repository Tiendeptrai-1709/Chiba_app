import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { LoginDto } from "src/dto/login.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { JwtRefreshGuard } from "src/guards/jwt-refresh.guard";
import { AuthService } from "src/services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(
      dto.email,
      dto.password,
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //Để false ở local nhưng khi lên production thì đổi thành true
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }

  //Gọi middleware Guard JwtRefreshGuard
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough:true }) res:Response) {
    const { userId, refreshToken } = req.user;
    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    res.cookie("refreshToken", tokens.refreshToken,{
      httpOnly: true,
      secure: false, //Để false ở local nhưng khi lên production thì đổi thành true
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {accessToken: tokens.accessToken}
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough:true}) res:Response) {
    const { userId } = req.user;
    await this.authService.logout(req.user.userId);
    res.clearCookie("refreshToken", { path: "/" });
    return { message: "Đăng xuất thành công" };
  }
}
