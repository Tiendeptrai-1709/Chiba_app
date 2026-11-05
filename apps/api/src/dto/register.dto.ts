import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

// DTO đăng ký công khai: KHÔNG có `role` để tránh tự nâng quyền.
export class RegisterDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @IsString()
  @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
  @MaxLength(72, { message: "Mật khẩu tối đa 72 ký tự" })
  password: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "Họ tên không được để trống" })
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @Matches(/^0\d{9}$/, { message: "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0" })
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(255)
  address?: string;
}
