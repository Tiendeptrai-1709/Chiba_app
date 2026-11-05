-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('MON_NUOC', 'TOPPING', 'BANH');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'STORE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('EARNED_ORDER', 'EARNED_STORE', 'REDEEMED_APP', 'REDEEMED_STORE', 'REFUND', 'ADMIN_ADJUST');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL DEFAULT '',
    "orderType" "OrderType" NOT NULL,
    "address" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "shippingFee" INTEGER NOT NULL,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "pointsBefore" INTEGER NOT NULL,
    "pointsAfter" INTEGER NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "orderId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_category_sortOrder_idx" ON "products"("category", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_userId_createdAt_idx" ON "orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "point_transactions_userId_createdAt_idx" ON "point_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "point_transactions_createdAt_idx" ON "point_transactions"("createdAt");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed menu ban đầu (trước đây là MOCK_PRODUCTS ở frontend)
INSERT INTO "products" ("id", "name", "price", "category", "sortOrder", "updatedAt") VALUES
  ('p1',  'Trà Thanh Đào Highlands',        49000, 'MON_NUOC', 1,  CURRENT_TIMESTAMP),
  ('p2',  'Trà Thạch Sen Bùi Thơm',         49000, 'MON_NUOC', 2,  CURRENT_TIMESTAMP),
  ('p3',  'Trà Thạch Vải Dai Ngọt',         49000, 'MON_NUOC', 3,  CURRENT_TIMESTAMP),
  ('p4',  'Phin Sữa Đá Đậm Đà',             35000, 'MON_NUOC', 4,  CURRENT_TIMESTAMP),
  ('p5',  'Phin Đen Đá Nguyên Bản',         29000, 'MON_NUOC', 5,  CURRENT_TIMESTAMP),
  ('p6',  'Freeze Trà Xanh Thạch Vy',       55000, 'MON_NUOC', 6,  CURRENT_TIMESTAMP),
  ('p7',  'Trà Sữa Thốt Nốt ZEN',           54000, 'MON_NUOC', 7,  CURRENT_TIMESTAMP),
  ('p8',  'Trà Sữa Trân Châu Hoàng Kim',    48000, 'MON_NUOC', 8,  CURRENT_TIMESTAMP),
  ('p9',  'Trà Xanh Đậu Đỏ Phố Cổ',         49000, 'MON_NUOC', 9,  CURRENT_TIMESTAMP),
  ('p10', 'Freeze Sô-cô-la Bông Kem',       55000, 'MON_NUOC', 10, CURRENT_TIMESTAMP),
  ('t1',  'Thạch Đào Giòn Sần Sật',         10000, 'TOPPING',  1,  CURRENT_TIMESTAMP),
  ('t2',  'Thạch Sen Thơm Bùi',             10000, 'TOPPING',  2,  CURRENT_TIMESTAMP),
  ('t3',  'Trân Châu Hoàng Kim',            10000, 'TOPPING',  3,  CURRENT_TIMESTAMP),
  ('t4',  'Kem Phô Mai Macchiato Béo',      15000, 'TOPPING',  4,  CURRENT_TIMESTAMP),
  ('b1',  'Bánh Mì Que Pate Xá Xíu',        29000, 'BANH',     1,  CURRENT_TIMESTAMP),
  ('b2',  'Bánh Mì Que Gà Phô Mai',         29000, 'BANH',     2,  CURRENT_TIMESTAMP),
  ('b3',  'Bánh Chuối Nướng Truyền Thống',  35000, 'BANH',     3,  CURRENT_TIMESTAMP),
  ('b4',  'Bánh Tiramisu Highlands Mềm',    39000, 'BANH',     4,  CURRENT_TIMESTAMP),
  ('b5',  'Bánh Caramel Phô Mai Ngọt Ngào', 39000, 'BANH',     5,  CURRENT_TIMESTAMP);
