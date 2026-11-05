-- Phiên đăng nhập theo từng thiết bị (thay cho cột users.hashedRefreshToken chỉ giữ được 1 phiên)
ALTER TABLE "users" DROP COLUMN "hashedRefreshToken";

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_invites" (
    "email" TEXT NOT NULL,
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_invites_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "storeId" TEXT,
ADD COLUMN "storeName" TEXT;

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "orders_storeId_createdAt_idx" ON "orders"("storeId", "createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed 9 chi nhánh (trước đây ghi cứng ở frontend: apps/web/src/app/stores/page.tsx)
INSERT INTO "stores" ("id", "name", "address", "phone", "sortOrder", "updatedAt") VALUES
  ('s1', 'Chiba Biên Hùng',       'Số 241 đường 30/4, p. Trung Dũng Biên Hoà - Đồng Nai',                       '0251.3822.421', 1, CURRENT_TIMESTAMP),
  ('s2', 'Chiba Ngô Quyền',       'Số 328 đường 30/4, p. Trung Dũng Biên Hoà - Đồng Nai',                       '0251.3822.422', 2, CURRENT_TIMESTAMP),
  ('s3', 'Chiba Quảng Trường',    'Số 384 đường Phạm Văn Thuận, p.Trung Dũng, Biên Hoà - Đồng Nai',             '0251.3822.423', 3, CURRENT_TIMESTAMP),
  ('s4', 'Chiba Hố Nai',          'Số 63 đường Nguyễn Ái Quốc, p.Tân Biên Biên Hoà - Đồng Nai',                 '0251.3822.424', 4, CURRENT_TIMESTAMP),
  ('s5', 'Chiba Trảng Bom',       'Số 2469 Quốc Lộ 1A, Trảng Bom - Đồng Nai',                                   '0251.3822.425', 5, CURRENT_TIMESTAMP),
  ('s6', 'Chiba Long Thành',      'Số 251 - 253 Lê Duẩn, tổ 32, khu Cầu Xéo Long Thành - Đồng Nai',             '0251.3822.426', 6, CURRENT_TIMESTAMP),
  ('s7', 'Chiba Trảng Dài',       'Số 169 Nguyễn Ái Quốc, KP1 Biên Hòa - Đồng Nai',                             '0251.3822.427', 7, CURRENT_TIMESTAMP),
  ('s8', 'Chiba Long Khánh',      'Số 428C đường Hồ Thị Hương, p. Xuân An Long Khánh - Đồng Nai',               '0251.3822.428', 8, CURRENT_TIMESTAMP),
  ('s9', 'Chiba Thích Quảng Đức', 'Số 254 đường Thích Quảng Đức, p. Chánh Nghĩa, Thủ Dầu Một - Bình Dương',     '0251.3822.429', 9, CURRENT_TIMESTAMP);
