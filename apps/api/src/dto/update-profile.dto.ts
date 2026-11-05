import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

// User tự cập nhật hồ sơ: chỉ các trường an toàn (không có email/role/zenPoints).
export class UpdateProfileDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Họ tên không được để trống" })
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @Transform(trim)
  @Matches(/^0\d{9}$/, { message: "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0" })
  phone?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  address?: string;
}
