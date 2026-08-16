import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateProductDto } from "src/dto/product.dto";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProduct: CreateProductDto) {
    const existedProduct = await this.prisma.product.findFirst({
      where: {
        name: createProduct.name,
      },
    });
    if (existedProduct) {
      throw new BadRequestException("Sản phẩm đã tồn tại");
    }

    return this.prisma.product.create({
      data: {
        name: createProduct.name,
        price: createProduct.price,
        imageUrl: createProduct.imageUrl,
        category: createProduct.category ?? "MON_NUOC",
      },
    });
  }

  async getProduct(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async getAllProduct() {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        category: true,
        isAvailable: true,
      },
    });
  }

  async updateProduct(id: string, data: any) {
    return this.prisma.product.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
