# Ghi chú việc cần làm — Chiba webapp

Danh sách phần còn thiếu / đang làm tạm, để khi làm tới thì biết sửa ở đâu.

---

## ✅ Đã làm (05/11/2026)

| Tính năng | Backend (`apps/api`) | Frontend (`apps/web/src`) |
|---|---|---|
| Menu từ database, ảnh món | `products` table, `services/product.service.ts`, `GET /products` | `lib/stores/useProductStore.ts`, `components/products/*` |
| Báo **Tạm hết** món | `PATCH /products/:id/availability` (STAFF/ADMIN) | Tab "Kho món" / "Món & ảnh": `components/dashboard/MenuManager.tsx` |
| Thêm ảnh cho món (Admin) | `POST/DELETE /products/:id/image`, file lưu ở `apps/api/uploads/products/` | `MenuManager.tsx` (nút Thêm/Đổi/Xóa ảnh) |
| Độ ngọt & đá | Lưu trong `orders.items` (JSON) | `components/products/useProductPicker.tsx` |
| Phương thức thanh toán | `orders.paymentMethod` (CASH / BANK_TRANSFER) | `components/cart/PaymentMethodSection.tsx`, `OrderSuccessModal.tsx` |
| Đặt hàng thật | `POST /orders` — server tự tính giá, ship, giảm điểm; chặn món tạm hết | `components/cart/BillingSummary.tsx` |
| Nhân viên xử lý đơn | `GET /orders`, `PATCH /orders/:id/status` — cộng điểm khi Hoàn thành, hoàn điểm khi Hủy | `components/dashboard/OrderFulfillment.tsx` (tự tải lại mỗi 15 giây) |
| Quét QR tích điểm | `GET /users/by-code/:code`, `POST /points/store-earn`, `POST /points/adjust` | Tab "Quét QR": `components/dashboard/QrScanPanel.tsx` |
| Lịch sử điểm thật | `point_transactions` table, `GET /points/me`, `GET /points` (ADMIN) | Hồ sơ khách, tab "Lịch sử điểm" của Admin |

---

## 1. Thanh toán chuyển khoản

**Hiện trạng**
- Khách chọn "Chuyển khoản" → sau khi đặt hiện mã **VietQR** (điền sẵn số tiền + nội dung = mã đơn).
- **Cần cấu hình tài khoản nhận tiền** trong `apps/web/.env.local` (mẫu ở `apps/web/.env.example`):
  `NEXT_PUBLIC_BANK_ID`, `NEXT_PUBLIC_BANK_ACCOUNT_NO`, `NEXT_PUBLIC_BANK_ACCOUNT_NAME`. Chưa cấu hình thì app hiện lời nhắc "cửa hàng sẽ liên hệ".
- Ảnh QR do dịch vụ công khai `img.vietqr.io` tạo (`apps/web/src/lib/payment.ts`).
- Nhân viên **tự kiểm tra** đã nhận tiền (theo nội dung = mã đơn) rồi mới bấm Xác nhận.

**Cần làm**
- Thêm trạng thái thanh toán (`paymentStatus`: UNPAID/PAID) vào bảng `orders` + nút "Đã nhận tiền" cho nhân viên.
- (Tùy chọn) Tự động xác nhận chuyển khoản qua webhook của dịch vụ đối soát ngân hàng (vd. Casso, SePay, PayOS) → endpoint mới ở backend.
- (Tùy chọn) Ví điện tử MoMo/ZaloPay/VNPay: cần đăng ký tài khoản merchant với từng bên.

## 2. Quét QR — còn lại

- Camera chỉ mở được trên **HTTPS** (hoặc `localhost`). Test trên điện thoại phải dùng link HTTPS (Cloudflare Tunnel).
- Chưa test với camera thật trên điện thoại — đã test phần nhập mã thủ công + cộng điểm.
- Admin hiện không có tab "Quét QR" (chỉ nhân viên). Muốn có thì thêm `SCAN` vào `ADMIN_TABS` trong `components/dashboard/HeaderTabRole.tsx`.

## 3. Ảnh sản phẩm — còn lại

- Ảnh đang lưu trên ổ đĩa server (`apps/api/uploads/`, đã thêm vào `.gitignore`). **Khi deploy** phải dùng ổ đĩa lưu lâu dài, hoặc chuyển sang dịch vụ lưu ảnh (Cloudinary, S3, Cloudflare R2) — sửa trong `apps/api/src/services/product.service.ts`.
- Chưa có chức năng **thêm món mới / sửa tên, giá / xóa món** cho Admin (hiện chỉ đổi ảnh và còn/hết). Cần thêm `POST/PATCH/DELETE /products` và form trong `MenuManager.tsx`.
- Ảnh nên vuông (khoảng 600×600), tối đa 3MB, định dạng JPG/PNG/WEBP.

## 4. Việc khác

- **Khách chưa xem được lịch sử đơn / trạng thái đơn** của mình. Backend đã có `GET /orders/me` → cần thêm trang "Đơn của tôi" (có thể dùng ô "Sắp ra mắt" ở trang chủ).
- Danh sách **mời nhân viên** vẫn lưu tạm trong trình duyệt (`lib/mock/localData.ts`). Cách tạo nhân viên thật: Admin gọi `POST /users` với `role: "STAFF"`, hoặc đăng ký rồi đổi `role` trong Prisma Studio.
- Danh sách **cửa hàng** (`app/stores/page.tsx`) vẫn là dữ liệu cứng; đơn hàng chưa gắn với cửa hàng.

---

## Tài khoản test (chỉ dùng ở máy local)

Mật khẩu chung: `test123456`

| Email | Vai trò | Ghi chú |
|---|---|---|
| `test_customer@chiba.com` | CUSTOMER | Mã KH `Z70040133`, có 1 đơn test DH931771 (đã hoàn thành) |
| `test_staff@chiba.com` | STAFF | |
| `test_admin@chiba.com` | ADMIN | |
| `test_ui_flow@chiba.com` | CUSTOMER | Tạo khi test đăng nhập (nếu chưa xóa) |

Không dùng các tài khoản/mật khẩu này trên môi trường thật.
