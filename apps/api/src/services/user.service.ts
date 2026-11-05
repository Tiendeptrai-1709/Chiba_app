import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { hash } from "bcryptjs";
import { randomInt } from "crypto";
import { Prisma, Role } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";

// Các trường được phép trả ra ngoài — KHÔNG bao giờ có password.
export const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  address: true,
  customerCode: true,
  zenPoints: true,
  role: true,
  isSuspended: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  role?: Role;
}

const BCRYPT_ROUNDS = 10;
const CUSTOMER_CODE_ATTEMPTS = 5;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(input: CreateUserInput): Promise<PublicUser> {
    const existed = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existed) {
      throw new ConflictException("Email đã được đăng ký trên hệ thống");
    }

    const password = await hash(input.password, BCRYPT_ROUNDS);

    // customerCode do server sinh, thử lại nếu (hiếm khi) trùng.
    for (let attempt = 0; attempt < CUSTOMER_CODE_ATTEMPTS; attempt++) {
      try {
        return await this.prisma.user.create({
          data: {
            email: input.email,
            password,
            fullName: input.fullName,
            phone: input.phone ?? "",
            address: input.address ?? "",
            customerCode: this.generateCustomerCode(),
            role: input.role ?? Role.CUSTOMER,
          },
          select: publicUserSelect,
        });
      } catch (error) {
        const target = this.uniqueViolationTarget(error);
        if (target === null) throw error;
        if (target.includes("email")) {
          throw new ConflictException("Email đã được đăng ký trên hệ thống");
        }
        // Trùng customerCode → sinh mã khác và thử lại.
      }
    }
    throw new InternalServerErrorException("Không thể tạo mã khách hàng, vui lòng thử lại");
  }

  findAllUsers(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  findPublicById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  }

  findPublicByCode(customerCode: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { customerCode: customerCode.trim().toUpperCase() },
      select: publicUserSelect,
    });
  }

  // OWNER đổi vai trò khách / nhân viên / admin. Không đổi được OWNER và không tự đổi mình.
  async changeRole(actorId: string, targetId: string, role: Role): Promise<PublicUser> {
    if (role === Role.OWNER) throw new ForbiddenException("Không thể phong OWNER qua ứng dụng");
    if (actorId === targetId) throw new BadRequestException("Không thể tự đổi vai trò của chính mình");
    const target = await this.prisma.user.findUnique({ where: { id: targetId }, select: { role: true } });
    if (!target) throw new NotFoundException("Không tìm thấy người dùng");
    if (target.role === Role.OWNER) throw new ForbiddenException("Không thể đổi vai trò của OWNER");
    return this.prisma.user.update({ where: { id: targetId }, data: { role }, select: publicUserSelect });
  }

  updateProfile(id: string, data: { fullName?: string; phone?: string; address?: string }) {
    return this.prisma.user.update({ where: { id }, data, select: publicUserSelect });
  }

  // Tạm ngưng: giữ dữ liệu, đăng xuất khỏi mọi thiết bị.
  async suspend(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id }, data: { isSuspended: true } }),
      this.prisma.session.deleteMany({ where: { userId: id } }),
    ]);
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // Chỉ dùng nội bộ cho đăng nhập — có kèm password hash.
  findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  private generateCustomerCode(): string {
    return "Z" + randomInt(0, 100_000_000).toString().padStart(8, "0");
  }

  // Trả về danh sách cột bị trùng nếu là lỗi unique (P2002), ngược lại null.
  private uniqueViolationTarget(error: unknown): string | null {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const meta = error.meta as Record<string, unknown> | undefined;
      return JSON.stringify(meta ?? {});
    }
    return null;
  }
}
