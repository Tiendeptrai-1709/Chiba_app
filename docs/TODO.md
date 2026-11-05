# Ghi chú việc cần làm — Chiba webapp

Danh sách phần đã làm và phần còn thiếu, để khi làm tới thì biết sửa ở đâu.

---

## ✅ Đã làm

**Mọi tính năng frontend đang có đều chạy bằng backend thật** — không còn dữ liệu giả lưu trong trình duyệt
(trừ giỏ hàng và chi nhánh đang chọn, vốn là lựa chọn riêng của từng máy).

| Tính năng | Backend (`apps/api`) | Frontend (`apps/web/src`) |
|---|---|---|
| Đăng nhập nhiều thiết bị | Bảng `sessions` — mỗi thiết bị một phiên, đăng xuất / khóa tài khoản có hiệu lực ngay | `lib/api/client.ts` (tự gia hạn token) |
| Giới hạn đăng nhập sai, header bảo mật | `@nestjs/throttler` (`modules/throttle.config.ts`), `helmet` (`main.ts`) | — |
| Chi nhánh cửa hàng | Bảng `stores`, `GET /stores`; đơn hàng lưu `storeId` + `storeName` | `app/stores/page.tsx`, `lib/selectedStore.ts` |
| Mời nhân viên | Bảng `staff_invites`, `GET/POST/DELETE /staff-invites` (ADMIN); đăng ký bằng email được mời → STAFF | Tab "Hệ thống" của Admin |
| Menu, ảnh món, tạm hết | `products`, `GET /products`, `PATCH /products/:id/availability`, `POST/DELETE /products/:id/image` | `components/dashboard/MenuManager.tsx`, `components/products/*` |
| Độ ngọt, đá, thanh toán | `orders.items` (JSON), `orders.paymentMethod` | `useProductPicker.tsx`, `PaymentMethodSection.tsx` |
| Đơn hàng & điểm | `POST /orders`, `PATCH /orders/:id/status`, `point_transactions`, `/points/*` | `BillingSummary.tsx`, `OrderFulfillment.tsx`, `QrScanPanel.tsx` |
| Trạng thái đơn chi tiết | `PENDING → PREPARING → READY (tại quán) / DELIVERING (giao) → COMPLETED`, `GET /orders/:id`, khách tự hủy `POST /orders/:id/cancel` | `app/orders/*` (Đơn của tôi, chi tiết đơn tự cập nhật) |
| Admin thêm / sửa / xóa món | `POST/PATCH/DELETE /products` | `MenuManager.tsx`, `ProductFormModal.tsx` |
| Quên mật khẩu | `POST /auth/forgot-password`, `POST /auth/reset-password`, `services/mail.service.ts` (SMTP) | `app/forgot-password`, `app/reset-password` |
| PWA (cài như app) | — | `app/manifest.ts`, `public/sw.js`, `public/icons/*` |
| Health check | `GET /health` (kiểm tra cả database) | — |
| Test tự động | `apps/api/test/e2e.test.mjs` — 29 bài test | — |
| CI | Lint + build + migrate + e2e test với PostgreSQL (`.github/workflows/backend-ci.yml`) | Lint + build (`frontend-ci.yml`) |

### Chạy test backend

```bash
cd apps/api
npm run start:local   # terminal 1: build rồi bật API (ổn định hơn "npm run dev" trên Windows)
npm test              # terminal 2: chạy test (tự tạo và tự xóa dữ liệu test)
```

> `npm run dev` (chế độ watch của Nest) hay bị crash trên Windows khi nhiều file đổi cùng lúc và có thể để lại
> một tiến trình API chạy **code cũ** chiếm cổng 3001. Gặp lỗi lạ sau khi sửa backend: tắt hết rồi chạy lại.

### Từ nhánh `developer` (fuu) — đã chuyển / chưa chuyển

Đã chuyển sang `main`: trạng thái đơn chi tiết, chi tiết & lịch sử đơn, khách tự hủy, admin thêm/sửa/xóa món,
quên mật khẩu qua email.

Chưa chuyển (vẫn nằm ở nhánh `developer` trên GitHub):
- **App mobile Expo** (`apps/mobile`) + gói `packages/api-client` — muốn dùng phải sửa cho khớp API của `main`.
- **Giỏ hàng lưu trên server** (bảng `carts`) — `main` đang lưu giỏ trong trình duyệt.
- **Upload ảnh lên Cloudinary** — `main` lưu ảnh trên ổ đĩa server.

---

## Còn lại — cần làm trước khi mở cho khách thật

1. **Đưa lên Internet**: chọn hosting cho web, API và PostgreSQL (có sao lưu tự động), tên miền + HTTPS.
   Khi deploy: đặt biến môi trường theo `apps/api/.env.example`, chạy `npx prisma migrate deploy`,
   đặt `CORS_ORIGIN` và `TRUST_PROXY` cho đúng.
2. **Lưu ảnh món**: hiện lưu ổ đĩa (`apps/api/uploads/`). Khi deploy dùng ổ đĩa lưu lâu dài hoặc chuyển sang
   Cloudflare R2 / S3 / Cloudinary — sửa trong `apps/api/src/services/product.service.ts`.
3. **Cấu hình gửi email** (`SMTP_*` trong `apps/api/.env`, mẫu ở `.env.example`) để quên mật khẩu gửi email thật.
   Chưa cấu hình thì link đặt lại mật khẩu chỉ in ra log của API. Đặt `FRONTEND_URL` đúng địa chỉ web.
   **Xác minh email khi đăng ký** vẫn chưa có: hiện **ai đăng ký trước bằng email được mời đều thành nhân viên**.
4. **Tài khoản nhận chuyển khoản**: điền `apps/web/.env.local` (mẫu `apps/web/.env.example`) để bật VietQR.

## Còn lại — nên làm sau

- **Refresh token trong cookie httpOnly** thay vì localStorage (an toàn hơn trước tấn công XSS).
- **Trạng thái "đã nhận tiền"** cho đơn chuyển khoản (`paymentStatus`) + nút cho nhân viên; tự động đối soát qua
  webhook ngân hàng (SePay, Casso, PayOS).
- **Thông báo đơn mới / đổi trạng thái tức thì** (WebSocket hoặc push notification) thay cho tải lại 10–15 giây.
- **Link PWA cố định**: link Cloudflare Tunnel tạm đổi mỗi lần chạy lại → phải cài lại app trên điện thoại.
  Dùng tunnel có tên (tài khoản Cloudflare + tên miền) hoặc deploy để có địa chỉ cố định.
- **Báo cáo doanh thu theo ngày, món bán chạy** (theo giờ Việt Nam) tính ở backend; phân trang danh sách đơn.
- **"Tạm hết" theo từng chi nhánh** (hiện báo hết là hết ở mọi chi nhánh).
- **Theo dõi lỗi** (Sentry) và log tập trung.
- Gom quy tắc dùng chung (điểm, phí ship) vào một chỗ cho cả web và API.
- Dọn repo: bỏ `apps/api/src/generated/prisma` và `tsconfig.tsbuildinfo` khỏi git, xóa `prisma/dev.db`.
- Camera quét QR: chưa thử trên điện thoại thật (chỉ chạy trên HTTPS hoặc localhost).

---

## Tài khoản test (chỉ dùng ở máy local)

Mật khẩu chung: `test123456`

| Email | Vai trò | Ghi chú |
|---|---|---|
| `test_customer@chiba.com` | CUSTOMER | Mã KH `Z70040133`, có vài đơn test |
| `test_staff@chiba.com` | STAFF | |
| `test_admin@chiba.com` | ADMIN | |

Không dùng các tài khoản/mật khẩu này trên môi trường thật.
