import { MinLength } from "class-validator";

export class ResetPasswordDto {
  token: string;

  @MinLength(6, {
    message: "Mật khẩu tối thiểu 6 kí tự",
  })
  newPassword: string;
}
