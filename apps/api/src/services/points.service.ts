import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PointTransactionType } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";

// Quy đổi điểm dùng chung cho đơn online và tại quầy.
export const VND_PER_EARNED_POINT = 10_000; // 10.000đ = 1 điểm
export const VND_PER_REDEEMED_POINT = 500; // 1 điểm = giảm 500đ
export const MAX_DISCOUNT_RATIO = 0.2; // giảm tối đa 20% tiền món

export function pointsForAmount(amount: number): number {
  return Math.max(0, Math.floor(amount / VND_PER_EARNED_POINT));
}

export interface ApplyPointsInput {
  userId: string;
  points: number; // dương = cộng, âm = trừ
  type: PointTransactionType;
  description: string;
  orderId?: string;
  createdById?: string;
}

const transactionInclude = {
  user: { select: { id: true, email: true, fullName: true, customerCode: true } },
} satisfies Prisma.PointTransactionInclude;

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cộng/trừ điểm và ghi lịch sử trong CÙNG một transaction.
   * Trừ điểm dùng điều kiện `zenPoints >= n` nên không bao giờ âm, kể cả khi
   * hai nhân viên thao tác cùng lúc.
   */
  async applyInTx(tx: Prisma.TransactionClient, input: ApplyPointsInput) {
    if (!Number.isInteger(input.points) || input.points === 0) {
      throw new BadRequestException("Số điểm phải là số nguyên khác 0");
    }

    if (input.points < 0) {
      const { count } = await tx.user.updateMany({
        where: { id: input.userId, zenPoints: { gte: -input.points } },
        data: { zenPoints: { increment: input.points } },
      });
      if (count === 0) {
        const exists = await tx.user.findUnique({ where: { id: input.userId }, select: { id: true } });
        if (!exists) throw new NotFoundException("Không tìm thấy khách hàng");
        throw new BadRequestException("Khách hàng không đủ điểm");
      }
    } else {
      await tx.user.update({
        where: { id: input.userId },
        data: { zenPoints: { increment: input.points } },
      });
    }

    const { zenPoints: pointsAfter } = await tx.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { zenPoints: true },
    });

    return tx.pointTransaction.create({
      data: {
        userId: input.userId,
        points: input.points,
        pointsBefore: pointsAfter - input.points,
        pointsAfter,
        type: input.type,
        description: input.description,
        orderId: input.orderId,
        createdById: input.createdById,
      },
      include: transactionInclude,
    });
  }

  apply(input: ApplyPointsInput) {
    return this.prisma.$transaction((tx) => this.applyInTx(tx, input));
  }

  listForUser(userId: string) {
    return this.prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: transactionInclude,
    });
  }

  listAll() {
    return this.prisma.pointTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      include: transactionInclude,
    });
  }
}
