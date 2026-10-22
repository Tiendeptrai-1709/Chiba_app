import { Injectable, NotFoundException } from "@nestjs/common";
import { DeleteProfileDto } from "src/dto/auth.dto";
import { Role } from "src/generated/prisma";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserSevice {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        customerCode: true,
        zenPoints: true,
        role: true,
        isSuspended: true,
        createdAt: true,
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }

    return user;
  }

  async updateUserPoint(id:string, zenPoints:number){
    return this.prisma.user.update({
      where: {
        id,
      },
      data:{
        zenPoints
      },
    });
  }

  async getAllCustomers() {
    return this.prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        customerCode: true,
        zenPoints: true,
        role: true,
        isSuspended: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async deleteProfile(deleteProfileDto: DeleteProfileDto, userId: string) {
    // console.log("type: ",typeof(typeDel))
    if (deleteProfileDto.typeDel == "SOFT") {
      return this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }
    if (deleteProfileDto.typeDel == "HARD") {
      return this.prisma.user.delete({ where: { id: userId } });
    }
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });
  }
}
