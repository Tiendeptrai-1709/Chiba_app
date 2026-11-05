import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";

const groupSelect = {
  id: true,
  name: true,
  sortOrder: true,
  _count: { select: { products: true } },
} satisfies Prisma.MenuGroupSelect;

type GroupRow = Prisma.MenuGroupGetPayload<{ select: typeof groupSelect }>;

const toView = ({ _count, ...g }: GroupRow) => ({ ...g, productCount: _count.products });

// Danh mục món do Admin tự đặt: Cà phê, Trà sữa, Bánh...
@Injectable()
export class MenuGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const groups = await this.prisma.menuGroup.findMany({
      select: groupSelect,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return groups.map(toView);
  }

  async create(name: string) {
    await this.ensureNameFree(name);
    const last = await this.prisma.menuGroup.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
    return toView(
      await this.prisma.menuGroup.create({
        data: { name, sortOrder: (last?.sortOrder ?? 0) + 1 },
        select: groupSelect,
      }),
    );
  }

  async rename(id: string, name: string) {
    await this.ensureExists(id);
    await this.ensureNameFree(name, id);
    return toView(await this.prisma.menuGroup.update({ where: { id }, data: { name }, select: groupSelect }));
  }

  // Món trong danh mục bị xóa chuyển về "Chưa phân danh mục" (onDelete: SetNull)
  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.menuGroup.delete({ where: { id } });
  }

  // Sắp xếp lại theo đúng thứ tự id gửi lên (phải gửi đủ mọi danh mục)
  async reorder(ids: string[]) {
    const existing = await this.prisma.menuGroup.findMany({ select: { id: true } });
    const unique = new Set(ids);
    if (unique.size !== ids.length || ids.length !== existing.length || existing.some((g) => !unique.has(g.id))) {
      throw new BadRequestException("Danh sách danh mục đã thay đổi, vui lòng tải lại trang");
    }
    await this.prisma.$transaction(
      ids.map((id, index) => this.prisma.menuGroup.update({ where: { id }, data: { sortOrder: index + 1 } })),
    );
    return this.findAll();
  }

  private async ensureExists(id: string) {
    const group = await this.prisma.menuGroup.findUnique({ where: { id }, select: { id: true } });
    if (!group) throw new NotFoundException("Không tìm thấy danh mục");
  }

  private async ensureNameFree(name: string, exceptId?: string) {
    const clash = await this.prisma.menuGroup.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    if (clash) throw new ConflictException("Đã có danh mục trùng tên");
  }
}
