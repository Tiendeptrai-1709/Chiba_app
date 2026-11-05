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

let customer, staff, admin, owner;
let originalStock = [];

before(async () => {
  const health = await fetch(`${API}/health`).catch(() => null);
  assert.ok(health?.ok, `API chưa chạy tại ${API} — hãy bật server trước (npm run start:local)`);
  await db.connect();
  // Lưu tồn kho thật để trả lại sau khi test, và đặt số lớn để test không làm hết hàng
  originalStock = (await db.query("SELECT id, stock FROM products")).rows;
  await db.query("UPDATE products SET stock = 1000");
  customer = await createUser("customer");
  staff = await createUser("staff", "STAFF");
  admin = await createUser("admin", "ADMIN");
  owner = await createUser("owner", "OWNER");
});

after(async () => {
  // Dọn dữ liệu test, trả menu về trạng thái ban đầu
  await db.query(`DELETE FROM orders WHERE "userId" IN (SELECT id FROM users WHERE email LIKE 'e2e\\_%@test.local')`);
  await db.query(`DELETE FROM users WHERE email LIKE 'e2e\\_%@test.local'`);
  await db.query(`DELETE FROM staff_invites WHERE email LIKE 'e2e\\_%@test.local'`);
  await db.query(`DELETE FROM products WHERE name LIKE 'E2E %'`);
  await db.query(`DELETE FROM menu_groups WHERE name LIKE 'E2E %'`);
  for (const { id, stock } of originalStock) {
    await db.query("UPDATE products SET stock = $1 WHERE id = $2", [stock, id]);
  }
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

  test("nhân viên đặt số lượng = 0 → khách không đặt được", async () => {
    const setStock = (stock, token = staff.accessToken) => call("PATCH", "/products/p7/stock", { token, body: { stock } });
    assert.equal((await setStock(0, customer.accessToken)).status, 403);
    assert.equal((await setStock(-1)).status, 400);
    const r0 = await setStock(0);
    assert.equal(r0.status, 200);
    assert.equal(r0.body.isAvailable, false);
    const menu = await call("GET", "/products");
    assert.equal(menu.body.find((p) => p.id === "p7").isAvailable, false);
    assert.equal((await call("POST", "/orders", { token: customer.accessToken, body: order })).status, 409);
    await setStock(1000);
  });

  test("đặt món trừ kho (cả topping theo số ly), không đặt quá số còn lại, hủy đơn trả lại kho", async () => {
    const stockOf = async (id) => (await db.query("SELECT stock FROM products WHERE id = $1", [id])).rows[0].stock;
    await call("PATCH", "/products/p7/stock", { token: staff.accessToken, body: { stock: 3 } });
    await call("PATCH", "/products/t3/stock", { token: staff.accessToken, body: { stock: 10 } });
    const base = { orderType: "STORE", paymentMethod: "CASH" };
    const drink = (quantity) => ({ productId: "p7", quantity, toppingIds: ["t3"], sugar: 100, ice: "NORMAL" });

    const a = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, items: [drink(2)] } });
    assert.equal(a.status, 201);
    assert.equal(await stockOf("p7"), 1, "trà sữa: 3 - 2");
    assert.equal(await stockOf("t3"), 8, "topping: 10 - 2 ly");

    const tooMany = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, items: [drink(2)] } });
    assert.equal(tooMany.status, 409);
    assert.match(tooMany.body.message, /chỉ còn 1/);
    // Cùng món ở 2 dòng giỏ được cộng dồn
    const split = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, items: [drink(1), { ...drink(1), sugar: 50 }] } });
    assert.equal(split.status, 409);
    assert.equal(await stockOf("p7"), 1, "đơn bị từ chối không trừ kho");

    const last = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, items: [drink(1)] } });
    assert.equal(last.status, 201);
    const menu = await call("GET", "/products");
    assert.equal(menu.body.find((p) => p.id === "p7").isAvailable, false, "về 0 → hết hàng");

    await call("POST", `/orders/${a.body.id}/cancel`, { token: customer.accessToken });
    assert.equal(await stockOf("p7"), 2, "khách hủy → trả lại 2");
    assert.equal(await stockOf("t3"), 9, "topping trả lại 2");
    await call("PATCH", `/orders/${last.body.id}/status`, { token: staff.accessToken, body: { status: "CANCELLED" } });
    assert.equal(await stockOf("p7"), 3, "nhân viên hủy → trả lại 1");
    await db.query("UPDATE products SET stock = 1000 WHERE id IN ('p7','t3')");
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

describe("Thanh toán & báo đơn tức thì", () => {
  const base = { items: [{ productId: "b3", quantity: 1 }], orderType: "STORE" };

  test("xác nhận đã nhận tiền: chỉ nhân viên, bỏ xác nhận được; tiền mặt tự đánh dấu khi hoàn thành", async () => {
    const transfer = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, paymentMethod: "BANK_TRANSFER" } });
    assert.equal(transfer.body.paidAt, null);
    const pay = (paid, token = staff.accessToken) =>
      call("PATCH", `/orders/${transfer.body.id}/payment`, { token, body: { paid } });
    assert.equal((await pay(true, customer.accessToken)).status, 403);
    const ok = await pay(true);
    assert.equal(ok.status, 200);
    assert.ok(ok.body.paidAt);
    assert.equal((await pay(false)).body.paidAt, null, "bỏ xác nhận khi bấm nhầm");

    const cash = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, paymentMethod: "CASH" } });
    const step = (status) => call("PATCH", `/orders/${cash.body.id}/status`, { token: staff.accessToken, body: { status } });
    await step("PREPARING");
    await step("READY");
    const done = await step("COMPLETED");
    assert.ok(done.body.paidAt, "đơn tiền mặt hoàn thành = đã thu tiền");

    await call("PATCH", `/orders/${transfer.body.id}/status`, { token: staff.accessToken, body: { status: "CANCELLED" } });
    assert.equal((await pay(true)).status, 400, "đơn đã hủy không xác nhận thanh toán");
  });

  test("nhân viên nhận sự kiện đơn mới ngay; khách chỉ nhận sự kiện đơn của mình", async () => {
    const listen = async (path, token) => {
      const ac = new AbortController();
      const res = await fetch(API + path, { headers: { authorization: `Bearer ${token}` }, signal: ac.signal });
      assert.equal(res.headers.get("content-type")?.split(";")[0], "text/event-stream");
      const events = [];
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      (async () => {
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            for (const m of buf.matchAll(/event: (order\.\w+)\n(?:id: .*\n)?data: (.*)\n/g)) events.push({ type: m[1], ...JSON.parse(m[2]) });
            buf = buf.slice(buf.lastIndexOf("\n\n") + 2);
          }
        } catch {
          // kết nối bị đóng khi gọi stop() — bình thường
        }
      })();
      return { events, stop: () => ac.abort() };
    };
    assert.equal((await fetch(`${API}/orders/stream`, { headers: { authorization: `Bearer ${customer.accessToken}` } })).status, 403);

    const other = await login("other");
    const staffFeed = await listen("/orders/stream", staff.accessToken);
    const mineFeed = await listen("/orders/me/stream", customer.accessToken);
    const otherFeed = await listen("/orders/me/stream", other.accessToken);
    await new Promise((r) => setTimeout(r, 300));

    const started = Date.now();
    const o = await call("POST", "/orders", { token: customer.accessToken, body: { ...base, paymentMethod: "CASH" } });
    while (!staffFeed.events.some((e) => e.orderId === o.body.id) && Date.now() - started < 3000) {
      await new Promise((r) => setTimeout(r, 50));
    }
    await call("PATCH", `/orders/${o.body.id}/status`, { token: staff.accessToken, body: { status: "CANCELLED" } });
    await new Promise((r) => setTimeout(r, 300));
    [staffFeed, mineFeed, otherFeed].forEach((f) => f.stop());

    const forOrder = (f) => f.events.filter((e) => e.orderId === o.body.id).map((e) => `${e.type}:${e.status}`);
    assert.deepEqual(forOrder(staffFeed), ["order.created:PENDING", "order.updated:CANCELLED"]);
    assert.ok(Date.now() - started < 3000 + 1000, "sự kiện đến trong vài giây");
    assert.deepEqual(forOrder(mineFeed), ["order.created:PENDING", "order.updated:CANCELLED"]);
    assert.deepEqual(forOrder(otherFeed), [], "khách khác không nhận được đơn của người khác");
  });
});

describe("Admin quản lý món", () => {
  test("thêm, sửa, xóa món; nhân viên không được; chặn trùng tên", async () => {
    const body = { name: `E2E Trà Test ${RUN}`, price: 45000, category: "MON_NUOC" };
    assert.equal((await call("POST", "/products", { token: staff.accessToken, body })).status, 403);
    const created = await call("POST", "/products", { token: admin.accessToken, body });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.stock, 0);
    assert.equal(created.body.isAvailable, false, "món mới chưa nhập số lượng = hết hàng");
    const withStock = await call("POST", "/products", { token: admin.accessToken, body: { ...body, name: `${body.name} 2`, stock: 20 } });
    assert.equal(withStock.body.isAvailable, true);
    assert.equal((await call("DELETE", `/products/${withStock.body.id}`, { token: admin.accessToken })).status, 204);
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

describe("Danh mục món & thống kê", () => {
  // Ngày hôm nay theo giờ Việt Nam
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const stats = (query = "", token = admin.accessToken) =>
    call("GET", `/stats/menu?from=${today}&to=${today}${query}`, { token });

  test("admin thêm, đổi tên, sắp xếp, xóa danh mục; xóa danh mục thì món chuyển về chưa phân danh mục", async () => {
    const name = `E2E Nhóm ${RUN}`;
    assert.equal((await call("POST", "/menu-groups", { token: staff.accessToken, body: { name } })).status, 403);
    const g = await call("POST", "/menu-groups", { token: admin.accessToken, body: { name } });
    assert.equal(g.status, 201, JSON.stringify(g.body));
    assert.equal(g.body.productCount, 0);
    assert.equal((await call("POST", "/menu-groups", { token: admin.accessToken, body: { name: name.toUpperCase() } })).status, 409);
    assert.equal((await call("POST", "/menu-groups", { token: admin.accessToken, body: { name: "  " } })).status, 400);

    const renamed = await call("PATCH", `/menu-groups/${g.body.id}`, { token: admin.accessToken, body: { name: `${name} mới` } });
    assert.equal(renamed.body.name, `${name} mới`);

    // Gắn món vào danh mục khi tạo; danh mục không tồn tại bị từ chối
    const productBody = { name: `E2E Món nhóm ${RUN}`, price: 30000, category: "MON_NUOC" };
    assert.equal((await call("POST", "/products", { token: admin.accessToken, body: { ...productBody, groupId: "khong-co" } })).status, 400);
    const product = await call("POST", "/products", { token: admin.accessToken, body: { ...productBody, groupId: g.body.id } });
    assert.equal(product.body.groupId, g.body.id);
    const list = await call("GET", "/menu-groups");
    assert.equal(list.body.find((x) => x.id === g.body.id).productCount, 1);

    // Sắp xếp: phải gửi đủ danh mục
    const ids = list.body.map((x) => x.id);
    assert.equal((await call("PATCH", "/menu-groups/reorder", { token: admin.accessToken, body: { ids: ids.slice(1) } })).status, 400);
    const reordered = await call("PATCH", "/menu-groups/reorder", {
      token: admin.accessToken,
      body: { ids: [g.body.id, ...ids.filter((id) => id !== g.body.id)] },
    });
    assert.equal(reordered.status, 200);
    assert.equal(reordered.body[0].id, g.body.id);

    assert.equal((await call("DELETE", `/menu-groups/${g.body.id}`, { token: admin.accessToken })).status, 204);
    const menu = await call("GET", "/products");
    assert.equal(menu.body.find((p) => p.id === product.body.id).groupId, null);
    // Bỏ danh mục của món bằng null
    assert.equal((await call("PATCH", `/products/${product.body.id}`, { token: admin.accessToken, body: { groupId: null } })).status, 200);
    // Trả lại thứ tự ban đầu
    await call("PATCH", "/menu-groups/reorder", { token: admin.accessToken, body: { ids: ids.filter((id) => id !== g.body.id) } });
  });

  test("thống kê theo danh mục: chỉ tính đơn hoàn thành, topping tính riêng, lọc theo chi nhánh", async () => {
    assert.equal((await stats("", staff.accessToken)).status, 403);
    assert.equal((await call("GET", "/stats/menu?from=abc&to=2026-01-01", { token: admin.accessToken })).status, 400);
    assert.equal((await call("GET", `/stats/menu?from=${today}&to=2020-01-01`, { token: admin.accessToken })).status, 400);

    const before = (await stats()).body;
    const beforeStore = (await stats("&storeId=s2")).body;
    const beforeOther = (await stats("&storeId=s3")).body;
    const group = (s, id) => s.groups.find((g) => g.groupId === id) ?? { quantity: 0, revenue: 0 };

    // 2 ly Phin Sữa Đá (Cà phê, 35k) + topping Thạch Đào (10k) mỗi ly, nhận tại chi nhánh s2
    const r = await call("POST", "/orders", {
      token: customer.accessToken,
      body: {
        items: [{ productId: "p4", quantity: 2, toppingIds: ["t1"] }],
        orderType: "STORE",
        paymentMethod: "CASH",
        storeId: "s2",
      },
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    // Chưa hoàn thành → chưa tính
    assert.equal(group((await stats()).body, "g_cafe").quantity, group(before, "g_cafe").quantity);

    for (const status of ["PREPARING", "READY", "COMPLETED"]) {
      assert.equal((await call("PATCH", `/orders/${r.body.id}/status`, { token: staff.accessToken, body: { status } })).status, 200);
    }

    const after = (await stats()).body;
    assert.equal(after.orderCount, before.orderCount + 1);
    assert.equal(after.revenue, before.revenue + r.body.total);
    assert.equal(group(after, "g_cafe").quantity, group(before, "g_cafe").quantity + 2);
    assert.equal(group(after, "g_cafe").revenue, group(before, "g_cafe").revenue + 70000);
    assert.equal(group(after, "g_topping").quantity, group(before, "g_topping").quantity + 2);
    assert.equal(group(after, "g_topping").revenue, group(before, "g_topping").revenue + 20000);
    const p4 = after.products.find((p) => p.productId === "p4");
    assert.equal(p4.groupName, "Cà phê");

    const afterStore = (await stats("&storeId=s2")).body;
    assert.equal(afterStore.orderCount, beforeStore.orderCount + 1);
    assert.equal((await stats("&storeId=s3")).body.orderCount, beforeOther.orderCount, "chi nhánh khác không đổi");
  });
});

describe("Chủ quán (OWNER) & phân quyền", () => {
  const changeRole = (id, role, token) => call("PATCH", `/users/${id}/role`, { token, body: { role } });

  test("OWNER có mọi quyền của ADMIN", async () => {
    assert.equal((await call("GET", "/points", { token: owner.accessToken })).status, 200);
    assert.equal((await call("GET", "/staff-invites", { token: owner.accessToken })).status, 200);
    assert.equal((await call("PATCH", "/products/b5/stock", { token: owner.accessToken, body: { stock: 1000 } })).status, 200);
  });

  test("admin cũng quét QR tích điểm được", async () => {
    const r = await call("POST", "/points/store-earn", {
      token: admin.accessToken,
      body: { customerCode: customer.user.customerCode, billAmount: 20000 },
    });
    assert.equal(r.status, 201);
    await call("POST", "/points/adjust", {
      token: admin.accessToken,
      body: { userId: customer.user.id, points: -2, type: "ADMIN_ADJUST", description: "Trả lại sau test" },
    });
  });

  test("chỉ OWNER thăng cấp: khách → nhân viên → admin → hạ về khách", async () => {
    const target = await createUser("promote");
    const id = target.user.id;
    assert.equal((await changeRole(id, "STAFF", admin.accessToken)).status, 403, "admin không được");
    assert.equal((await changeRole(id, "STAFF", staff.accessToken)).status, 403, "nhân viên không được");

    const s = await changeRole(id, "STAFF", owner.accessToken);
    assert.equal(s.status, 200);
    assert.equal(s.body.role, "STAFF");
    // Quyền mới có hiệu lực ngay, không cần đăng nhập lại
    assert.equal((await call("GET", "/orders", { token: target.accessToken })).status, 200);

    assert.equal((await changeRole(id, "ADMIN", owner.accessToken)).body.role, "ADMIN");
    assert.equal((await call("GET", "/points", { token: target.accessToken })).status, 200);

    assert.equal((await changeRole(id, "CUSTOMER", owner.accessToken)).body.role, "CUSTOMER");
    assert.equal((await call("GET", "/orders", { token: target.accessToken })).status, 403);
  });

  test("không phong OWNER, không đổi OWNER, không tự đổi mình", async () => {
    const target = await createUser("nope");
    assert.equal((await changeRole(target.user.id, "OWNER", owner.accessToken)).status, 400);
    assert.equal((await changeRole(owner.user.id, "CUSTOMER", owner.accessToken)).status, 400, "tự đổi mình");
    await createUser("owner2", "OWNER");
    const owner2 = await db.query("SELECT id FROM users WHERE email = $1", [email("owner2")]);
    assert.equal((await changeRole(owner2.rows[0].id, "CUSTOMER", owner.accessToken)).status, 403, "đổi OWNER khác");
  });

  test("admin không tự tạo được tài khoản Admin; OWNER thì được", async () => {
    const body = (name) => ({ email: email(name), password: PASSWORD, fullName: name, role: "ADMIN" });
    assert.equal((await call("POST", "/users", { token: admin.accessToken, body: body("byadmin") })).status, 403);
    assert.equal((await call("POST", "/users", { token: owner.accessToken, body: body("byowner") })).status, 201);
    assert.equal(
      (await call("POST", "/users", { token: owner.accessToken, body: { ...body("x"), role: "OWNER" } })).status,
      400,
    );
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

  test("đường dẫn chứa ký tự rỗng bị từ chối 400 (không làm lỗi server)", async () => {
    assert.equal((await call("GET", "/orders/x%00", { token: staff.accessToken })).status, 400);
    assert.equal((await call("GET", "/users/by-code/Z1%00", { token: staff.accessToken })).status, 400);
  });

  test("có header bảo mật", async () => {
    const res = await fetch(`${API}/health`);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  });
});
