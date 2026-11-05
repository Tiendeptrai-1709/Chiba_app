import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { MailService } from "../services/mail.service";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { JwtRefreshStrategy } from "../strategies/jwt-refresh.strategy";
import { UserModule } from "./user.module";

@Module({
  // Secret/thời hạn được truyền khi ký trong AuthService (access và refresh dùng secret riêng).
  imports: [PassportModule, JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
