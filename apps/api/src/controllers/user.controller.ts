import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { UserSevice } from "../services/user.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { Request, Response } from "express";
import { DeleteProfileDto } from "src/dto/delete-profile.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserSevice) {}

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req: Request) {
    const { userId } = req.user;
    return this.userService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllUser() {
    return this.userService.findAllUser();
  }

  @UseGuards(JwtAuthGuard)
  @Delete("profile")
  async deleteProfile(
    @Req() req: Request,
    @Body() dto:DeleteProfileDto ,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId } = req.user;
    // console.log("contr", dto.typeDel)
    await this.userService.deleteProfile(userId, dto.typeDel);
    res.clearCookie("refreshToken", { path: "/" });
    return { message: "Đã xóa tài khoản thành công" };
  }
}
