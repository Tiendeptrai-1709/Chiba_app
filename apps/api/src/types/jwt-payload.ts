import { Role } from "../generated/prisma";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

// Thông tin user gắn vào request sau khi qua JwtAuthGuard.
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

// Thông tin gắn vào request sau khi qua JwtRefreshGuard.
export interface RefreshUser extends AuthUser {
  refreshToken: string;
}
