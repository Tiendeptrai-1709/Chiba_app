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
import { isStaffMember } from "../utils/roles";
import {
  MAX_DISCOUNT_RATIO,
  PointsService,
  VND_PER_REDEEMED_POINT,
  pointsForAmount,
} from "./points.service";

const FREE_SHIP_THRESHOLD = 100_000;
const SHIPPING_FEE = 20_000;

// Chuyển trạng thái hợp lệ (nhân viên). Sau khi pha chế xong:
// đơn nhận tại quán → READY (chờ khách lấy); đơn giao → DELIVERING.
export function allowedNextStatuses(status: OrderStatus, orderType: OrderType): OrderStatus[] {
  switch (status) {
    case OrderStatus.PENDING:
      return [OrderStatus.PREPARING, OrderStatus.CANCELLED];
    case OrderStatus.PREPARING:
      return [orderType === OrderType.STORE ? OrderStatus.READY : OrderStatus.DELIVERING, OrderStatus.CANCELLED];
    case OrderStatus.READY:
    case OrderStatus.DELIVERING:
      return [OrderStatus.COMPLETED, OrderStatus.CANCELLED];
    default:
      return [];
  }
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  PREPARING: "Đang pha chế",
  READY: "Sẵn sàng",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

// Số phần cần trừ kho cho từng món: mỗi ly/phần trừ 1, mỗi topping trừ 1 theo số ly.
export function stockNeeded(items: Pick<OrderItemSnapshot, "productId" | "quantity" | "toppings">[]) {
  const needed = new Map<string, number>();
  const add = (id: string, qty: number) => needed.set(id, (needed.get(id) ?? 0) + qty);
  for (const item of items) {
    add(item.productId, item.quantity);
    for (const t of item.toppings ?? []) add(t.id, item.quantity);
  }
  return needed;
}

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

    // ----- Chi nhánh -----
    let store: { id: string; name: string } | null = null;
    if (dto.storeId) {
      store = await this.prisma.store.findFirst({
        where: { id: dto.storeId, isActive: true },
        select: { id: true, name: true },
      });
      if (!store) throw new BadRequestException("Chi nhánh đã chọn không còn hoạt động, vui lòng chọn lại cửa hàng");
    }

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
      if (product.stock <= 0) throw new ConflictException(`"${product.name}" đang tạm hết, vui lòng bỏ khỏi giỏ`);

      const isDrink = product.category === ProductCategory.MON_NUOC;
      const toppingIds = [...new Set(item.toppingIds ?? [])];
      if (!isDrink && toppingIds.length > 0) throw new BadRequestException(`"${product.name}" không thêm được topping`);

      const toppings = toppingIds.map((tid) => {
        const t = byId.get(tid);
        if (!t || t.category !== ProductCategory.TOPPING) throw new BadRequestException("Topping không hợp lệ");
        if (t.stock <= 0) throw new ConflictException(`Topping "${t.name}" đang tạm hết`);
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

    // ----- Kiểm tra đủ số lượng (gộp cùng món ở nhiều dòng + topping theo số ly) -----
    const needed = stockNeeded(items);
    for (const [productId, qty] of needed) {
      const p = byId.get(productId)!;
      if (p.stock < qty) {
        throw new ConflictException(`"${p.name}" chỉ còn ${p.stock} phần, bạn đang đặt ${qty}. Vui lòng giảm số lượng.`);
      }
    }

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

    // ----- Trừ kho + lưu đơn + trừ điểm trong cùng transaction -----
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          // Trừ có điều kiện (stock >= số cần): hai khách đặt cùng lúc phần cuối cùng thì chỉ một người được.
          for (const [productId, qty] of needed) {
            const { count } = await tx.product.updateMany({
              where: { id: productId, stock: { gte: qty } },
              data: { stock: { decrement: qty } },
            });
            if (count === 0) {
              const name = byId.get(productId)?.name ?? "Món";
              throw new ConflictException(`"${name}" vừa hết hoặc không còn đủ số lượng, vui lòng tải lại giỏ hàng`);
            }
          }
          const order = await tx.order.create({
            data: {
              code: this.generateCode(),
              userId: user.id,
              customerName: user.fullName,
              customerPhone: user.phone,
              storeId: store?.id,
              storeName: store?.name,
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

  // Chi tiết đơn: khách chỉ xem đơn của mình; nhân viên/admin xem mọi đơn.
  async findOne(orderId: string, viewer: { id: string; role: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { customerCode: true, email: true } } },
    });
    const isStaff = isStaffMember(viewer.role);
    if (!order || (!isStaff && order.userId !== viewer.id)) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }
    return order;
  }

  // Khách tự hủy: chỉ khi cửa hàng chưa nhận đơn (PENDING).
  async cancelByCustomer(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, status: true } });
    if (!order || order.userId !== userId) throw new NotFoundException("Không tìm thấy đơn hàng");
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("Cửa hàng đã nhận đơn nên không thể tự hủy. Vui lòng gọi cửa hàng để được hỗ trợ.");
    }
    return this.updateStatus(orderId, OrderStatus.CANCELLED, userId, { byCustomer: true });
  }

  async updateStatus(orderId: string, status: OrderStatus, actorId: string, opts: { byCustomer?: boolean } = {}) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException("Không tìm thấy đơn hàng");
      if (!allowedNextStatuses(order.status, order.orderType).includes(status)) {
        throw new BadRequestException(
          `Không thể chuyển đơn từ "${STATUS_LABELS[order.status]}" sang "${STATUS_LABELS[status]}"`,
        );
      }

      // Đổi trạng thái có điều kiện để hai người bấm cùng lúc không bị cộng/hoàn điểm 2 lần.
      const now = new Date();
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: {
          status,
          ...(status === OrderStatus.COMPLETED ? { completedAt: now } : {}),
          ...(status === OrderStatus.CANCELLED
            ? { cancelledAt: now, cancelledBy: opts.byCustomer ? "CUSTOMER" : actorId }
            : {}),
        },
      });
      if (count === 0) throw new ConflictException("Đơn vừa được cập nhật, vui lòng tải lại");
      const staffId = opts.byCustomer ? undefined : actorId;

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
      // Hủy đơn → trả lại số lượng vào kho (bỏ qua món đã bị xóa khỏi menu)
      if (status === OrderStatus.CANCELLED) {
        const items = order.items as unknown as OrderItemSnapshot[];
        for (const [productId, qty] of stockNeeded(items)) {
          await tx.product.updateMany({ where: { id: productId }, data: { stock: { increment: qty } } });
        }
      }
      if (order.userId && status === OrderStatus.CANCELLED && order.pointsUsed > 0) {
        await this.points.applyInTx(tx, {
          userId: order.userId,
          points: order.pointsUsed,
          type: "REFUND",
          description: `Hoàn điểm do ${opts.byCustomer ? "khách hủy" : "hủy"} đơn ${order.code}`,
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
