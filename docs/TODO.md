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
| Health check | `GET /health` (kiểm tra cả database) | — |
| Test tự động | `apps/api/test/e2e.test.mjs` — 23 bài test | — |
| CI | Lint + build + migrate + e2e test với PostgreSQL (`.github/workflows/backend-ci.yml`) | Lint + build (`frontend-ci.yml`) |

### Chạy test backend

```bash
cd apps/api
npm run dev      # terminal 1: bật API
npm test         # terminal 2: chạy test (tự tạo và tự xóa dữ liệu test)
```

---

## Còn lại — cần làm trước khi mở cho khách thật

1. **Đưa lên Internet**: chọn hosting cho web, API và PostgreSQL (có sao lưu tự động), tên miền + HTTPS.
   Khi deploy: đặt biến môi trường theo `apps/api/.env.example`, chạy `npx prisma migrate deploy`,
   đặt `CORS_ORIGIN` và `TRUST_PROXY` cho đúng.
2. **Lưu ảnh món**: hiện lưu ổ đĩa (`apps/api/uploads/`). Khi deploy dùng ổ đĩa lưu lâu dài hoặc chuyển sang
   Cloudflare R2 / S3 / Cloudinary — sửa trong `apps/api/src/services/product.service.ts`.
3. **Quên mật khẩu / xác minh email**: cần dịch vụ gửi email (vd. Resend, SendGrid, Amazon SES).
   Lưu ý: hiện **ai đăng ký trước bằng email được mời đều thành nhân viên** — nên thêm xác minh email
   (gửi mã) trước khi dùng thật.
4. **Tài khoản nhận chuyển khoản**: điền `apps/web/.env.local` (mẫu `apps/web/.env.example`) để bật VietQR.

## Còn lại — nên làm sau

- **Refresh token trong cookie httpOnly** thay vì localStorage (an toàn hơn trước tấn công XSS).
- **Trạng thái "đã nhận tiền"** cho đơn chuyển khoản (`paymentStatus`) + nút cho nhân viên; tự động đối soát qua
  webhook ngân hàng (SePay, Casso, PayOS).
- **Admin thêm món mới / sửa tên, giá / ẩn món** (cần cả API `POST/PATCH/DELETE /products` và form).
- **Trang "Đơn của tôi"** cho khách (API `GET /orders/me` đã có).
- **Thông báo đơn mới tức thì** (WebSocket) thay cho tải lại 15 giây.
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
