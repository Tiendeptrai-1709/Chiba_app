import { BadRequestException, Injectable } from "@nestjs/common";
import { OrderStatus, Prisma } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import type { OrderItemSnapshot } from "./order.service";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 366;
const UNGROUPED = "Chưa phân danh mục";

// Ngày theo giờ Việt Nam (UTC+7) → mốc thời gian UTC lúc 00:00 ngày đó
function vnDayStart(date: string): number {
  const ms = Date.parse(`${date}T00:00:00+07:00`);
  if (Number.isNaN(ms)) throw new BadRequestException("Ngày không hợp lệ");
  return ms;
}

interface Line {
  quantity: number;
  revenue: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  // Số phần bán được và tiền món theo danh mục / từng món, chỉ tính đơn đã hoàn thành.
  // Món được xếp theo danh mục HIỆN TẠI (đổi danh mục thì số liệu cũ cũng đổi theo).
  async menu(from: string, to: string, storeId?: string) {
    const start = vnDayStart(from);
    const end = vnDayStart(to) + DAY_MS;
    if (end <= start) throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");
    if (end - start > MAX_RANGE_DAYS * DAY_MS) throw new BadRequestException(`Chỉ xem tối đa ${MAX_RANGE_DAYS} ngày`);

    const range = { gte: new Date(start), lt: new Date(end) };
    const where: Prisma.OrderWhereInput = {
      status: OrderStatus.COMPLETED,
      ...(storeId ? { storeId } : {}),
      // Đơn cũ chưa có completedAt thì lấy theo ngày tạo
      OR: [{ completedAt: range }, { completedAt: null, createdAt: range }],
    };

    const [orders, products, groups] = await Promise.all([
      this.prisma.order.findMany({ where, select: { items: true, total: true } }),
      this.prisma.product.findMany({ select: { id: true, groupId: true } }),
      this.prisma.menuGroup.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    ]);

    const groupOf = new Map(products.map((p) => [p.id, p.groupId]));
    const groupName = new Map(groups.map((g) => [g.id, g.name]));
    const byProduct = new Map<string, Line & { name: string }>();

    const add = (productId: string, name: string, quantity: number, revenue: number) => {
      const row = byProduct.get(productId) ?? { name, quantity: 0, revenue: 0 };
      row.quantity += quantity;
      row.revenue += revenue;
      byProduct.set(productId, row);
    };

    for (const order of orders) {
      for (const item of order.items as unknown as OrderItemSnapshot[]) {
        const toppings = item.toppings ?? [];
        const toppingUnit = toppings.reduce((s, t) => s + t.price, 0);
        // Tiền ly nước tính riêng, tiền topping tính cho món topping
        add(item.productId, item.name, item.quantity, (item.unitPrice - toppingUnit) * item.quantity);
        for (const t of toppings) add(t.id, t.name, item.quantity, t.price * item.quantity);
      }
    }

    const productRows = [...byProduct].map(([productId, row]) => {
      const groupId = groupOf.get(productId) ?? null;
      return {
        productId,
        name: row.name,
        groupId,
        groupName: groupId ? (groupName.get(groupId) ?? UNGROUPED) : UNGROUPED,
        quantity: row.quantity,
        revenue: row.revenue,
      };
    });
    productRows.sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);

    const byGroup = new Map<string | null, Line & { name: string }>();
    for (const row of productRows) {
      const g = byGroup.get(row.groupId) ?? { name: row.groupName, quantity: 0, revenue: 0 };
      g.quantity += row.quantity;
      g.revenue += row.revenue;
      byGroup.set(row.groupId, g);
    }
    const groupRows = [...byGroup].map(([groupId, g]) => ({ groupId, ...g }));
    groupRows.sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity);

    return {
      from,
      to,
      orderCount: orders.length,
      // Tiền khách thực trả (đã trừ điểm, gồm phí ship)
      revenue: orders.reduce((s, o) => s + o.total, 0),
      // Tổng tiền món (trước giảm giá điểm, chưa gồm phí ship)
      itemRevenue: productRows.reduce((s, r) => s + r.revenue, 0),
      groups: groupRows,
      products: productRows,
    };
  }
}
