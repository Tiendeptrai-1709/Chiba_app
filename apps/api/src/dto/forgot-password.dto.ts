import { IsEmail, Matches } from "class-validator";

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
