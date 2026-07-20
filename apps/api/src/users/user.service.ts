
import { CreateUserDto } from "./dto/create-user.dto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserSevice {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const existedUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if(existedUser){
        throw new BadRequestException("Email already exists")
    }

    const hashPassword = await hash(createUserDto.password, 10);
    return this.prisma.user.create({
        data:{
            email: createUserDto.email,
            password: hashPassword,
            fullName: createUserDto.fullName,
            phone: createUserDto.phone,
            address: createUserDto.address,
            customerCode: createUserDto.customerCode,

            zenPoints:0,

            role: createUserDto.role ?? "CUSTOMER",

            isSuspended:false,
        }
    })
  }

  async findAllUser(){
    return this.prisma.user.findMany();
  }
}
