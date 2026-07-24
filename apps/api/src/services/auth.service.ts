import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { compare, compareSync, hash } from "bcryptjs";
import { CreateUserDto } from "src/dto/create-user.dto";
import { LoginDto } from "src/dto/login.dto";
import { MailService } from "./mail.service";
import { createHash, randomBytes } from "crypto";
import { ForgotPasswordDto } from "src/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/dto/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private async generateTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_EXPIRES,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRES,
        },
      ),
    ]);
    // console.log("generate: ", {accessToken, refreshToken})
    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user || user.isDeleted) {
      throw new UnauthorizedException("Tài khoản không tồn tại");
    }

    const passwordMatches = await compare(loginDto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException("Sai mật khẩu");
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    console.log("accessToken: ", tokens);
    // console.log(
    //   "refreshToken: ",
    //   await this.prisma.user.findMany({ where: { hashedRefreshToken } }),
    // );
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async register(createUserDto: CreateUserDto) {
    const existedUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existedUser) {
      throw new BadRequestException("Email đã tồn tại");
    }

    const hashPassword = await hash(createUserDto.password, 10);
    const generateCustomerCode = `CUS-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
    console.log("adas");
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashPassword,
        fullName: createUserDto.fullName,
        customerCode: generateCustomerCode,
        zenPoints: 0,
        role: createUserDto.role ?? "CUSTOMER",
        isSuspended: false,
      },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException("Truy cập bị từ chối");
    }

    const refreshTokenMatches = await compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException("Truy cập bị từ chối");
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    const failMessage = {
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
    };
    const successMessage = { message: "Đã gửi tới email thành công" };

    if (!user) return failMessage;

    const rawToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    await this.mailService.sendResetPasswordEmamil(user.email, resetLink);
    return successMessage.message;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const hashedToken = createHash("sha256")
      .update(resetPasswordDto.token)
      .digest("hex");

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException("Token không hợp lệ hoặc hết hạn");
    }

    const hashedPassword = await hash(resetPasswordDto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        hashedRefreshToken: null,
      },
    });

    return { message: "Đặt lại mật khẩu thành công" };
  }
}
