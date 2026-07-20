// create-user.dto.ts

import { Role } from "src/generated/prisma";


export class CreateUserDto {
  email: string;

  password: string;

  fullName: string;

  phone: string;

  address: string;

  customerCode: string;

  role?: Role;
}