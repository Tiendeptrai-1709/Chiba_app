-- Danh mục món do Admin tự đặt (để lọc menu và thống kê)
CREATE TABLE "menu_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "menu_groups_name_key" ON "menu_groups"("name");

ALTER TABLE "products" ADD COLUMN "groupId" TEXT;

CREATE INDEX "products_groupId_idx" ON "products"("groupId");

ALTER TABLE "products" ADD CONSTRAINT "products_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "menu_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Danh mục mẫu (Admin đổi tên / xóa / thêm được trong tab "Món & kho")
INSERT INTO "menu_groups" ("id", "name", "sortOrder", "updatedAt") VALUES
  ('g_cafe',    'Cà phê',       1, CURRENT_TIMESTAMP),
  ('g_trasua',  'Trà sữa',      2, CURRENT_TIMESTAMP),
  ('g_traicay', 'Trà trái cây', 3, CURRENT_TIMESTAMP),
  ('g_daxay',   'Đá xay',       4, CURRENT_TIMESTAMP),
  ('g_banh',    'Bánh',         5, CURRENT_TIMESTAMP),
  ('g_topping', 'Topping',      6, CURRENT_TIMESTAMP);

-- Gắn danh mục cho các món mẫu (nếu còn)
UPDATE "products" SET "groupId" = 'g_cafe'    WHERE "id" IN ('p4', 'p5');
UPDATE "products" SET "groupId" = 'g_trasua'  WHERE "id" IN ('p7', 'p8', 'p9');
UPDATE "products" SET "groupId" = 'g_traicay' WHERE "id" IN ('p1', 'p2', 'p3');
UPDATE "products" SET "groupId" = 'g_daxay'   WHERE "id" IN ('p6', 'p10');
UPDATE "products" SET "groupId" = 'g_banh'    WHERE "category" = 'BANH';
UPDATE "products" SET "groupId" = 'g_topping' WHERE "category" = 'TOPPING';
