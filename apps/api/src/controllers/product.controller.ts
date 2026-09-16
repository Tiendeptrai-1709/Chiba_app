import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { Roles } from "src/decorators/roles.decorator";
import { CreateProductDto } from "src/dto/product.dto";
import { Role } from "src/generated/prisma";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/role.guard";
import { ProductService } from "src/services/product.service";

@Controller("product")
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createProduct(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .build({ fileIsRequired: true }),
    )
    image: Express.Multer.File,
    @Body() dto: CreateProductDto,
  ) {
    console.log("IMAGE FILE:", image);
    const uploadResult = await this.cloudinaryService.uploadImage(image);
    return this.productService.createProduct(dto, uploadResult.secure_url);
  }

  @Get(":id")
  async getProduct(@Param("id") id: string) {
    return this.productService.getProduct(id);
  }

  @Get("")
  async getAllProduct() {
    return this.productService.getAllProduct();
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateProduct(
    @Param("id") id: string,
    @Body() data: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .build({ fileIsRequired: false }), // KHÁC với create: ảnh không bắt buộc
    )
    image?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (image) {
      const uploadResult = await this.cloudinaryService.uploadImage(image);

      imageUrl = uploadResult.secure_url;
    }
    return this.productService.updateProduct(id, data, imageUrl);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async deleteProduct(@Param("id") id: string) {
    return this.productService.deleteProduct(id);
  }
}
