import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";
import { AuthUser, JwtPayload } from "../types/jwt-payload";
import { getRequiredEnv } from "../utils/env";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getRequiredEnv("JWT_ACCESS_SECRET"),
    });
  }

  // Kiểm tra lại DB để token của user đã bị xóa/tạm ngưng không dùng được nữa.
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isSuspended: true },
    });
    if (!user || user.isSuspended) {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ");
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
