import { Role } from "../generated/prisma";

// OWNER có mọi quyền của ADMIN.
export const isManager = (role: Role | string) => role === Role.ADMIN || role === Role.OWNER;

// Nhân sự cửa hàng: xử lý đơn, quét QR, kho món.
export const isStaffMember = (role: Role | string) => role === Role.STAFF || isManager(role);
