import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { UserSevice } from "../services/user.service";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { Request, Response } from "express";
import { DeleteProfileDto } from "src/dto/auth.dto";
import { RolesGuard } from "src/guards/role.guard";
import { Roles } from "src/decorators/roles.decorator";
import { Role } from "src/generated/prisma";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserSevice) {}

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Req() req: Request) {
    const { userId } = req.user;
    return this.userService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post("/update")
  async updateUserPoint(@Body() payload:{id: string, zenPoints:number}) {
    // console.log("id123",typeof(id))
    return this.userService.updateUserPoint(payload.id, payload.zenPoints);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post("")
  async getUserById(@Body("id") id: string) {
    // console.log("id123",typeof(id))
    return this.userService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get("customers")
  getAllCustomers() {
    return this.userService.getAllCustomers();
  }

  @UseGuards(JwtAuthGuard)
  @Delete("profile")
  async deleteProfile(
    @Req() req: Request,
    @Body() dto: DeleteProfileDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId } = req.user;
    // console.log("contr", dto.typeDel)
    await this.userService.deleteProfile(userId, dto.typeDel);
    res.clearCookie("refreshToken", { path: "/" });
    return { message: "Đã xóa tài khoản thành công" };
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  async updateProfile(@Req() req: Request, @Body() data: any) {
    const { userId } = req.user;
    return this.userService.updateProfile(userId, data);
  }
}
