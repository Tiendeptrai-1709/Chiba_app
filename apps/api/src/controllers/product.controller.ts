import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

import { Role } from "../generated/prisma";
import { CreateProductDto, SetStockDto, UpdateProductDto } from "../dto/product.dto";
import { Roles } from "../decorators/roles.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { MAX_IMAGE_BYTES, ProductService } from "../services/product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly products: ProductService) {}

  // Menu công khai (khách chưa đăng nhập cũng xem được)
  @Get()
  findAll() {
    return this.products.findAll();
  }

  // ----- Admin quản lý menu -----
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param("id") id: string) {
    await this.products.remove(id);
  }

  // Nhân viên cập nhật số lượng còn bán được (0 = hết hàng)
  @Patch(":id/stock")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  setStock(@Param("id") id: string, @Body() dto: SetStockDto) {
    return this.products.setStock(id, dto.stock);
  }

  // Admin upload ảnh minh họa (form-data, field "image")
  @Post(":id/image")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    }),
  )
  uploadImage(@Param("id") id: string, @UploadedFile() file: Express.Multer.File) {
    return this.products.setImage(id, file);
  }

  @Delete(":id/image")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeImage(@Param("id") id: string) {
    return this.products.removeImage(id);
  }
}
