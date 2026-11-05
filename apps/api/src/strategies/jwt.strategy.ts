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

  // Kiểm tra phiên còn tồn tại: đăng xuất / bị khóa / bị xóa là token hết hiệu lực ngay,
  // không phải chờ access token hết hạn.
  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload.sid) throw new UnauthorizedException("Phiên đăng nhập không hợp lệ");
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      select: {
        userId: true,
        expiresAt: true,
        user: { select: { id: true, email: true, role: true, isSuspended: true } },
      },
    });
    if (!session || session.userId !== payload.sub || session.expiresAt < new Date() || session.user.isSuspended) {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ");
    }
    const { user } = session;
    return { id: user.id, email: user.email, role: user.role, sessionId: payload.sid };
  }
}
