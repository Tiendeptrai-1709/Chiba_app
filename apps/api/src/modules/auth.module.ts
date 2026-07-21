import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "src/controllers/auth.controller";
import { AuthService } from "src/services/auth.service";
import { JwtRefreshStrategy } from "src/strategies/jwt-refresh.strategy";
import { JwtStrategy } from "src/strategies/jwt.strategy";

@Module({
    imports:[JwtModule.register({})],
    controllers:[AuthController],
    providers:[AuthService, JwtStrategy, JwtRefreshStrategy]
})

export class AuthModule{}