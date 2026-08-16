// create-user.dto.ts

import { IsEmail, IsString, Matches, MinLength } from "class-validator";
import { Role } from "src/generated/prisma";

export class RegisterDto {
  @IsEmail(
    {},
    {
      message: "Email không hợp lệ ",
    },
  )
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: "Chỉ chấp nhận @gmail ",
  })
  email: string;

  @MinLength(6, {
    message: "Mật khẩu tối thiểu 6 kí tự ",
  })
  password: string;

  @IsString()
  fullName: string;

  role?: Role;
}
