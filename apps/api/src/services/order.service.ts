import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDto } from "src/dto/order.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: string, createOrder: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException("Không tìm thấy người dùng");
      }

      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
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

      if (!cart || cart.items.length === 0) {
        throw new NotFoundException("Giỏ hàng không tồn tại hoặc đang trống");
      }

      if(createOrder.orderType === "DELIVERY" && !createOrder.deliveryAddress) {
        throw new NotFoundException("Địa chỉ giao hàng không được để trống");
      }

      let subtotal =0;
      
    });
  }
}
