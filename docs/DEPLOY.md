# Hướng dẫn đưa Chiba lên Internet (Railway)

Sau khi làm xong, app chạy 24/7 ở một địa chỉ cố định dạng `https://chiba-xxxx.up.railway.app`
(gắn tên miền riêng sau), không cần máy tính của bạn bật.

```
Khách / nhân viên ──HTTPS──► Web (Next.js) ──mạng nội bộ──► API (NestJS) ──► PostgreSQL
                                                              └──► Ổ lưu ảnh (Volume /data)
```

Chỉ **Web** có địa chỉ công khai. API và database nằm trong mạng nội bộ của Railway, khách không truy cập trực tiếp.

> Railway tính tiền theo mức dùng. Xem bảng giá hiện tại ở railway.com/pricing trước khi đăng ký.
> Các tên nút/menu bên dưới có thể hơi khác nếu Railway đổi giao diện.

---

## Chuẩn bị (làm trên máy, 1 lần)

1. **Tạo 2 khóa bí mật JWT** (mỗi lệnh ra một chuỗi dài, lưu lại để dán vào bước 4):
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
2. **Mật khẩu ứng dụng Gmail** (để gửi email quên mật khẩu):
   - Dùng một tài khoản Gmail của quán → bật **Xác minh 2 bước**.
   - Vào myaccount.google.com → tìm **"Mật khẩu ứng dụng" / "App passwords"** → tạo mới → lưu chuỗi 16 ký tự.
3. **Sentry** (theo dõi lỗi, có gói miễn phí): đăng ký sentry.io → tạo 2 project:
   - Loại **NestJS** (cho API) → lấy **DSN**.
   - Loại **Next.js** (cho web) → lấy **DSN**.
4. **Thông tin chuyển khoản**: mã ngân hàng (VCB, TCB, MB…), số tài khoản, tên chủ tài khoản (không dấu, viết hoa).

---

## Bước 1 — Tạo project Railway

1. Đăng ký railway.com bằng tài khoản GitHub `Tiendeptrai-1709`.
2. **New Project → Deploy from GitHub repo** → cho Railway quyền đọc repo `Chiba_app` (repo private vẫn được).
3. Railway sẽ tạo 1 service từ repo. Đổi tên service này thành **`api`**.

## Bước 2 — Thêm database

1. Trong project: **+ New → Database → PostgreSQL**.
2. Mở service Postgres → tab **Backups** → bật sao lưu định kỳ (nếu gói của bạn có). Nếu không có, xem mục
   *Sao lưu thủ công* ở cuối.

## Bước 3 — Service `api`

1. **Settings → Config-as-code / Railway Config File** → điền `apps/api/railway.json`
   (file này đã có sẵn lệnh build, lệnh chạy, health check `/health`, tự chạy migration khi khởi động).
2. **Settings → Volumes → + Add Volume** → Mount path: **`/data`** (nơi lưu ảnh món, không mất khi deploy lại).
3. **Không** bấm "Generate Domain" cho `api` (để API chỉ nằm trong mạng nội bộ).
4. **Variables** → thêm:

   | Biến | Giá trị |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (chọn tham chiếu tới service Postgres) |
   | `JWT_ACCESS_SECRET` | khóa thứ nhất ở phần Chuẩn bị |
   | `JWT_REFRESH_SECRET` | khóa thứ hai |
   | `UPLOAD_DIR` | `/data/uploads` |
   | `FRONTEND_URL` | `https://<địa chỉ web ở Bước 4>` (điền sau khi có) |
   | `CORS_ORIGIN` | giống `FRONTEND_URL` |
   | `TRUST_PROXY` | `2` (Railway + web đứng trước API — để giới hạn đăng nhập sai tính đúng theo IP khách) |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_SECURE` | `true` |
   | `SMTP_USER` | Gmail của quán |
   | `SMTP_PASS` | mật khẩu ứng dụng 16 ký tự |
   | `MAIL_FROM` | `Chiba <gmail-cua-quan@gmail.com>` |
   | `SENTRY_DSN` | DSN của project NestJS |
   | `SENTRY_ENVIRONMENT` | `production` |

## Bước 4 — Service `web`

1. **+ New → GitHub Repo** → chọn lại `Chiba_app` → đổi tên service thành **`web`**.
2. **Settings → Config-as-code** → `apps/web/railway.json`.
3. **Settings → Networking → Generate Domain** → được địa chỉ dạng `https://web-production-xxxx.up.railway.app`.
   Quay lại service `api` điền địa chỉ này vào `FRONTEND_URL` và `CORS_ORIGIN`.
4. **Variables**:

   | Biến | Giá trị |
   |---|---|
   | `API_INTERNAL_URL` | `http://${{api.RAILWAY_PRIVATE_DOMAIN}}:${{api.PORT}}` |
   | `NEXT_PUBLIC_BANK_ID` | vd. `VCB` |
   | `NEXT_PUBLIC_BANK_ACCOUNT_NO` | số tài khoản |
   | `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | tên chủ TK, không dấu |
   | `NEXT_PUBLIC_SENTRY_DSN` | DSN của project Next.js |
   | `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `production` |

   ⚠️ Biến `API_INTERNAL_URL` và mọi biến `NEXT_PUBLIC_*` được gắn vào lúc **build**. Đổi xong phải
   **Redeploy** service `web`.

   Nếu `api` không có biến `PORT`, đặt `PORT=3001` cho `api` rồi dùng `http://${{api.RAILWAY_PRIVATE_DOMAIN}}:3001`.

## Bước 5 — Kiểm tra

1. Mở địa chỉ web → trang đăng nhập hiện ra.
2. Đăng ký tài khoản của bạn → vào service Postgres → tab **Data** (hoặc kết nối bằng Prisma Studio, xem dưới) →
   bảng `users` → đổi `role` của bạn thành `OWNER`.
3. Đăng nhập lại → dashboard Chủ quán → kiểm tra:
   - **Món & kho**: sửa tên/giá, upload ảnh, nhập số lượng thật, xóa món không bán.
   - **Phân quyền**: thăng cấp nhân viên.
4. Thử "Quên mật khẩu" → email phải về hộp thư.
5. Đặt thử 1 đơn chuyển khoản → mã VietQR phải hiện đúng số tài khoản của quán.
6. Cài PWA trên điện thoại từ địa chỉ mới (xóa app cài từ link tạm cũ).

---

## Cập nhật app sau này

Mỗi lần `git push` lên nhánh `main`, Railway **tự build và deploy lại** service có file thay đổi
(`api` khi sửa `apps/api`, `web` khi sửa `apps/web`). Migration database tự chạy khi `api` khởi động.

Nên đợi GitHub Actions (CI) báo ✅ rồi mới push lên `main` — hoặc làm việc trên nhánh riêng rồi gộp.

## Kết nối database production từ máy (khi cần sửa tay)

Service Postgres → **Connect** → copy **Public Network URL** (chỉ dùng khi cần, có thể tắt sau). Trên máy:

```bash
cd apps/api
DATABASE_URL="<public-url>" npx prisma studio
```

Cẩn thận: đây là **dữ liệu thật**.

## Sao lưu thủ công (nếu gói Railway không có Backups)

```bash
pg_dump "<public-url>" --format=custom --file=chiba-$(date +%Y%m%d).dump
```

Lưu file ra nơi an toàn (Google Drive…). Khôi phục: `pg_restore --clean --dbname "<url>" <file>.dump`.

## Gắn tên miền riêng (khi đã mua, vd. chiba.vn)

Service `web` → **Settings → Networking → Custom Domain** → nhập tên miền → Railway cho 1 bản ghi DNS (CNAME) →
thêm bản ghi đó ở nơi bạn mua tên miền. Sau đó đổi `FRONTEND_URL` / `CORS_ORIGIN` của `api` sang tên miền mới.
