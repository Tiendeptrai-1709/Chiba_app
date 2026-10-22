import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto } from "src/dto/order.dto";
import { OrderStatus } from "src/generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  // =============================
  // 1. Checkout: Tạo đơn hàng từ giỏ hàng
  // =============================

  async checkout(userId: string, createOrder: CreateOrderDto) {
    return this.prisma.$transaction(
      async (tx) => {
        // ====== 1. Kiểm tra người dùng tồn tại và lấy thông tin giỏ hàng =====
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
        if (
          createOrder.orderType === "DELIVERY" &&
          !createOrder.deliveryAddress
        ) {
          throw new NotFoundException("Địa chỉ giao hàng không được để trống");
        }

        // ===== 2. Tính toán tổng tiền, phí vận chuyển, điểm tích lũy và tạo đơn hàng =====
        let subtotal = 0;

        // Duyệt qua từng sản phẩm trong giỏ hàng để tính toán tổng tiền và các topping
        const orderItems = cart.items.map((item) => {
          const product = item.product;
          if (!product) {
            throw new BadRequestException(
              `Sản phẩm với id ${item.productId} không tồn tại`,
            );
          }
          const toppings = item.toppings.map((topping) => {
            const toppingProduct = topping.topping;
            if (!toppingProduct) {
              throw new BadRequestException(
                `Topping với id ${topping.toppingId} không tồn tại`,
              );
            }
            return {
              toppingId: toppingProduct.id,
              toppingName: toppingProduct.name,
              unitPrice: toppingProduct.price,
            };
          });

          const toppingsPrice = toppings.reduce(
            (sum, topping) => sum + topping.unitPrice,
            0,
          );

          // Tổng tiền dòng = (giá sản phẩm + tổng giá topping) * số lượng
          const lineTotal = (product.price + toppingsPrice) * item.quantity;

          // Cộng dồn vào tổng tiền tạm tính
          subtotal += lineTotal;

          return {
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl,
            unitPrice: product.price,
            quantity: item.quantity,
            lineTotal,
            toppings,
          };
        });

        // ========= 3. Kiểm tra số điểm sử dụng và tính toán các khoản phí ========
        const pointsUsed = createOrder.pointsUsed ?? 0;

        // Qui định nghiệp vụ:
        // - Đổi điểm tối đa giảm 20% tổng giá trị đơn hàng (subtotal)
        // - Tỷ lệ quy đổi: 1 điểm = 500 VND
        const maxDiscountAmount = Math.floor(subtotal * 0.2);
        const maxPointsAllowed = Math.floor(maxDiscountAmount / 500);
        if (pointsUsed > maxPointsAllowed) {
          throw new BadRequestException(
            `Số điểm sử dụng vượt quá giới hạn cho phép. Giới hạn: ${maxPointsAllowed}`,
          );
        }
        if (pointsUsed > user.zenPoints) {
          throw new BadRequestException(
            `Số điểm sử dụng vượt quá số điểm hiện có của người dùng. Điểm hiện có: ${user.zenPoints}`,
          );
        }
        // Số tiền giảm giá = số điểm sử dụng * 500
        const discountAmount = pointsUsed * 500;

        // ======= 4. Tính toán phí vận chuyển và tổng tiền cuối cùng =======
        const shippingFee =
          createOrder.orderType === "DELIVERY"
            ? subtotal >= 100_000
              ? 0
              : 20_000
            : 0;
        // Tổng tiền cuối cùng = subtotal - discountAmount + shippingFee
        const totalAmount = subtotal - discountAmount + shippingFee;

        // Điểm thưởng dự kiến = (subtotal - discountAmount) / 10_000, làm tròn xuống
        const earnedPoints = Math.floor((subtotal - discountAmount) / 10_000);

        // ======= 5. Tạo đơn hàng và các chi tiết liên quan ========
        const order = await tx.order.create({
          data: {
            userId,
            orderType: createOrder.orderType,
            deliveryAddress:
              createOrder.orderType === "DELIVERY"
                ? createOrder.deliveryAddress!.trim()
                : null,
            customerName: user.fullName,
            customerPhone: user.phone,
            subtotal,
            pointsUsed,
            discountAmount,
            shippingFee,
            totalAmount,
            earnedPoints,
            note: createOrder.note?.trim() || null,
            items: {
              create: orderItems.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                lineTotal: item.lineTotal,
                toppings: {
                  create: item.toppings,
                },
              })),
            },
          },
          include: {
            items: {
              include: {
                toppings: true,
              },
            },
          },
        });

        // ======== 6. Cập nhật số điểm của người dùng và xóa giỏ hàng ========
        if (pointsUsed > 0) {
          // Cập nhật có điều kiện để không trừ âm điểm
          const debit = await tx.user.updateMany({
            where: {
              id: userId,
              zenPoints: { gte: pointsUsed }, // đảm bảo số điểm hiện có >= số điểm sử dụng
            },
            data: {
              zenPoints: { decrement: pointsUsed },
            },
          });

          // Nếu count !== 1 nghĩa là số điểm đã thay đổi trong quá trình giao dịch, có thể do người dùng khác sử dụng điểm cùng lúc, nên cần thông báo lỗi để người dùng tải lại giỏ hàng.
          if (debit.count !== 1) {
            throw new BadRequestException(
              "Điểm tích lũy đã thay đổi. Vui lòng tải lại giỏ hàng.",
            );
          }
        }

        // Xóa giỏ hàng và các chi tiết liên quan sau khi tạo đơn hàng thành công
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return order;
      },
      {
        // Checkout có nhiều truy vấn và nested writes; mặc định 5 giây hơi ngắn.
        timeout: 15_000,
      },
    );
  }

  // ======================================
  // 2. Lấy danh sách đơn hàng của người dùng
  // ======================================
  async getOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            toppings: true,
          },
        },
      },
    });
    return orders;
  }

  // =================================
  // 3. Lấy tất cả order của users (ADMIN)
  // =================================
  async getUserOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            customerCode: true,
          },
        },
        items: {
          include: {
            toppings: true,
          },
        },
      },
    });
  }

  // ==================================
  // 4. Lấy tất cả đơn hàng để quản lý
  // ==================================
  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            customerCode: true,
          },
        },
        items: {
          include: {
            toppings: true,
          },
        },
      },
    });
  }

  // ====================================
  // 5. Update status order (ADMIN)
  // ====================================
  async updateStatusOrder(
    orderId: string,
    newStatus: OrderStatus,
    adminId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1.kiểm tra admin
      // console.log("service: ", newStatus);
      // const admin = await tx.user.findUnique({
      //   where: { id: adminId },
      //   select: { role: true },
      // });
      // if (!admin || admin.role !== "ADMIN") {
      //   throw new ForbiddenException(
      //     "Bạn không có quyền cập nhật trạng thái đơn hàng",
      //   );
      // }

      // 2. Lấy đơn hàng hiện tại
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });
      if (!order) {
        throw new NotFoundException("Không tìm thấy đơn hàng");
      }

      // 3. Kiểm tra trạng thái chuyển tiếp có hợp lệ không
      const allowedTransitions: Record<string, string[]> = {
        PENDING: ["PREPARING", "CANCELLED"],
        PREPARING:
          order.orderType === "PICKUP"
            ? ["READY", "CANCELLED"]
            : ["DELIVERING", "CANCELLED"],
        READY: ["COMPLETED", "CANCELLED"],
        DELIVERING: ["COMPLETED", "CANCELLED"],
        COMPLETED: [],
        CANCELLED: [],
      };

      const allowedStatuses = allowedTransitions[order.status] ?? [];
      if (!allowedStatuses.includes(newStatus)) {
        throw new BadRequestException(
          `Không thể chuyển đơn hàng từ ${order.status} sang ${newStatus}`,
        );
      }

      // 4. Cập nhật có điều kiện để tránh hai request
      // cùng xử lý một trạng thái cũ
      const result = await tx.order.updateMany({
        where: {
          id: orderId,
          status: order.status,
        },
        data: {
          status: newStatus,
          ...(newStatus === "COMPLETED" ? { completedAt: new Date() } : {}),
          ...(newStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}),
        },
      });

      if (result.count !== 1) {
        throw new ConflictException(
          "Trạng thái đơn hàng đã thay đổi. Vui lòng tải lại dữ liệu",
        );
      }

      // 5. Khi hoàn thành: cộng điểm thưởng
      if (newStatus === "COMPLETED" && order.earnedPoints > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: {
            zenPoints: { increment: order.earnedPoints },
          },
        });
      }

      // 6. Khi hủy: hoàn lại điểm đã dùng lúc checkout
      if (newStatus === "CANCELLED" && order.pointsUsed > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: {
            zenPoints: { increment: order.pointsUsed },
          },
        });
      }

      // 7. Trả về đơn hàng sau khi cập nhật
      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              toppings: true,
            },
          },
        },
      });
    });
  }

  // =========================
  // 6. Lấy order theo id
  // =========================
  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            toppings: true,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }
    return order;
  }

  // ===========================
  // 7. Hủy đơn hàng
  // ===========================
  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });
    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }

    return this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });
  }
}
