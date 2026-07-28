import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-jwt";

//Cách xác thực JWT bằng Passport trong NestJS
//Passport là middleware authentication
//ExtractJwt.fromAuthHeaderAsBearerToken giúp xác định jwt token sẽ nằm trong Authorization: Bearer ......
//ignoreExpiration kiểm tra xem token hết hạn chưa
//secretOrKey kiểm tra secret key

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor() {
    super({
      jwtFromRequest: (req:Request) => req?.cookies?.refreshToken ?? null,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  //validate refreshToken sẽ tiến hành lấy token ở Authorization: Bearer (refreshToken) để dùng nó để xác thực refreshToken phía database để xin accessToken mới
  async validate(req: Request, payload: { sub: string; email: string }) {
    const refreshToken = req.cookies?.refreshToken;
    return { userId: payload.sub, email: payload.email, refreshToken };
  }
}
