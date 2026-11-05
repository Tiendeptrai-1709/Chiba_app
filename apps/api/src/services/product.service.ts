import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto, UpdateProductDto } from "../dto/product.dto";
import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { PrismaService } from "../prisma/prisma.service";

// Thư mục lưu file upload; được phục vụ tĩnh tại /uploads (xem main.ts).
export const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? join(__dirname, "..", "uploads");
const PRODUCT_DIR = join(UPLOAD_ROOT, "products");
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB

// Trả kèm isAvailable (= còn hàng) để giao diện dùng thẳng; không lưu riêng trong DB.
export const toProductView = <T extends { stock: number }>(p: T) => ({ ...p, isAvailable: p.stock > 0 });

// Nhận diện định dạng bằng "magic bytes" thay vì tin vào đuôi file / mimetype client gửi.
function detectImageExt(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }
  return null;
}

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
    return products.map(toProductView);
  }

  async create(dto: CreateProductDto) {
    await this.ensureNameFree(dto.name);
    // Món mới xếp cuối danh mục
    const last = await this.prisma.product.findFirst({
      where: { category: dto.category },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const created = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        category: dto.category,
        stock: dto.stock ?? 0,
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });
    return toProductView(created);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    if (dto.name) await this.ensureNameFree(dto.name, id);
    return toProductView(await this.prisma.product.update({ where: { id }, data: dto }));
  }

  // Đơn cũ lưu sẵn tên + giá món nên xóa món không làm hỏng lịch sử đơn.
  async remove(id: string) {
    const product = await this.ensureExists(id);
    await this.prisma.product.delete({ where: { id } });
    await this.removeFile(product.imageUrl);
  }

  // Nhân viên nhập số lượng còn bán được (đặt lại tuyệt đối, không cộng dồn)
  async setStock(id: string, stock: number) {
    await this.ensureExists(id);
    return toProductView(await this.prisma.product.update({ where: { id }, data: { stock } }));
  }

  async setImage(id: string, file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestException("Vui lòng chọn ảnh");
    if (file.size > MAX_IMAGE_BYTES) throw new BadRequestException("Ảnh tối đa 3MB");
    const ext = detectImageExt(file.buffer);
    if (!ext) throw new BadRequestException("Chỉ nhận ảnh JPG, PNG hoặc WEBP");

    const product = await this.ensureExists(id);
    await mkdir(PRODUCT_DIR, { recursive: true });
    // Tên file do server tự đặt — không dùng tên gốc của người upload.
    const filename = `${id}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    await writeFile(join(PRODUCT_DIR, filename), file.buffer);

    const updated = await this.prisma.product.update({
      where: { id },
      data: { imageUrl: `/uploads/products/${filename}` },
    });
    await this.removeFile(product.imageUrl);
    return toProductView(updated);
  }

  async removeImage(id: string) {
    const product = await this.ensureExists(id);
    const updated = await this.prisma.product.update({ where: { id }, data: { imageUrl: null } });
    await this.removeFile(product.imageUrl);
    return toProductView(updated);
  }

  private async ensureExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Không tìm thấy món");
    return product;
  }

  private async ensureNameFree(name: string, exceptId?: string) {
    const clash = await this.prisma.product.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    if (clash) throw new ConflictException("Đã có món trùng tên trong menu");
  }

  private async removeFile(imageUrl: string | null) {
    const prefix = "/uploads/products/";
    if (!imageUrl?.startsWith(prefix)) return;
    const name = imageUrl.slice(prefix.length);
    if (!/^[\w.-]+$/.test(name)) return; // chặn đường dẫn lạ
    await unlink(join(PRODUCT_DIR, name)).catch(() => {});
  }
}
