# Chiba — app điện thoại (Expo)

App cho **mọi vai trò**, dùng chung backend với web (`apps/api`):

- **Khách hàng:** đặt món (độ ngọt, đá, topping), giỏ hàng, chọn cửa hàng, nhận tại quán / giao hàng,
  tiền mặt / chuyển khoản (VietQR), dùng điểm, theo dõi đơn, mã QR tích điểm, tài khoản & lịch sử điểm.
- **Bảng điều khiển** (`app/dashboard.tsx`, tab theo vai trò giống web):
  - Nhân viên: Đơn hàng · Quét QR (camera) · Kho món · Khách đổi quà
  - Admin: thêm Hệ thống (mời nhân viên) · Thống kê · Lịch sử điểm; Món & kho có thêm/sửa/xóa món, ảnh, danh mục
  - Chủ quán: thêm Phân quyền

Expo SDK 58 · expo-router · NativeWind (Tailwind) · zustand.

> `apps/mobile` **không** nằm trong npm workspaces của repo (cài thư viện riêng) để React Native
> không đụng phiên bản React / thư viện của web.
>
> ⚠️ `npx expo install <gói>` có thể tự thêm `apps/mobile` vào `workspaces` ở `package.json` gốc rồi cài ra
> thư mục gốc. Sau khi chạy, kiểm tra `git diff ../../package.json`; nếu bị thêm thì xóa dòng đó, chạy
> `npm install` ở thư mục gốc rồi `npm install` lại trong `apps/mobile`.

Giao diện làm theo bản web (`apps/web`): cùng màu, bo góc, đổ bóng, trang chủ 4 ô và thanh điều hướng
viên thuốc. Sửa giao diện bên nào thì nên sửa cả bên kia cho khớp.

## Chạy thử trên điện thoại (Expo Go)

1. Bật API ở máy tính (thư mục gốc repo): `npm run dev` hoặc `npm run start:local --workspace=api`.
2. Cài thư viện cho app (lần đầu):

   ```bash
   cd apps/mobile
   npm install
   ```

3. Chạy:

   ```bash
   npx expo start
   ```

4. Điện thoại cài **Expo Go** (CH Play / App Store), **chung Wi-Fi** với máy tính, quét mã QR hiện trong terminal.

App tự gọi API ở `http://<IP máy tính>:3001`. Nếu điện thoại khác mạng, đặt `EXPO_PUBLIC_API_URL`
(xem `.env.example`) — ví dụ link Railway, hoặc link tạm của web `https://xxx.trycloudflare.com/api`.

## Cấu hình (`apps/mobile/.env`)

Xem `.env.example`. Biến `EXPO_PUBLIC_*` được đóng vào app lúc chạy / build — đổi xong phải chạy lại `npx expo start`.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `app/(auth)` | Đăng nhập, đăng ký, quên mật khẩu |
| `app/(tabs)` | Đặt món, Đơn của tôi, Mã QR, Tài khoản |
| `app/cart.tsx`, `app/stores.tsx`, `app/order/[id].tsx` | Giỏ hàng, chọn cửa hàng, chi tiết đơn |
| `lib/api.ts` | Gọi API, lưu token trong SecureStore, tự gia hạn token |
| `lib/stores/*` | Trạng thái: đăng nhập, menu, giỏ hàng (lưu trên máy), thông báo |
| `lib/types.ts` | Kiểu dữ liệu & quy tắc tính tiền — giữ khớp với web và backend |

## Kiểm tra

```bash
npx tsc --noEmit
npx expo lint
npx expo export --platform android   # thử đóng gói
```
