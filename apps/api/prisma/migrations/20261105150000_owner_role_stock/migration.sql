-- Vai trò chủ quán (chỉ đặt trực tiếp trong database)
ALTER TYPE "Role" ADD VALUE 'OWNER' BEFORE 'ADMIN';

-- Tồn kho theo số lượng thay cho cờ còn/hết.
-- Món đang "còn hàng" được đặt tạm 100 phần để không bị khóa ngay sau khi nâng cấp;
-- nhân viên cần cập nhật lại số thật trong tab Kho món.
ALTER TABLE "products" ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0;
UPDATE "products" SET "stock" = CASE WHEN "isAvailable" THEN 100 ELSE 0 END;
ALTER TABLE "products" DROP COLUMN "isAvailable";
ALTER TABLE "products" ADD CONSTRAINT "products_stock_non_negative" CHECK ("stock" >= 0);
