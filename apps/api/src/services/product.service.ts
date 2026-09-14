import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductDto } from "src/dto/product.dto";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProduct: CreateProductDto, imageUrl:string) {
    const existedProduct = await this.prisma.product.findUnique({
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
        imageUrl,
        category: createProduct.category ?? "MON_NUOC",
      },
    });
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    return product;
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
    const existedProduct = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existedProduct) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteProduct(id: string) {
    const existedProduct = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existedProduct) {
      throw new NotFoundException("Sản phẩm không tồn tại");
    }

    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
