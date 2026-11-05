-- Trạng thái thanh toán: cửa hàng xác nhận đã nhận tiền (quan trọng với đơn chuyển khoản)
ALTER TABLE "orders" ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "paidConfirmedBy" TEXT;

-- Đơn đã hoàn thành trước đây coi như đã thanh toán
UPDATE "orders" SET "paidAt" = COALESCE("completedAt", "updatedAt") WHERE "status" = 'COMPLETED';
