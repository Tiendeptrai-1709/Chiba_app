import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { Role } from "../generated/prisma";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "../types/jwt-payload";
import { durationToMs } from "../utils/duration";
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
const MAX_SESSIONS_PER_USER = 10; // giữ tối đa 10 thiết bị, phiên cũ nhất bị đăng xuất

@Injectable()
export class AuthService {
  private readonly accessSecret = getRequiredEnv("JWT_ACCESS_SECRET");
  private readonly refreshSecret = getRequiredEnv("JWT_REFRESH_SECRET");
  private readonly accessTtlMs = durationToMs(process.env.JWT_ACCESS_EXPIRES_IN ?? "15m");
  private readonly refreshTtlMs = durationToMs(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d");
  // Hash giả để so sánh khi email không tồn tại → thời gian phản hồi như nhau.
  private dummyHashPromise?: Promise<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(dto: RegisterDto, userAgent = ""): Promise<AuthResponse> {
    // Email đã được Admin mời → tài khoản nhân viên; còn lại luôn là khách hàng.
    const invite = await this.prisma.staffInvite.findUnique({ where: { email: dto.email } });
    const user = await this.userService.createUser({ ...dto, role: invite ? Role.STAFF : Role.CUSTOMER });
    if (invite) await this.prisma.staffInvite.deleteMany({ where: { email: dto.email } });
    return { user, ...(await this.startSession(user, userAgent)) };
  }

  async login(dto: LoginDto, userAgent = ""): Promise<AuthResponse> {
    const found = await this.userService.findByEmailForAuth(dto.email);
    const passwordOk = await compare(dto.password, found?.password ?? (await this.dummyHash()));
    if (!found || !passwordOk) throw new UnauthorizedException(INVALID_CREDENTIALS);
    if (found.isSuspended) throw new ForbiddenException("Tài khoản này đang tạm ngưng hoạt động");

    const user = await this.userService.findPublicById(found.id);
    if (!user) throw new UnauthorizedException(INVALID_CREDENTIALS);
    return { user, ...(await this.startSession(user, userAgent)) };
  }

  // Xoay vòng refresh token của ĐÚNG phiên (thiết bị) đó; các thiết bị khác không bị ảnh hưởng.
  async refresh(userId: string, sessionId: string, refreshToken: string): Promise<AuthResponse> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: { select: { isSuspended: true } } },
    });
    if (!session || session.userId !== userId || session.expiresAt < new Date() || session.user.isSuspended) {
      throw new UnauthorizedException(SESSION_EXPIRED);
    }
    if (!this.matchesHash(refreshToken, session.tokenHash)) {
      // Token cũ của phiên này bị dùng lại → có thể đã bị lộ: chỉ thu hồi phiên này.
      await this.prisma.session.deleteMany({ where: { id: sessionId } });
      throw new UnauthorizedException(SESSION_EXPIRED);
    }

    const user = await this.userService.findPublicById(userId);
    if (!user) throw new UnauthorizedException(SESSION_EXPIRED);

    const tokens = await this.signTokens(user, sessionId);
    // Điều kiện theo hash cũ: hai request gia hạn cùng lúc chỉ một cái thắng.
    const { count } = await this.prisma.session.updateMany({
      where: { id: sessionId, tokenHash: session.tokenHash },
      data: {
        tokenHash: this.sha256(tokens.refreshToken),
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      },
    });
    if (count === 0) throw new UnauthorizedException(SESSION_EXPIRED);
    return { user, ...tokens };
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id: sessionId } });
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.userService.findPublicById(userId);
    if (!user) throw new UnauthorizedException(SESSION_EXPIRED);
    return user;
  }

  private async startSession(user: PublicUser, userAgent: string): Promise<AuthTokens> {
    // Dọn phiên hết hạn và giới hạn số thiết bị.
    await this.prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
    const existing = await this.prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { lastUsedAt: "desc" },
      select: { id: true },
      skip: MAX_SESSIONS_PER_USER - 1,
    });
    if (existing.length > 0) {
      await this.prisma.session.deleteMany({ where: { id: { in: existing.map((s) => s.id) } } });
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: "", // điền ngay bên dưới sau khi ký token
        userAgent: userAgent.slice(0, 300),
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      },
    });
    const tokens = await this.signTokens(user, session.id);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { tokenHash: this.sha256(tokens.refreshToken) },
    });
    return tokens;
  }

  private async signTokens(user: PublicUser, sessionId: string): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, sid: sessionId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: Math.floor(this.accessTtlMs / 1000),
      }),
      this.jwt.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: Math.floor(this.refreshTtlMs / 1000),
        jwtid: randomUUID(), // mỗi refresh token là duy nhất
      }),
    ]);
    return { accessToken, refreshToken };
  }

  // SHA-256 thay vì bcrypt: bcrypt chỉ xét 72 byte đầu, mà các JWT
  // của cùng một user có phần đầu giống nhau.
  private sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  private matchesHash(value: string, storedHash: string): boolean {
    if (!storedHash) return false;
    const a = Buffer.from(this.sha256(value), "hex");
    const b = Buffer.from(storedHash, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }

  private dummyHash(): Promise<string> {
    this.dummyHashPromise ??= hash(randomUUID(), 10);
    return this.dummyHashPromise;
  }
}
