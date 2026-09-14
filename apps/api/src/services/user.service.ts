
import { Injectable } from "@nestjs/common";
import { DeleteProfileDto } from "src/dto/auth.dto";
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

  async findAllUser() {
    return this.prisma.user.findMany({
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
    } if(deleteProfileDto.typeDel == "HARD") {
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
