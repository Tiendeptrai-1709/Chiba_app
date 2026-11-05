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

  test("cộng điểm khi hoàn thành, chỉ một lần", async () => {
    const path = `/orders/${created.id}/status`;
    assert.equal((await call("PATCH", path, { token: staff.accessToken, body: { status: "COMPLETED" } })).status, 400);
    assert.equal((await call("PATCH", path, { token: staff.accessToken, body: { status: "CONFIRMED" } })).status, 200);
    assert.equal((await call("PATCH", path, { token: staff.accessToken, body: { status: "COMPLETED" } })).status, 200);
    assert.equal((await call("PATCH", path, { token: staff.accessToken, body: { status: "COMPLETED" } })).status, 400);
    const me = await call("GET", "/auth/me", { token: customer.accessToken });
    assert.equal(me.body.zenPoints, 15);
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
    assert.equal(history.body.length, 6);
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
