import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload, RefreshUser } from "../types/jwt-payload";
import { getRequiredEnv } from "../utils/env";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getRequiredEnv("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    });
  }

  // Trả kèm refresh token gốc để AuthService so khớp với hash của phiên trong DB.
  validate(req: Request, payload: JwtPayload): RefreshUser {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!refreshToken || !payload.sid) throw new UnauthorizedException("Thiếu refresh token");
    return { id: payload.sub, email: payload.email, role: payload.role, sessionId: payload.sid, refreshToken };
  }
}
