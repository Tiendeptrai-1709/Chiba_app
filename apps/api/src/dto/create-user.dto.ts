// create-user.dto.ts

import { Role } from "src/generated/prisma";


export class CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
}