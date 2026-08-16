import { SetMetadata } from "@nestjs/common";
import { Role } from "src/generated/prisma";

export const ROLES_KEY = "roles";

/**
 * Đánh dấu 1 route/controller chỉ cho phép các role được liệt kê truy cập.
 * Dùng chung với JwtAuthGuard + RolesGuard.
 *
 * Ví dụ:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(Role.ADMIN, Role.STAFF)
 *   @Post("create")
 *   createProduct(...) {}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);