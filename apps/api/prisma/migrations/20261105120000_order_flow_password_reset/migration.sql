-- Trạng thái đơn chi tiết hơn: CONFIRMED đổi tên thành PREPARING (đơn cũ giữ nguyên ý nghĩa "đang pha chế"),
-- thêm READY (chờ khách lấy) và DELIVERING (đang giao).
ALTER TYPE "OrderStatus" RENAME VALUE 'CONFIRMED' TO 'PREPARING';
ALTER TYPE "OrderStatus" ADD VALUE 'READY' AFTER 'PREPARING';
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERING' AFTER 'READY';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "cancelledBy" TEXT,
ADD COLUMN "completedAt" TIMESTAMP(3);

-- Quên mật khẩu
ALTER TABLE "users" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN "resetPasswordTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordTokenHash_key" ON "users"("resetPasswordTokenHash");
