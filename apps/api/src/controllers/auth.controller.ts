import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { LoginDto } from "src/dto/login.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { JwtRefreshGuard } from "src/guards/jwt-refresh.guard";
import { AuthService } from "src/services/auth.service";

@Controller("auth")
export class AuthController{
    constructor(private readonly authService: AuthService){}

    @Post("login")
    login(@Body() dto:LoginDto){
        return this.authService.login(dto.email, dto.password)
    }

    //Gọi middleware Guard JwtRefreshGuard
    @UseGuards(JwtRefreshGuard)
    @Post("refresh")
    refresh(@Req() req:Request){
        const {userId, refreshToken} = req.user
        return this.authService.refreshTokens(userId, refreshToken)
    }

    @UseGuards(JwtAuthGuard)
    @Post("logout")
    logout(@Req() req:Request){
        const {userId} = req.user;
        return this.authService.logout(userId)
    }
}