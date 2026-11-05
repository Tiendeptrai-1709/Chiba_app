import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomInt } from "crypto";
import { OrderStatus, OrderType, Prisma, ProductCategory } from "../generated/prisma";
import { CreateOrderDto } from "../dto/create-order.dto";
import { PrismaService } from "../prisma/prisma.service";
import {
  MAX_DISCOUNT_RATIO,
  PointsService,
  VND_PER_REDEEMED_POINT,
  pointsForAmount,
} from "./points.service";

const FREE_SHIP_THRESHOLD = 100_000;
const SHIPPING_FEE = 20_000;

// Chuyển trạng thái hợp lệ
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  unitPrice: number; // giá món + topping
  quantity: number;
  toppings: { id: string; name: string; price: number }[];
  sugar: number | null;
  ice: string | null;
  lineTotal: number;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly points: PointsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, fullName: true, phone: true, zenPoints: true },
    });

    // ----- Tính tiền từ giá trong DB (không tin giá client gửi lên) -----
    const ids = new Set<string>();
    for (const item of dto.items) {
      ids.add(item.productId);
      item.toppingIds?.forEach((t) => ids.add(t));
    }
    const products = await this.prisma.product.findMany({ where: { id: { in: [...ids] } } });
    const byId = new Map(products.map((p) => [p.id, p]));

    const items: OrderItemSnapshot[] = dto.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw new BadRequestException("Có món không còn trong menu, vui lòng tải lại trang");
      if (!product.isAvailable) throw new ConflictException(`"${product.name}" đang tạm hết, vui lòng bỏ khỏi giỏ`);

      const isDrink = product.category === ProductCategory.MON_NUOC;
      const toppingIds = [...new Set(item.toppingIds ?? [])];
      if (!isDrink && toppingIds.length > 0) throw new BadRequestException(`"${product.name}" không thêm được topping`);

      const toppings = toppingIds.map((tid) => {
        const t = byId.get(tid);
        if (!t || t.category !== ProductCategory.TOPPING) throw new BadRequestException("Topping không hợp lệ");
        if (!t.isAvailable) throw new ConflictException(`Topping "${t.name}" đang tạm hết`);
        return { id: t.id, name: t.name, price: t.price };
      });

      const unitPrice = product.price + toppings.reduce((s, t) => s + t.price, 0);
      return {
        productId: product.id,
        name: product.name,
        unitPrice,
        quantity: item.quantity,
        toppings,
        sugar: isDrink ? (item.sugar ?? 100) : null,
        ice: isDrink ? (item.ice ?? "NORMAL") : null,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const shippingFee =
      dto.orderType === OrderType.DELIVERY && subtotal < FREE_SHIP_THRESHOLD ? SHIPPING_FEE : 0;

    const maxPointsByRule = Math.floor((subtotal * MAX_DISCOUNT_RATIO) / VND_PER_REDEEMED_POINT);
    const pointsUsed = dto.pointsToUse ?? 0;
    if (pointsUsed > maxPointsByRule) {
      throw new BadRequestException(`Chỉ dùng tối đa ${maxPointsByRule} điểm cho đơn này (giảm tối đa 20%)`);
    }
    if (pointsUsed > user.zenPoints) throw new BadRequestException("Bạn không đủ điểm");

    const discountAmount = pointsUsed * VND_PER_REDEEMED_POINT;
    const total = subtotal - discountAmount + shippingFee;
    const pointsEarned = pointsForAmount(subtotal - discountAmount);

    // ----- Lưu đơn + trừ điểm trong cùng transaction -----
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              code: this.generateCode(),
              userId: user.id,
              customerName: user.fullName,
              customerPhone: user.phone,
              orderType: dto.orderType,
              address: dto.orderType === OrderType.DELIVERY ? dto.address : null,
              paymentMethod: dto.paymentMethod,
              items: items as unknown as Prisma.InputJsonValue,
              subtotal,
              shippingFee,
              pointsUsed,
              discountAmount,
              total,
              pointsEarned,
            },
          });
          if (pointsUsed > 0) {
            await this.points.applyInTx(tx, {
              userId: user.id,
              points: -pointsUsed,
              type: "REDEEMED_APP",
              description: `Dùng điểm giảm giá đơn ${order.code} (-${discountAmount.toLocaleString("vi-VN")}đ)`,
              orderId: order.id,
            });
          }
          return order;
        });
      } catch (error) {
        const isCodeClash =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          JSON.stringify(error.meta ?? {}).includes("code");
        if (!isCodeClash) throw error;
      }
    }
    throw new ConflictException("Không tạo được mã đơn, vui lòng thử lại");
  }

  listMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  listAll(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { customerCode: true, email: true } } },
    });
  }

  async updateStatus(orderId: string, status: OrderStatus, staffId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException("Không tìm thấy đơn hàng");
      if (!NEXT_STATUS[order.status].includes(status)) {
        throw new BadRequestException(`Không thể chuyển đơn từ ${order.status} sang ${status}`);
      }

      // Đổi trạng thái có điều kiện để hai nhân viên bấm cùng lúc không bị cộng điểm 2 lần.
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status },
      });
      if (count === 0) throw new ConflictException("Đơn vừa được người khác cập nhật, vui lòng tải lại");

      if (order.userId && status === OrderStatus.COMPLETED && order.pointsEarned > 0) {
        await this.points.applyInTx(tx, {
          userId: order.userId,
          points: order.pointsEarned,
          type: "EARNED_ORDER",
          description: `Tích điểm từ đơn ${order.code} (+${order.pointsEarned} điểm)`,
          orderId: order.id,
          createdById: staffId,
        });
      }
      if (order.userId && status === OrderStatus.CANCELLED && order.pointsUsed > 0) {
        await this.points.applyInTx(tx, {
          userId: order.userId,
          points: order.pointsUsed,
          type: "REFUND",
          description: `Hoàn điểm do hủy đơn ${order.code}`,
          orderId: order.id,
          createdById: staffId,
        });
      }

      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    });
  }

  private generateCode(): string {
    return "DH" + randomInt(0, 1_000_000).toString().padStart(6, "0");
  }
}
