import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "../types/jwt-payload";
import { getRequiredEnv } from "../utils/env";
import { PublicUser, UserService } from "./user.service";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: PublicUser;
}

const INVALID_CREDENTIALS = "Sai tài khoản hoặc mật khẩu";
const SESSION_EXPIRED = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";

@Injectable()
export class AuthService {
  private readonly accessSecret = getRequiredEnv("JWT_ACCESS_SECRET");
  private readonly refreshSecret = getRequiredEnv("JWT_REFRESH_SECRET");
  private readonly accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
  private readonly refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
  // Hash giả để so sánh khi email không tồn tại → thời gian phản hồi như nhau.
  private dummyHashPromise?: Promise<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Đăng ký công khai luôn là CUSTOMER.
    const user = await this.userService.createUser({ ...dto, role: undefined });
    const tokens = await this.issueTokens(user);
    return { user, ...tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const found = await this.userService.findByEmailForAuth(dto.email);
    const passwordOk = await compare(dto.password, found?.password ?? (await this.dummyHash()));
    if (!found || !passwordOk) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    if (found.isSuspended) {
      throw new ForbiddenException("Tài khoản này đang tạm ngưng hoạt động");
    }

    const user = await this.userService.findPublicById(found.id);
    if (!user) throw new UnauthorizedException(INVALID_CREDENTIALS);
    const tokens = await this.issueTokens(user);
    return { user, ...tokens };
  }

  // Xoay vòng refresh token: token cũ bị vô hiệu ngay khi cấp token mới.
  async refresh(userId: string, refreshToken: string): Promise<AuthResponse> {
    const record = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { hashedRefreshToken: true, isSuspended: true },
    });
    if (!record || record.isSuspended || !record.hashedRefreshToken) {
      throw new UnauthorizedException(SESSION_EXPIRED);
    }
    if (!this.matchesHash(refreshToken, record.hashedRefreshToken)) {
      // Token hợp lệ về chữ ký nhưng không khớp DB → có thể bị đánh cắp/dùng lại: thu hồi phiên.
      await this.clearRefreshToken(userId);
      throw new UnauthorizedException(SESSION_EXPIRED);
    }

    const user = await this.userService.findPublicById(userId);
    if (!user) throw new UnauthorizedException(SESSION_EXPIRED);
    const tokens = await this.issueTokens(user);
    return { user, ...tokens };
  }

  async logout(userId: string): Promise<void> {
    await this.clearRefreshToken(userId);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.userService.findPublicById(userId);
    if (!user) throw new UnauthorizedException(SESSION_EXPIRED);
    return user;
  }

  private async issueTokens(user: PublicUser): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn as any,
      }),
      this.jwt.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn as any,
        jwtid: randomUUID(), // đảm bảo mỗi refresh token là duy nhất
      }),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: this.sha256(refreshToken) },
    });
    return { accessToken, refreshToken };
  }

  private clearRefreshToken(userId: string) {
    return this.prisma.user.updateMany({
      where: { id: userId, hashedRefreshToken: { not: null } },
      data: { hashedRefreshToken: null },
    });
  }

  // Dùng SHA-256 thay vì bcrypt: bcrypt chỉ xét 72 byte đầu, mà các JWT
  // của cùng một user có phần đầu giống nhau.
  private sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  private matchesHash(value: string, storedHash: string): boolean {
    const a = Buffer.from(this.sha256(value), "hex");
    const b = Buffer.from(storedHash, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }

  private dummyHash(): Promise<string> {
    this.dummyHashPromise ??= hash(randomUUID(), 10);
    return this.dummyHashPromise;
  }
}
