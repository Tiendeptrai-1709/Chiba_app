import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AddCartItemDto, UpdateCartItemDto } from "src/dto/cart.dto";
import { ProductCategory } from "src/generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            product: true,
            toppings: {
              include: {
                topping: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: {
          items: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              product: true,
              toppings: {
                include: {
                  topping: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getCart(userId);

    const product = await this.prisma.product.findUnique({
      where: {
        id: dto.productId,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    //Chuẩn hóa toppingIds
    const toppingIds = [...new Set(dto.toppingIds)].sort();

    if (toppingIds.length > 0) {
      const toppings = await this.prisma.product.findMany({
        where: {
          id: {
            in: toppingIds,
          },
          category: ProductCategory.TOPPING,
        },
        select: {
          id: true,
        },
      });

      if (toppings.length !== toppingIds.length) {
        throw new BadRequestException("One or more toppings are invalid");
      }
    }

    // Tìm tất cả CartItem cùng product
    const existingItems = await this.prisma.cartItem.findMany({
      where: {
        cartId: cart.id,
        productId: dto.productId,
      },
      include: {
        toppings: {
          select: {
            toppingId: true,
          },
        },
      },
    });

    // Tìm CartItem có cùng bộ topping
    const existingItem = existingItems.find((item) => {
      const existingToppingIds = item.toppings
        .map((topping) => topping.toppingId)
        .sort();

      if (existingToppingIds.length !== toppingIds.length) {
        return false;
      }

      return existingToppingIds.every((id, idx) => id === toppingIds[idx]);
    });

    // Nếu đã tồn tại tăng quantity
    if (existingItem) {
      return this.prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: {
            increment: dto.quantity,
          },
        },
        include: {
          product: true,
          toppings: {
            include: {
              topping: true,
            },
          },
        },
      });
    }

    // Nếu chưa tồn tại → tạo CartItem mới
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,

        toppings: {
          create: toppingIds.map((toppingId) => ({
            toppingId,
          })),
        },
      },

      include: {
        product: true,
        toppings: {
          include: {
            topping: true,
          },
        },
      },
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException("Cart item not found");
    }

    return this.prisma.cartItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity: dto.quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException("Cart item not found");
    }

    await this.prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return {
      message: "Cart item removed successfully",
    };
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {
      message: "Cart cleared successfully",
    };
  }
}
