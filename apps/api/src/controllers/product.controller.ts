import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "src/decorators/roles.decorator";
import { CreateProductDto } from "src/dto/product.dto";
import { Role } from "src/generated/prisma";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { RolesGuard } from "src/guards/role.guard";
import { ProductService } from "src/services/product.service";

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
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
  async updateProduct(@Param("id") id: string, @Body() data: any) {
    return this.productService.updateProduct(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async deleteProduct(@Param("id") id: string) {
    return this.productService.deleteProduct(id);
  }
}
