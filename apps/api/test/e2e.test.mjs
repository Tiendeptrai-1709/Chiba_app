// Test end-to-end cho API: gọi HTTP thật vào server đang chạy và database thật.
//
// Cách chạy (trong apps/api):
//   1. Bật API:     npm run dev        (hoặc npm run build && npm start)
//   2. Chạy test:   npm test
//
// Biến môi trường: API_URL (mặc định http://localhost:3001), DATABASE_URL (đọc từ .env).
// Test tự tạo user có email "e2e_*@test.local" và tự xóa sau khi chạy.
import "dotenv/config";
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import pg from "pg";

const API = process.env.API_URL ?? "http://localhost:3001";
const RUN = Date.now().toString(36);
const PASSWORD = "e2e-password-123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function call(method, path, { body, token, form, headers = {} } = {}) {
  const h = { ...headers };
  if (token) h.authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    h["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(API + path, { method, headers: h, body: payload });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

const email = (name) => `e2e_${name}_${RUN}@test.local`;

async function createUser(name, role = "CUSTOMER", userAgent = "e2e") {
  const r = await call("POST", "/auth/register", {
    body: { email: email(name), password: PASSWORD, fullName: `E2E ${name}` },
    headers: { "user-agent": userAgent },
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  if (role !== "CUSTOMER") {
    await db.query('UPDATE users SET role = $1 WHERE email = $2', [role, email(name)]);
    return login(name, userAgent);
  }
  return r.body;
}

async function login(name, userAgent = "e2e") {
  const r = await call("POST", "/auth/login", {
    body: { email: email(name), password: PASSWORD },
    headers: { "user-agent": userAgent },
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  return r.body;
}

let customer, staff, admin;

before(async () => {
  const health = await fetch(`${API}/health`).catch(() => null);
  assert.ok(health?.ok, `API chưa chạy tại ${API} — hãy bật server trước (npm run dev)`);
  await db.connect();
  customer = await createUser("customer");
  staff = await createUser("staff", "STAFF");
  admin = await createUser("admin", "ADMIN");
});

after(async () => {
  // Dọn dữ liệu test, trả menu về trạng thái ban đầu
  await db.query(`DELETE FROM orders WHERE "userId" IN (SELECT id FROM users WHERE email LIKE 'e2e\\_%@test.local')`);
  await db.query(`DELETE FROM users WHERE email LIKE 'e2e\\_%@test.local'`);
  await db.query(`DELETE FROM staff_invites WHERE email LIKE 'e2e\\_%@test.local'`);
  await db.query(`UPDATE products SET "isAvailable" = true WHERE id IN ('p7')`);
  await db.query(`DELETE FROM products WHERE name LIKE 'E2E %'`);
  await db.end();
});

describe("Đăng ký & đăng nhập", () => {
  test("không cho tự đăng ký kèm role", async () => {
    const r = await call("POST", "/auth/register", {
      body: { email: email("hacker"), password: PASSWORD, fullName: "X", role: "ADMIN" },
    });
    assert.equal(r.status, 400);
  });

  test("validate đầu vào, báo lỗi tiếng Việt", async () => {
    const r = await call("POST", "/auth/register", { body: { email: "abc", password: "1", fullName: "" } });
    assert.equal(r.status, 400);
    assert.ok(r.body.message.includes("Email không hợp lệ"));
  });

  test("không lộ mật khẩu, email trùng bị từ chối", async () => {
    assert.equal(customer.user.role, "CUSTOMER");
    assert.ok(!("password" in customer.user));
    const dup = await call("POST", "/auth/register", { body: { email: email("customer"), password: PASSWORD, fullName: "Y" } });
    assert.equal(dup.status, 409);
  });

  test("sai mật khẩu → 401", async () => {
    const r = await call("POST", "/auth/login", { body: { email: email("customer"), password: "wrong-pass" } });
    assert.equal(r.status, 401);
  });

  test("refresh token không dùng thay access token được", async () => {
    const r = await call("GET", "/auth/me", { token: customer.refreshToken });
    assert.equal(r.status, 401);
  });
});

describe("Phiên đăng nhập nhiều thiết bị", () => {
  test("đăng nhập thiết bị thứ 2 không làm thiết bị 1 bị đăng xuất", async () => {
    await createUser("multi");
    const phone = await login("multi", "phone");
    const laptop = await login("multi", "laptop");

    const r1 = await call("POST", "/auth/refresh", { token: phone.refreshToken });
    assert.equal(r1.status, 200, "điện thoại vẫn gia hạn được");
    const r2 = await call("POST", "/auth/refresh", { token: laptop.refreshToken });
    assert.equal(r2.status, 200, "máy tính vẫn gia hạn được");

    // Dùng lại refresh token cũ của điện thoại → chỉ thu hồi phiên điện thoại
    const reuse = await call("POST", "/auth/refresh", { token: phone.refreshToken });
    assert.equal(reuse.status, 401);
    const phoneAfter = await call("POST", "/auth/refresh", { token: r1.body.refreshToken });
    assert.equal(phoneAfter.status, 401, "phiên điện thoại đã bị thu hồi");
    const laptopAfter = await call("GET", "/auth/me", { token: r2.body.accessToken });
    assert.equal(laptopAfter.status, 200, "máy tính không bị ảnh hưởng");
  });

  test("đăng xuất chỉ thoát thiết bị hiện tại, access token hết hiệu lực ngay", async () => {
    await createUser("logout");
    const a = await login("logout", "A");
    const b = await login("logout", "B");
    assert.equal((await call("POST", "/auth/logout", { token: a.accessToken })).status, 204);
    assert.equal((await call("GET", "/auth/me", { token: a.accessToken })).status, 401);
    assert.equal((await call("POST", "/auth/refresh", { token: a.refreshToken })).status, 401);
    assert.equal((await call("GET", "/auth/me", { token: b.accessToken })).status, 200);
  });

  test("tạm ngưng tài khoản đăng xuất mọi thiết bị", async () => {
    await createUser("suspend");
    const a = await login("suspend", "A");
    const b = await login("suspend", "B");
    assert.equal((await call("POST", "/users/me/suspend", { token: a.accessToken })).status, 204);
    assert.equal((await call("GET", "/auth/me", { token: b.accessToken })).status, 401);
    const again = await call("POST", "/auth/login", { body: { email: email("suspend"), password: PASSWORD } });
    assert.equal(again.status, 403);
  });

  test("đăng nhập sai quá nhiều lần → 429", async () => {
    const statuses = [];
    for (let i = 0; i < 15; i++) {
      const r = await call("POST", "/auth/login", { body: { email: email("bruteforce"), password: "x" } });
      statuses.push(r.status);
    }
    assert.ok(statuses.includes(429), `mong có 429, nhận: ${statuses.join(",")}`);
  });
});

describe("Phân quyền", () => {
  test("khách không xem được danh sách user / nhật ký điểm", async () => {
    assert.equal((await call("GET", "/users")).status, 401);
    assert.equal((await call("GET", "/users", { token: customer.accessToken })).status, 403);
    assert.equal((await call("GET", "/points", { token: staff.accessToken })).status, 403);
  });

  test("admin xem danh sách user, không lộ mật khẩu", async () => {
    const r = await call("GET", "/users", { token: admin.accessToken });
    assert.equal(r.status, 200);
    assert.ok(r.body.every((u) => !("password" in u)));
  });
});

describe("Chi nhánh & lời mời nhân viên", () => {
  test("danh sách chi nhánh công khai", async () => {
    const r = await call("GET", "/stores");
    assert.equal(r.status, 200);
    assert.ok(r.body.length >= 1 && r.body.every((s) => s.isActive));
  });

  test("email được mời đăng ký sẽ thành nhân viên", async () => {
    assert.equal((await call("POST", "/staff-invites", { token: staff.accessToken, body: { email: email("invited") } })).status, 403);
    const inv = await call("POST", "/staff-invites", { token: admin.accessToken, body: { email: email("invited") } });
    assert.equal(inv.status, 201);
    const dup = await call("POST", "/staff-invites", { token: admin.accessToken, body: { email: email("invited") } });
    assert.equal(dup.status, 409);
    const list = await call("GET", "/staff-invites", { token: admin.accessToken });
    assert.ok(list.body.some((i) => i.email === email("invited")));

    const reg = await createUser("invited");
    assert.equal(reg.user.role, "STAFF");
    const remaining = await call("GET", "/staff-invites", { token: admin.accessToken });
    assert.ok(!remaining.body.some((i) => i.email === email("invited")), "lời mời đã dùng bị xóa");
  });

  test("không mời email đã có tài khoản; thu hồi lời mời", async () => {
    const r = await call("POST", "/staff-invites", { token: admin.accessToken, body: { email: email("customer") } });
    assert.equal(r.status, 409);
    await call("POST", "/staff-invites", { token: admin.accessToken, body: { email: email("revoke") } });
    assert.equal((await call("DELETE", `/staff-invites/${email("revoke")}`, { token: admin.accessToken })).status, 204);
    const reg = await createUser("revoke");
    assert.equal(reg.user.role, "CUSTOMER");
  });
});

describe("Đơn hàng, tạm hết món & điểm", () => {
  const order = {
    items: [
      { productId: "p7", quantity: 2, toppingIds: ["t3"], sugar: 50, ice: "LESS" },
      { productId: "b1", quantity: 1 },
    ],
    orderType: "DELIVERY",
    address: "12 Lê Lợi",
    paymentMethod: "BANK_TRANSFER",
    storeId: "s1",
  };
  let created;

  test("server tự tính tiền, lưu tùy chọn và chi nhánh", async () => {
    const r = await call("POST", "/orders", { token: customer.accessToken, body: order });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    created = r.body;
    assert.equal(created.total, 157000);
    assert.equal(created.pointsEarned, 15);
    assert.equal(created.storeName, "Chiba Biên Hùng");
    assert.equal(created.items[0].sugar, 50);
    assert.equal(created.items[0].ice, "LESS");
    assert.equal(created.items[1].sugar, null);
  });

  test("từ chối chi nhánh không tồn tại, thiếu địa chỉ, bánh kèm topping", async () => {
    const bad = (patch) => call("POST", "/orders", { token: customer.accessToken, body: { ...order, ...patch } });
    assert.equal((await bad({ storeId: "khong-co" })).status, 400);
    assert.equal((await bad({ address: undefined })).status, 400);
    assert.equal((await bad({ items: [{ productId: "b1", quantity: 1, toppingIds: ["t1"] }] })).status, 400);
  });

  test("nhân viên báo hết món → khách không đặt được", async () => {
    assert.equal((await call("PATCH", "/products/p7/availability", { token: customer.accessToken, body: { isAvailable: false } })).status, 403);
    assert.equal((await call("PATCH", "/products/p7/availability", { token: staff.accessToken, body: { isAvailable: false } })).status, 200);
    const r = await call("POST", "/orders", { token: customer.accessToken, body: order });
    assert.equal(r.status, 409);
    await call("PATCH", "/products/p7/availability", { token: staff.accessToken, body: { isAvailable: true } });
  });

  test("đơn giao: Chờ → Pha chế → Đang giao → Hoàn thành, cộng điểm một lần", async () => {
    const path = `/orders/${created.id}/status`;
    const step = (status) => call("PATCH", path, { token: staff.accessToken, body: { status } });
    assert.equal((await step("COMPLETED")).status, 400, "không nhảy cóc");
    assert.equal((await step("PREPARING")).status, 200);
    assert.equal((await step("READY")).status, 400, "đơn giao không có bước Sẵn sàng");
    assert.equal((await step("DELIVERING")).status, 200);
    const done = await step("COMPLETED");
    assert.equal(done.status, 200);
    assert.ok(done.body.completedAt);
    assert.equal((await step("COMPLETED")).status, 400);
    const me = await call("GET", "/auth/me", { token: customer.accessToken });
    assert.equal(me.body.zenPoints, 15);
  });

  test("đơn nhận tại quán: Pha chế → Sẵn sàng → Hoàn thành", async () => {
    const r = await call("POST", "/orders", {
      token: customer.accessToken,
      body: { items: [{ productId: "b2", quantity: 1 }], orderType: "STORE", paymentMethod: "CASH" },
    });
    const step = (status) => call("PATCH", `/orders/${r.body.id}/status`, { token: staff.accessToken, body: { status } });
    assert.equal((await step("PREPARING")).status, 200);
    assert.equal((await step("DELIVERING")).status, 400, "đơn tại quán không có bước Đang giao");
    assert.equal((await step("READY")).status, 200);
    assert.equal((await step("COMPLETED")).status, 200);
    // +2 điểm (29.000đ)
    assert.equal((await call("GET", "/auth/me", { token: customer.accessToken })).body.zenPoints, 17);
    await db.query("UPDATE users SET \"zenPoints\" = 15 WHERE id = $1", [customer.user.id]);
  });

  test("chi tiết đơn: khách chỉ xem đơn của mình, nhân viên xem mọi đơn", async () => {
    assert.equal((await call("GET", `/orders/${created.id}`, { token: customer.accessToken })).status, 200);
    assert.equal((await call("GET", `/orders/${created.id}`, { token: staff.accessToken })).status, 200);
    const other = await createUser("other");
    assert.equal((await call("GET", `/orders/${created.id}`, { token: other.accessToken })).status, 404);
    const mine = await call("GET", "/orders/me", { token: customer.accessToken });
    assert.ok(mine.body.some((o) => o.id === created.id));
  });

  test("khách tự hủy khi còn chờ xác nhận (hoàn điểm), không hủy được khi đã pha chế", async () => {
    const base = { items: [{ productId: "p2", quantity: 1 }], orderType: "STORE", paymentMethod: "CASH" };
    const a = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, pointsToUse: 3 } });
    assert.equal((await call("GET", "/auth/me", { token: customer.accessToken })).body.zenPoints, 12);
    const other = await login("other");
    assert.equal((await call("POST", `/orders/${a.body.id}/cancel`, { token: other.accessToken })).status, 404);
    const c = await call("POST", `/orders/${a.body.id}/cancel`, { token: customer.accessToken });
    assert.equal(c.status, 200);
    assert.equal(c.body.status, "CANCELLED");
    assert.equal(c.body.cancelledBy, "CUSTOMER");
    assert.equal((await call("GET", "/auth/me", { token: customer.accessToken })).body.zenPoints, 15);

    const b = await call("POST", "/orders", { token: customer.accessToken, body: base });
    await call("PATCH", `/orders/${b.body.id}/status`, { token: staff.accessToken, body: { status: "PREPARING" } });
    assert.equal((await call("POST", `/orders/${b.body.id}/cancel`, { token: customer.accessToken })).status, 400);
    await call("PATCH", `/orders/${b.body.id}/status`, { token: staff.accessToken, body: { status: "CANCELLED" } });
  });

  test("dùng điểm giảm giá (tối đa 20%), hủy đơn được hoàn điểm", async () => {
    const base = { items: [{ productId: "p1", quantity: 1 }], orderType: "STORE", paymentMethod: "CASH" };
    assert.equal((await call("POST", "/orders", { token: customer.accessToken, body: { ...base, pointsToUse: 20 } })).status, 400);
    const r = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, pointsToUse: 5 } });
    assert.equal(r.status, 201);
    assert.equal(r.body.total, 46500);
    assert.equal((await call("GET", "/auth/me", { token: customer.accessToken })).body.zenPoints, 10);
    await call("PATCH", `/orders/${r.body.id}/status`, { token: staff.accessToken, body: { status: "CANCELLED" } });
    assert.equal((await call("GET", "/auth/me", { token: customer.accessToken })).body.zenPoints, 15);
  });

  test("quét QR: tra mã, tích điểm tại quầy, đổi quà", async () => {
    const code = customer.user.customerCode;
    assert.equal((await call("GET", `/users/by-code/${code}`, { token: customer.accessToken })).status, 403);
    const found = await call("GET", `/users/by-code/${code.toLowerCase()}`, { token: staff.accessToken });
    assert.equal(found.status, 200);
    assert.equal(found.body.id, customer.user.id);

    const earn = await call("POST", "/points/store-earn", { token: staff.accessToken, body: { customerCode: code, billAmount: 125000 } });
    assert.equal(earn.status, 201);
    assert.equal(earn.body.pointsAfter, 27);

    const redeem = (points, type = "REDEEMED_STORE", token = staff.accessToken) =>
      call("POST", "/points/adjust", { token, body: { userId: customer.user.id, points, type, description: "Ly sứ" } });
    assert.equal((await redeem(-5)).body.pointsAfter, 22);
    assert.equal((await redeem(-500)).status, 400);
    assert.equal((await redeem(3, "ADMIN_ADJUST")).status, 403);
    assert.equal((await redeem(3, "ADMIN_ADJUST", admin.accessToken)).body.pointsAfter, 25);

    const history = await call("GET", "/points/me", { token: customer.accessToken });
    const types = new Set(history.body.map((t) => t.type));
    for (const t of ["EARNED_ORDER", "REDEEMED_APP", "REFUND", "EARNED_STORE", "REDEEMED_STORE", "ADMIN_ADJUST"]) {
      assert.ok(types.has(t), `lịch sử có giao dịch ${t}`);
    }
    assert.equal(history.body[0].pointsAfter, 25, "giao dịch mới nhất đứng đầu");
  });
});

describe("Ảnh sản phẩm", () => {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = (buf) => {
    const f = new FormData();
    f.append("image", new Blob([buf], { type: "image/png" }), "a.png");
    return f;
  };

  test("chỉ admin upload, chặn file giả, ảnh được phục vụ, xóa được", async () => {
    assert.equal((await call("POST", "/products/p1/image", { token: staff.accessToken, form: form(png) })).status, 403);
    assert.equal((await call("POST", "/products/p1/image", { token: admin.accessToken, form: form(Buffer.from("<script>")) })).status, 400);
    const up = await call("POST", "/products/p1/image", { token: admin.accessToken, form: form(png) });
    assert.equal(up.status, 201);
    assert.match(up.body.imageUrl, /^\/uploads\/products\/p1-.*\.png$/);
    assert.equal((await fetch(API + up.body.imageUrl)).status, 200);
    const del = await call("DELETE", "/products/p1/image", { token: admin.accessToken });
    assert.equal(del.body.imageUrl, null);
  });
});

describe("Admin quản lý món", () => {
  test("thêm, sửa, xóa món; nhân viên không được; chặn trùng tên", async () => {
    const body = { name: `E2E Trà Test ${RUN}`, price: 45000, category: "MON_NUOC" };
    assert.equal((await call("POST", "/products", { token: staff.accessToken, body })).status, 403);
    const created = await call("POST", "/products", { token: admin.accessToken, body });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.isAvailable, true);
    assert.equal((await call("POST", "/products", { token: admin.accessToken, body: { ...body, name: body.name.toUpperCase() } })).status, 409);
    assert.equal((await call("POST", "/products", { token: admin.accessToken, body: { ...body, name: "X", price: -1 } })).status, 400);

    const upd = await call("PATCH", `/products/${created.body.id}`, { token: admin.accessToken, body: { price: 47000 } });
    assert.equal(upd.body.price, 47000);
    const menu = await call("GET", "/products");
    assert.ok(menu.body.some((p) => p.id === created.body.id && p.price === 47000));

    assert.equal((await call("DELETE", `/products/${created.body.id}`, { token: staff.accessToken })).status, 403);
    assert.equal((await call("DELETE", `/products/${created.body.id}`, { token: admin.accessToken })).status, 204);
    assert.equal((await call("PATCH", `/products/${created.body.id}`, { token: admin.accessToken, body: { price: 1 } })).status, 404);
  });
});

describe("Quên mật khẩu", () => {
  const sha256 = async (s) => {
    const { createHash } = await import("node:crypto");
    return createHash("sha256").update(s).digest("hex");
  };

  test("trả cùng một thông báo dù email có tồn tại hay không", async () => {
    const a = await call("POST", "/auth/forgot-password", { body: { email: email("customer") } });
    const b = await call("POST", "/auth/forgot-password", { body: { email: email("khong-ton-tai") } });
    assert.equal(a.status, 200);
    assert.equal(b.status, 200);
    assert.equal(a.body.message, b.body.message);
    const row = await db.query('SELECT "resetPasswordTokenHash" FROM users WHERE email = $1', [email("customer")]);
    assert.ok(row.rows[0].resetPasswordTokenHash, "đã tạo mã đặt lại");
  });

  test("đặt lại mật khẩu: đăng xuất mọi thiết bị, mã chỉ dùng một lần, mã hết hạn bị từ chối", async () => {
    await createUser("reset");
    const session = await login("reset", "phone");
    const raw = "a".repeat(64);
    await db.query(
      `UPDATE users SET "resetPasswordTokenHash" = $1, "resetPasswordExpires" = (now() at time zone 'UTC') + interval '10 minutes' WHERE email = $2`,
      [await sha256(raw), email("reset")],
    );
    const ok = await call("POST", "/auth/reset-password", { body: { token: raw, newPassword: "mat-khau-moi-123" } });
    assert.equal(ok.status, 200);
    assert.equal((await call("GET", "/auth/me", { token: session.accessToken })).status, 401, "phiên cũ bị đăng xuất");
    assert.equal((await call("POST", "/auth/login", { body: { email: email("reset"), password: PASSWORD } })).status, 401);
    assert.equal((await call("POST", "/auth/login", { body: { email: email("reset"), password: "mat-khau-moi-123" } })).status, 200);
    assert.equal((await call("POST", "/auth/reset-password", { body: { token: raw, newPassword: "abcdef" } })).status, 400, "mã đã dùng");

    const expired = "b".repeat(64);
    await db.query(
      `UPDATE users SET "resetPasswordTokenHash" = $1, "resetPasswordExpires" = (now() at time zone 'UTC') - interval '1 minute' WHERE email = $2`,
      [await sha256(expired), email("reset")],
    );
    assert.equal((await call("POST", "/auth/reset-password", { body: { token: expired, newPassword: "abcdef" } })).status, 400);
  });
});

describe("Hệ thống", () => {
  test("health check báo database đang chạy", async () => {
    const r = await call("GET", "/health");
    assert.equal(r.status, 200);
    assert.equal(r.body.database, "up");
  });

  test("có header bảo mật", async () => {
    const res = await fetch(`${API}/health`);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  });
});
