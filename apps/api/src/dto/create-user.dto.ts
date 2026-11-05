import { IsEnum, IsOptional } from "class-validator";
import { Role } from "../generated/prisma";
import { RegisterDto } from "./register.dto";

// DTO dành cho ADMIN tạo tài khoản (ví dụ tạo nhân viên) — được phép chọn role.
export class CreateUserDto extends RegisterDto {
  @IsOptional()
  @IsEnum(Role, { message: "Role không hợp lệ" })
  role?: Role;
}
