// create-user.dto.ts

import { IsEmail, Matches, MinLength } from "class-validator";
import { Role } from "src/generated/prisma";

export class CreateUserDto {
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
  fullName: string;
  role?: Role;
}
