import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class LoginDto {
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

  // @IsString()
  @MinLength(6, {
    message: "Mật khẩu tối thiểu 6 kí tự",
  })
  password: string;
}

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

export class ForgotPasswordDto {
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
}

export class DeleteProfileDto {
  typeDel: "HARD" | "SOFT";
}

export class ResetPasswordDto {
  token: string;

  @MinLength(6, {
    message: "Mật khẩu tối thiểu 6 kí tự",
  })
  newPassword: string;
}
