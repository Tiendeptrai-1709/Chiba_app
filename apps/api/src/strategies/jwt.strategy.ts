import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

//Cách xác thực JWT bằng Passport trong NestJS
//Passport là middleware authentication
//ExtractJwt.fromAuthHeaderAsBearerToken giúp xác định jwt token sẽ nằm trong Authorization: Bearer ......
//ignoreExpiration kiểm tra xem token hết hạn chưa
//secretOrKey kiểm tra secret key

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

// validate sẽ kiểm tra nếu jwt hợp lệ sẽ tiến hành giải mã, sau đó Passport sẽ tự gán return req.user
  async validate(payload: { sub: string; email: string; role: string }) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
