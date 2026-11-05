import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Role } from "../generated/prisma";
import { MenuGroupDto, ReorderMenuGroupsDto } from "../dto/product.dto";
import { Roles } from "../decorators/roles.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { MenuGroupService } from "../services/menu-group.service";

@Controller("menu-groups")
export class MenuGroupController {
  constructor(private readonly groups: MenuGroupService) {}

  // Công khai: khách dùng để lọc menu theo danh mục
  @Get()
  findAll() {
    return this.groups.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: MenuGroupDto) {
    return this.groups.create(dto.name);
  }

  // Khai báo trước ":id" để "reorder" không bị hiểu là id
  @Patch("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reorder(@Body() dto: ReorderMenuGroupsDto) {
    return this.groups.reorder(dto.ids);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  rename(@Param("id") id: string, @Body() dto: MenuGroupDto) {
    return this.groups.rename(id, dto.name);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param("id") id: string) {
    await this.groups.remove(id);
  }
}
