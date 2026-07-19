# My Turbo App

Monorepo quản lý bằng **Turborepo**, gồm:
- `apps/web` — **Next.js** (frontend, port `3000`)
- `apps/api` — **NestJS** (backend, port `3001`)

## Cài đặt

```bash
npm install
```

## Chạy dev (chạy song song cả 2 app)

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001

Turbo sẽ tự chạy `dev` cho cả `web` và `api` cùng lúc, log hiển thị theo từng package.

## Build production

```bash
npm run build
```

Sau khi build:
```bash
npm run start --workspace=api   # chạy backend đã build (dist/main.js)
npm run start --workspace=web   # chạy frontend đã build
```

## Cấu trúc dự án

```
my-turbo-app/
├── apps/
│   ├── web/                # Next.js (App Router, TypeScript)
│   │   └── src/app/
│   └── api/                 # NestJS (TypeScript)
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── app.controller.ts
│           └── app.service.ts
├── turbo.json               # cấu hình pipeline của Turborepo
└── package.json              # workspaces gốc (npm workspaces)
```

## Ghi chú

- Frontend gọi thẳng `http://localhost:3001` (CORS đã bật sẵn trong `main.ts`).
- `next.config.ts` cũng có sẵn `rewrites()` để proxy `/api/*` sang backend nếu bạn muốn gọi qua đường dẫn tương đối thay vì URL đầy đủ.
- Muốn thêm package dùng chung (types, ui components...) → tạo thư mục `packages/` và thêm vào `workspaces` trong `package.json` gốc (đã cấu hình sẵn để nhận `packages/*`).
- Muốn thêm database (Prisma, TypeORM...) cho NestJS thì cài trực tiếp vào `apps/api`.

## Thêm package mới vào 1 workspace cụ thể

```bash
npm install <package> --workspace=web
npm install <package> --workspace=api
```
