import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { IsBoolean } from "class-validator";
import { Role } from "../generated/prisma";
import { Roles } from "../decorators/roles.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { MAX_IMAGE_BYTES, ProductService } from "../services/product.service";

class AvailabilityDto {
  @IsBoolean()
  isAvailable: boolean;
}

@Controller("products")
export class ProductController {
  constructor(private readonly products: ProductService) {}

  // Menu công khai (khách chưa đăng nhập cũng xem được)
  @Get()
  findAll() {
    return this.products.findAll();
  }

  // Nhân viên báo hết / còn món
  @Patch(":id/availability")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  setAvailability(@Param("id") id: string, @Body() dto: AvailabilityDto) {
    return this.products.setAvailability(id, dto.isAvailable);
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
