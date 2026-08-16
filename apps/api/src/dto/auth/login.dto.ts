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
  @MinLength(6,{
    message:"Mật khẩu tối thiểu 6 kí tự"
  })
  password: string;
}