import { IsIn, IsOptional } from "class-validator";
import { Role } from "../generated/prisma";
import { RegisterDto } from "./register.dto";

// Vai trò được gán qua ứng dụng. OWNER chỉ đặt trực tiếp trong database.
export const ASSIGNABLE_ROLES = [Role.CUSTOMER, Role.STAFF, Role.ADMIN] as const;

// DTO dành cho ADMIN/OWNER tạo tài khoản (ví dụ tạo nhân viên).
// Tạo tài khoản ADMIN chỉ OWNER làm được (kiểm tra ở controller).
export class CreateUserDto extends RegisterDto {
  @IsOptional()
  @IsIn(ASSIGNABLE_ROLES, { message: "Role không hợp lệ" })
  role?: Role;
}

export class ChangeRoleDto {
  @IsIn(ASSIGNABLE_ROLES, { message: "Chỉ đổi được thành Khách hàng, Nhân viên hoặc Admin" })
  role: Role;
}
