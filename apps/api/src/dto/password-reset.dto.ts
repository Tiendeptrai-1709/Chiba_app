import { Transform } from "class-transformer";
import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class ForgotPasswordDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @Length(64, 64, { message: "Liên kết đặt lại mật khẩu không hợp lệ" })
  @Matches(/^[a-f0-9]+$/, { message: "Liên kết đặt lại mật khẩu không hợp lệ" })
  token: string;

  @IsString()
  @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
  @MaxLength(72, { message: "Mật khẩu tối đa 72 ký tự" })
  newPassword: string;
}
